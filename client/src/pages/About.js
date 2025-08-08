import React from 'react';
import './About.css';
import reactLogo from '../assets/react.png';
import flaskLogo from '../assets/flask.png';
import lstmLogo from '../assets/lstm.png';
import apiLogo from '../assets/api.png';

function About() {
  return (
    <div className="about-page-wrapper">
      <div className="about-container">
        <h1 className="about-title">About StockSight</h1>
        
        <p className="about-intro">
          In a world where every tick of the stock market matters, StockSight emerges as your personal financial crystal ball.
          Built not just to predict, but to empower, this application is more than just a tool — it's your silent market analyst,
          working behind the scenes 24/7. Whether you're a casual investor or an aspiring Wall Street mind, StockSight gives you
          the foresight to move smart, move early, and move profitably.
        </p>
        
        <p className="about-intro">
          The goal wasn't just prediction — it was intelligent forecasting backed by real-time data and smart deep learning.
          With an intuitive interface and lightning-fast predictions, StockSight blends machine learning elegance with real-world practicality.
        </p>

        <div className="tech-section">

          {/* React Block */}
          <div className="tech-block left">
            <div className="tech-text">
              <h2>React.js</h2>
              <p>
                React forms the cornerstone of the user experience in StockSight. It provides a modular and highly responsive frontend framework that allows for seamless transitions and real-time updates without full page reloads. 
                The component-based structure makes it easy to maintain and scale, especially for future enhancements like user dashboards, saved predictions, or multi-stock comparisons.
              </p>
              <p>
                With the help of hooks and context API, state management becomes clean and predictable. React’s virtual DOM ensures that only the parts of the page that need updating are re-rendered, making the app fast and efficient.
              </p>
            </div>
            <img src={reactLogo} alt="React Logo" className="tech-image large" />
          </div>

          {/* Flask Block */}
          <div className="tech-block right">
            <img src={flaskLogo} alt="Flask Logo" className="tech-image large" />
            <div className="tech-text">
              <h2>Flask</h2>
              <p>
                Flask is the lightweight yet powerful backend framework used to serve StockSight's prediction model. It connects the React frontend to the machine learning model running in Python.
                Whenever a user requests a stock prediction, Flask handles the HTTP request, validates the input, fetches the required data, and routes it through the trained LSTM model.
              </p>
              <p>
                Flask’s simplicity and flexibility allow easy deployment of RESTful APIs. Combined with Python’s ecosystem, it becomes an ideal solution for rapid prototyping and production-ready APIs in machine learning applications.
              </p>
            </div>
          </div>

          {/* LSTM Block */}
          <div className="tech-block left">
            <div className="tech-text">
              <h2>LSTM Model</h2>
              <p>
                LSTM (Long Short-Term Memory) is a type of recurrent neural network designed to handle sequential data — perfect for stock prices. Our LSTM model has been trained to understand time-series patterns and deliver 30-day forecasts based on historical performance.
                It retains important trends while ignoring noise, making predictions more reliable than traditional models.
              </p>
              <p>
                The architecture includes stacked LSTM layers, dropout for regularization, and uses Mean Squared Error as the loss function. It was trained using historical stock data and tested across diverse companies for generalizability.
              </p>
            </div>
            <img src={lstmLogo} alt="LSTM Logo" className="tech-image large" />
          </div>

          {/* API Block */}
          <div className="tech-block right">
            <img src={apiLogo} alt="API Icon" className="tech-image large" />
            <div className="tech-text">
              <h2>External APIs</h2>
              <p>
                The Tiingo API is used to retrieve historical and up-to-date stock data. It provides the essential input for the LSTM model and is known for its accuracy and coverage of global stock markets.
                Every prediction starts by fetching the past few months of data through this API.
              </p>
              <p>
                In future versions, the app can be extended to use other APIs such as Alpha Vantage or Yahoo Finance for broader coverage and redundancy. APIs ensure real-time updates and user-requested stocks are always relevant and timely.
              </p>
            </div>
          </div>

        </div>

        <p className="about-credit">
          Built with ❤️ by <strong>StockSight</strong>
        </p>
      </div>
    </div>
  );
}

export default About;