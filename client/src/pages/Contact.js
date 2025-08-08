import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message submitted!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="page-wrapper">
      <div className="contact-container">
        <h1 className="contact-title">Feedback</h1>
        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="contact-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="contact-input"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            rows="4"
            className="contact-textarea"
          />
          <button type="submit" className="contact-button">
            Send
          </button>
        </form>

        {/* Contact Details Section */}
        <div className="contact-details">
          <h2>Contact Details</h2>
          <div className="contact-info-grid">
            <div className="contact-info-box">
              <h3>Email</h3>
              <p>support@stocksight.ai</p>
            </div>
            <div className="contact-info-box">
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-info-box">
              <h3>Address</h3>
              <p>6th Floor, Tech Hub Tower<br />HiTech City, Hyderabad, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;