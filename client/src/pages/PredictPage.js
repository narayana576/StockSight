import React, { useState } from "react";
import { predictStock } from "../services/api";
import "./PredictPage.css";

const PredictPage = () => {
  const [company, setCompany] = useState("");
  const [forecastPlot, setForecastPlot] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [forecastDates, setForecastDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;

    setError("");
    setForecastPlot(null);
    setForecastList([]);
    setForecastDates([]);
    setIsLoading(true);

    const data = await predictStock(company.trim().toUpperCase());
    setIsLoading(false);
    if (!data) return;

    if (data.error) {
      setError(data.error);
    } else if (data.forecast) {

      const imageUrl = `http://localhost:5001/${data.forecast_plot.replace(/\\/g, "/")}`;
      setForecastPlot(imageUrl);
      setForecastList(data.forecast);

      const today = new Date();
      const dates = data.forecast.map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toDateString();
      });
      setForecastDates(dates);
    } else {
      setError("Unexpected server response");
    }
  };

  const exportCSV = () => {
    let csv = "Day,Date,Price\n";
    forecastList.forEach((price, idx) => {
      csv += `Day ${idx + 1},${forecastDates[idx]},${price.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${company}_forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    
  };

  return (
    <div className="predict-page">
      <h2>Stock Price Prediction</h2>
      <p>Enter the company symbol below to forecast the next 30 days.</p>

      <form className="predict-form" onSubmit={handlePredict}>
        <input
          type="text"
          placeholder="e.g. AAPL"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {forecastPlot && (
        <div className="forecast-plot">
          <h3>30-Day Forecast Plot</h3>
          <img src={forecastPlot} alt="Forecast Plot" />
        </div>
      )}

      {forecastList.length > 0 && (
        <div className="forecast-list-section">
          <div className="forecast-header">
            <h3>Predicted Prices:</h3>
            <div className="export-buttons">
              <button onClick={exportCSV}>📤 Export CSV</button>
              <button onClick={exportPDF}>📝 Export PDF</button>
            </div>
          </div>
          <ul className="forecast-list">
            {forecastList.map((price, idx) => {
              const prev = idx === 0 ? price : forecastList[idx - 1];
              const isUp = price >= prev;
              return (
                <li key={idx} className={isUp ? "up" : "down"}>
                  <span>{isUp ? "📈" : "📉"} Day {idx + 1}:</span>
                  <span> ₹{price.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictPage;