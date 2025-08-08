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
import pandas_datareader.data as web
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)

# === MongoDB Configuration ===
client = MongoClient(os.getenv("MONGO_URI"))
db = client["stock_forecast_db"]
users_collection = db["users"]

# === API Key ===
TIINGO_API_KEY = os.getenv("TIINGO_API_KEY")





# === Error Handlers ===
@app.errorhandler(404)
def handle_404(e):
    return jsonify({"success": False, "message": "Not found"}), 404

@app.errorhandler(405)
def handle_405(e):
    return jsonify({"success": False, "message": "Method not allowed"}), 405

@app.errorhandler(500)
def handle_500(e):
    return jsonify({"success": False, "message": "Internal server error"}), 500

# === Token Auth Middleware ===
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = None
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                token = auth_header

        if not token or len(token) != 64:
            return jsonify({'success': False, 'message': 'Invalid or missing token'}), 401

        return f(*args, **kwargs)
    return decorated

# === Helpers ===
def get_user_by_email(email):
    return users_collection.find_one({"email": email})

# === Auth Routes ===
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json(silent=True) or {}
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()

        if not name or not phone or not email or not password:
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        if get_user_by_email(email):
            return jsonify({'success': False, 'message': 'Email already registered'}), 409

        password_hash = generate_password_hash(password)
        user_data = {
            "name": name,
            "phone": phone,
            "email": email,
            "password_hash": password_hash
        }
        users_collection.insert_one(user_data)
        return jsonify({'success': True, 'message': 'Signup successful!'}), 201
    except Exception as e:
        print(f"❌ Signup Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        user = get_user_by_email(email)

        if user and check_password_hash(user['password_hash'], password):
            token = secrets.token_hex(32)
            return jsonify({'success': True, 'name': user['name'], 'token': token})
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    except Exception as e:
        print(f"❌ Login Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500

# === ML Utility ===
def create_dataset(dataset, time_step=60):
    X, y = [], []
    for i in range(len(dataset) - time_step):
        X.append(dataset[i:i + time_step, 0])
        y.append(dataset[i + time_step, 0])
    return np.array(X), np.array(y)

# === Stock Prediction ===
@app.route('/predict', methods=['POST'])
@token_required
def predict():
    try:
        data = request.get_json(silent=True) or {}
        company = data.get('company', '').strip().upper()
        if not company:
            return jsonify({'error': 'Company symbol is required'}), 400

        end = datetime.datetime.now()
        start = end - datetime.timedelta(days=1000)

        df = web.DataReader(company, "tiingo", start, end, api_key=TIINGO_API_KEY)
        if df.empty:
            return jsonify({'error': 'No data found for the stock.'}), 404

        data_close = df[['close']]
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data_close)

        time_step = 60
        X, y = create_dataset(scaled_data, time_step)
        X = X.reshape(X.shape[0], X.shape[1], 1)

        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
            LSTM(50),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(X, y, epochs=5, batch_size=64, verbose=0)

        temp_input = list(scaled_data[-time_step:])
        forecast = []
        for _ in range(30):
            input_array = np.array(temp_input[-time_step:])
            input_array = input_array.reshape(1, time_step, 1)
            predicted = model.predict(input_array, verbose=0)
            temp_input.append(predicted[0])
            forecast.append(predicted[0])

        forecast = scaler.inverse_transform(forecast).flatten().tolist()

        os.makedirs('static', exist_ok=True)
        plot_filename = f"forecast_plot_{uuid.uuid4().hex}.png"
        plot_path = os.path.join('static', plot_filename)

        plt.figure(figsize=(10, 4))
        plt.plot(forecast, label=f'{company} Forecast')
        plt.title(f'{company} - 30 Day Forecast')
        plt.xlabel('Day')
        plt.ylabel('Predicted Price')
        plt.legend()
        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close()

        return jsonify({
            'forecast': [round(price, 2) for price in forecast],
            'forecast_plot': plot_path
        })

    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# === Run App ===
if __name__ == '__main__':
    app.run(port=5001)