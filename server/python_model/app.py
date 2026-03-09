from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import uuid
import numpy as np
import secrets
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import datetime
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# =========================
# MongoDB Configuration
# =========================
mongo_uri = os.getenv("MONGO_URI")

if mongo_uri:
    client = MongoClient(mongo_uri)
    db = client["stock_forecast_db"]
    users_collection = db["users"]
else:
    users_collection = None


# =========================
# API Key
# =========================
TIINGO_API_KEY = os.getenv("TIINGO_API_KEY")


# =========================
# Error Handlers
# =========================
@app.errorhandler(404)
def handle_404(e):
    return jsonify({"success": False, "message": "Not found"}), 404


@app.errorhandler(405)
def handle_405(e):
    return jsonify({"success": False, "message": "Method not allowed"}), 405


@app.errorhandler(500)
def handle_500(e):
    return jsonify({"success": False, "message": str(e)}), 500


# =========================
# Token Middleware
# =========================
def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        token = None

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except:
                token = auth_header

        if not token or len(token) != 64:
            return jsonify({"success": False, "message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated


# =========================
# Helper
# =========================
def get_user_by_email(email):

    if users_collection is None:
        return None

    return users_collection.find_one({"email": email})


# =========================
# Signup
# =========================
@app.route("/api/signup", methods=["POST"])
def signup():

    if users_collection is None:
        return jsonify({"success": False, "message": "Database not configured"}), 500

    data = request.get_json()

    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")

    if get_user_by_email(email):
        return jsonify({"success": False, "message": "Email already exists"}), 400

    password_hash = generate_password_hash(password)

    users_collection.insert_one({
        "name": name,
        "phone": phone,
        "email": email,
        "password_hash": password_hash
    })

    return jsonify({"success": True, "message": "Signup successful"})


# =========================
# Login
# =========================
@app.route("/api/login", methods=["POST"])
def login():

    if users_collection is None:
        return jsonify({"success": False, "message": "Database not configured"}), 500

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid password"}), 401

    token = secrets.token_hex(32)

    return jsonify({
        "success": True,
        "name": user["name"],
        "email": user["email"],
        "token": token
    })


# =========================
# Dataset Creator
# =========================
def create_dataset(dataset, time_step=60):

    X, y = [], []

    for i in range(len(dataset) - time_step):
        X.append(dataset[i:i + time_step, 0])
        y.append(dataset[i + time_step, 0])

    return np.array(X), np.array(y)


# =========================
# Stock Prediction
# =========================
@app.route("/predict", methods=["POST"])
@token_required
def predict():

    try:

        data = request.get_json()

        if not data or "company" not in data:
            return jsonify({"error": "Company symbol required"}), 400

        company = data.get("company").upper()

        end = datetime.date.today()
        start = end - datetime.timedelta(days=1000)

        url = f"https://api.tiingo.com/tiingo/daily/{company}/prices"

        params = {
            "startDate": start,
            "endDate": end,
            "token": TIINGO_API_KEY
        }

        response = requests.get(url, params=params)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch stock data"}), 500

        stock_data = response.json()

        if not stock_data:
            return jsonify({"error": "No stock data found"}), 404

        closes = [day["close"] for day in stock_data]

        data_close = np.array(closes).reshape(-1, 1)

        scaler = MinMaxScaler()
        scaled_data = scaler.fit_transform(data_close)

        time_step = 60
        X, y = create_dataset(scaled_data, time_step)

        X = X.reshape(X.shape[0], X.shape[1], 1)

        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
            LSTM(50),
            Dense(1)
        ])

        model.compile(optimizer="adam", loss="mse")

        model.fit(X, y, epochs=5, batch_size=64, verbose=0)

        temp_input = list(scaled_data[-time_step:])
        forecast = []

        for i in range(30):

            x_input = np.array(temp_input[-time_step:]).reshape(1, time_step, 1)

            pred = model.predict(x_input, verbose=0)

            temp_input.append(pred[0])

            forecast.append(pred[0])

        forecast = scaler.inverse_transform(forecast).flatten()

        os.makedirs("static", exist_ok=True)

        filename = f"forecast_{uuid.uuid4().hex}.png"
        path = os.path.join("static", filename)

        plt.figure(figsize=(10, 4))
        plt.plot(forecast)
        plt.title(f"{company} Forecast")
        plt.savefig(path)
        plt.close()

        return jsonify({
            "forecast": [round(float(x), 2) for x in forecast],
            "forecast_plot": path
        })

    except Exception as e:

        print("Prediction Error:", str(e))

        return jsonify({"error": str(e)}), 500


# =========================
# Run Server
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)