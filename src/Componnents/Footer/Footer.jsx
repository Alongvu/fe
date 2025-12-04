import React, { useState } from 'react';
import './Footer.css';
import footer_logo from '../Assets/logo_big.png';
import instagram_icon from '../Assets/instagram_icon.png';
import pintester_icon from '../Assets/pintester_icon.png';
import whatsapp_icon from '../Assets/whatsapp_icon.png';
import support_img from '../Assets/support_img.png';
import appstore from '../Assets/app-store.png';
import  playstore from '../Assets/play-store.png';

const Contact = () => {
  const [isSent, setIsSent] = useState(false); // state to check if form is sent

  // const handleSubmit = () => {
  //   setIsSent(true); // Hide form and show thank you message on submit
  // };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Check for empty fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📩 Response:", data);

      if (data.success) {
        setIsSent(true);
      } else {
        alert('❌ Failed to send message!');
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      alert('Could not send message to server!');
    }
  };

  return (
    <div className="contact-page">
      {/* Header Section */}
      <div className="contact-header">
        <img src={footer_logo} alt="Shopper Logo" className="contact-logo" />
        <h1>SHOPPER</h1>
      </div>

      {/* Social Icons */}
      <div className="contact-social">
        <img src={instagram_icon} alt="Instagram" />
        <img src={pintester_icon} alt="Pinterest" />
        <img src={whatsapp_icon} alt="WhatsApp" />
        <img src={support_img} alt="Support" />
      </div>

      {/* Contact Section */}
      <div className="contact-content">
        <h2>
          Contact <span>Shopper 🛍️</span>
        </h2>
        <p>
          Send us a message or visit our store.
          <br /> We are always ready to support you!
        </p>
      </div>

      {/* Show form or thank you message */}
      {!isSent ? (
        <div className="contact-form">
          <h3>Get in touch with Shopper 👋</h3>
          {/* <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <textarea placeholder="Your Message"></textarea> */}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
          ></textarea>

          <button onClick={handleSubmit}>Send Now 🚀</button>
        </div>
      ) : (
        <div className="thankyou-message">
          <h2>🎉 Thank you for contacting us!</h2>
          <p>Shopper will respond to you as soon as possible ❤️</p>
        </div>
      )}
      <div className="app-download">
        <img src={appstore} alt="App Store" />
        <img src={playstore} alt="Play Store" />
      </div>

      {/* Detailed Information */}
      <div className="contact-info">
        <div className="info-section">
          <h3>About Us</h3>
          <p>Shopper is an e-commerce platform specializing in providing the latest fashion trends and styles. We are committed to bringing customers a modern, convenient, and inspiring shopping experience.</p>
        </div>

        <div className="info-section">
          <h3>Products</h3>
          <ul>
            <li>Men's Fashion</li>
            <li>Women's Fashion</li>
            <li>Kid's Fashion</li>
            <li>New Arrivals</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Office</h3>
          <p>Headquarters: 123 Le Van Sy, Tan Binh District, Ho Chi Minh City</p>
          <p>Hotline: 0123 456 789</p>
        </div>

        <div className="info-section">
          <h3>Contact</h3>
          <p>Email: admin@gmail.com</p>
          <p>Phone: 0123456789</p>
          <p>Working Hours: 8:00 AM – 9:00 PM</p>
        </div>
      </div>

    </div>
  );
};

export default Contact;