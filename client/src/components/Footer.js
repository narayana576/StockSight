// Footer.jsx
import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} StockSight. All rights reserved.</p>
        <p>Created for Academic Purposes</p>
      </div>
    </footer>
  );
}

export default Footer;