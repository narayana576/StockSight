import React from "react";
import "./ForecastCard.css";

function ForecastCard({ forecast, plotUrl }) {
  return (
    <div className="forecast-container">
      <h2 className="forecast-title">30-Day Forecast</h2>

      {plotUrl && (
        <img src={plotUrl} alt="Forecast Plot" className="forecast-image" />
      )}

      <div className="forecast-list">
        {forecast.map((price, index) => (
          <div key={index} className="forecast-item">
            Day {index + 1}: ${price.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ForecastCard;