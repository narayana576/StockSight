import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { predictStock } from '../services/api';
import { ClipLoader } from 'react-spinners';
import './Home.css';

function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [forecastPlot, setForecastPlot] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [forecastDates, setForecastDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!company.trim()) return;

    setLoading(true);
    setForecastPlot(null);
    setForecastList([]);
    setForecastDates([]);
    setError('');

    const data = await predictStock(company.trim().toUpperCase());
    setLoading(false);
    if (!data) return;

    if (data.error) {
      setError(data.error);
    } else if (data.forecast) {
      const imageUrl = `http://localhost:5001/${data.forecast_plot.replace(/\\/g, '/')}`;
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
      setError('Unexpected server response');
    }
  };

  const exportCSV = () => {
    let csv = 'Day,Date,Price\n';
    forecastList.forEach((price, idx) => {
      csv += `Day ${idx + 1},${forecastDates[idx]},${price.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}_forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    
  };

  return (
    <div className="home-hero">
      <div className="home-overlay">
        <section className="home-intro">
          <h1 className="home-title">Welcome to StockSight 📊</h1>
          <p className="home-subtitle">
            An AI-powered stock forecasting tool built with deep learning.
          </p>
          <p className="home-description">
            StockSight empowers investors and traders with 30-day stock price forecasts using advanced LSTM neural networks.
            Enter a company symbol below to get started—login required for predictions.
          </p>
        </section>

        <div className="home-card">
          <div className="home-input-group">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company symbol (e.g., AAPL)"
              className="home-input"
              disabled={loading}
            />
            {loading ? (
              <div className="spinner-wrapper">
                <ClipLoader color="#2563eb" size={28} />
              </div>
            ) : (
              <button onClick={handlePredict} className="home-button">
                Predict
              </button>
            )}
          </div>

          {error && <p className="home-error">{error}</p>}

          {forecastPlot && (
            <div className="home-forecast">
              <h2 className="forecast-title">30-Day Forecast Plot</h2>
              <img src={forecastPlot} alt="Forecast Plot" className="forecast-image" />
            </div>
          )}

          {forecastList.length > 0 && (
            <div className="home-forecast-list">
              <div className="forecast-header">
                <h3 className="forecast-title">Predicted Prices:</h3>
                <div className="export-buttons">
                  <button className="export-btn" onClick={exportCSV}>📤 Export CSV</button>
                  <button className="export-btn" onClick={exportPDF}>📝 Export PDF</button>
                </div>
              </div>
              <ul className="forecast-list-grid">
                {forecastList.map((price, index) => {
                  const prev = index === 0 ? price : forecastList[index - 1];
                  const isUp = price >= prev;
                  return (
                    <li key={index} className={`forecast-item ${isUp ? 'up' : 'down'}`}>
                      <span>{isUp ? '📈' : '📉'} Day {index + 1}:</span>
                      <span> ₹{price.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <section className="home-features">
          <div className="feature">🔍 Real-time predictions</div>
          <div className="feature">📈 Powered by LSTM Deep Learning</div>
          <div className="feature">💡 Simple, Fast, Secure</div>
        </section>

        <section className="home-related">
          <h2>How It Works</h2>
          <p>
            Our model collects historical stock price data, applies normalization, and feeds it into a deep LSTM neural network trained for forecasting.
            Once trained, it can make predictions on unseen future values. All predictions are visualized and made interactive.
          </p>
          <h3>Benefits of StockSight</h3>
          <div className="home-benefits">
            <div className="benefit-item">📊 Get a quick overview of future stock trends</div>
            <div className="benefit-item">🧠 Make smarter investment decisions</div>
            <div className="benefit-item">💰 Completely free to use</div>
            <div className="benefit-item">🔎 Built with transparency in mind – no black box</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;