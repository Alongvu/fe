// src/components/Checkout/Checkout.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import PayPalCheckout from "../PayPalCheckout/PayPalCheckout";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { 
  FaShippingFast, 
  FaCreditCard, 
  FaMoneyBillWave,
  FaWallet,
  FaLock,
  FaCheckCircle,
  FaEdit,
  FaArrowRight
} from "react-icons/fa";
import { 
  SiPaypal,
  SiVisa
} from "react-icons/si";

const FALLBACK_USD_VND_RATE = Number(process.env.REACT_APP_USD_VND_RATE) || 24000;

const Checkout = () => {
  const { cartItems, getTotalCartAmount } = useContext(ShopContext);
  const totalUSD = Number(getTotalCartAmount() || 0);
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // New state to track the selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [orderReady, setOrderReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Form handling and helper functions remain unchanged ---
  const handleChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handleSubmitInfo = (e) => {
    e.preventDefault();
    if (Object.keys(cartItems).filter((k) => cartItems[k] > 0).length === 0) {
      alert("🛒 Cart is empty!");
      navigate("/cart");
      return;
    }
    setOrderReady(true);
  };

  const convertUsdToVnd = async (amountUsd) => {
    try {
      const res = await fetch("http://localhost:4000/convert-usd-to-vnd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUSD: amountUsd }),
      });
      if (!res.ok) throw new Error("convert endpoint error");
      const j = await res.json();
      if (j?.amountVND) return Number(j.amountVND);
    } catch (err) {
      console.warn("Could not get exchange rate from server, using fallback:", err.message);
    }
    return Math.round(Number(amountUsd) * FALLBACK_USD_VND_RATE);
  };

  const callPaymentEndpoint = async (path, amountVND) => {
    console.log(`Calling payment endpoint /${path} with amountVND=`, amountVND);
    const res = await fetch(`http://localhost:4000/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountVND }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error(`${path} responded with status ${res.status}`, data);
      throw new Error(data?.message || `Server error ${res.status}`);
    }
    return data;
  };

  // --- Online payment handling functions ---
  const handleMomo = async (amountVND) => {
    try {
      const data = await callPaymentEndpoint("create-momo", amountVND);
      if (data?.payUrl) { window.location.href = data.payUrl; return; }
      if (data?.qrCodeUrl) { window.location.href = data.qrCodeUrl; return; }
      alert("Did not receive MoMo payment link!");
    } catch { alert("Error creating MoMo payment"); }
  };

  const handleVNPay = async (amountVND) => {
    try {
      const data = await callPaymentEndpoint("create-vnpay", amountVND);
      const redirect = data?.url || data?.payUrl || data?.order_url;
      if (redirect) { window.location.href = redirect; return; }
      alert("Did not receive VNPay link.");
    } catch { alert("Error creating VNPay payment."); }
  };

  const handleZalo = async (amountVND) => {
    try {
      const data = await callPaymentEndpoint("create-zalopay", amountVND);
      const orderUrl = data?.order_url || data?.payment_url || data?.data?.order_url;
      if (orderUrl) { window.location.href = orderUrl; return; }
      alert("Did not receive ZaloPay link.");
    } catch { alert("Error creating ZaloPay payment."); }
  };

  // --- NEW: Cash on Delivery (COD) payment handling function ---
  const handleCOD = async () => {
    try {
      console.log("Creating COD order...");
      const productsData = [];
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                 productsData.push({ id: Number(item), quantity: cartItems[item] });
            }
        }

      const res = await fetch("http://localhost:4000/addorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customer: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
            total: totalUSD,
            paymentMethod: "COD",
            products: productsData,
        }),
      });

      if (res.ok) {
        alert("✅ Order placed successfully! Please pay upon receipt.");
        navigate("/");
      } else {
        throw new Error("Failed to create COD order");
      }
    } catch (error) {
      console.error("COD Error:", error);
      alert("Error creating COD order. Please try again.");
    }
  };


  // --- General handling function for "Place Order Now" button ---
  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setLoading(true);
    try {
      if (selectedPaymentMethod === "cod") {
        await handleCOD();
      } 
      else {
        const amountVND = await convertUsdToVnd(totalUSD);
        if (!Number.isFinite(amountVND) || amountVND <= 0) {
            alert('Invalid payment amount');
            setLoading(false);
            return;
        }

        switch (selectedPaymentMethod) {
            case "momo": await handleMomo(amountVND); break;
            case "vnpay": await handleVNPay(amountVND); break;
            case "zalopay": await handleZalo(amountVND); break;
            default: break;
        }
      }
    } catch (error) {
        console.error("Payment error:", error);
    } finally {
      if (selectedPaymentMethod === 'cod') {
          setLoading(false);
      }
    }
  };

  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery (COD)", icon: <FaMoneyBillWave /> },
    { id: "momo", name: "MoMo Wallet", icon: <FaWallet /> },
    { id: "vnpay", name: "VNPay QR", icon: <FaCreditCard /> },
    { id: "zalopay", name: "ZaloPay", icon: <FaWallet /> },
    { id: "paypal", name: "PayPal / International Cards", icon: <SiPaypal /> },
  ];

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${!orderReady ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Shipping Info</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${orderReady ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Payment</span>
          </div>
        </div>
      </div>

      <div className="checkout-layout-wrapper">
        
        {/* LEFT COLUMN: SHIPPING INFORMATION */}
        <div className="checkout-left-column">
          <div className="info-card">
            <div className="card-header">
              <h2><FaShippingFast /> Shipping Information</h2>
              {orderReady && <span className="edit-badge" onClick={() => setOrderReady(false)}><FaEdit /> Edit</span>}
            </div>

            {!orderReady ? (
              <form onSubmit={handleSubmitInfo} className="checkout-form">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input 
                    name="name" 
                    value={customerInfo.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="John Doe" 
                  />
                </div>

                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    value={customerInfo.email} 
                    onChange={handleChange} 
                    required 
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input 
                    name="phone" 
                    value={customerInfo.phone} 
                    onChange={handleChange} 
                    required 
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="form-group">
                  <label>Shipping Address <span className="required">*</span></label>
                  <textarea 
                    name="address" 
                    value={customerInfo.address} 
                    onChange={handleChange} 
                    required 
                    placeholder="Street address, apartment, suite, etc."
                    rows="3"
                  />
                </div>

                <button type="submit" className="checkout-btn primary-btn">
                  <span>Continue to Payment</span>
                  <FaArrowRight className="btn-arrow" />
                </button>
              </form>
            ) : (
              <div className="info-summary">
                <div className="summary-item">
                  <span className="label">Name:</span>
                  <span className="value">{customerInfo.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email:</span>
                  <span className="value">{customerInfo.email}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phone:</span>
                  <span className="value">{customerInfo.phone}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Address:</span>
                  <span className="value">{customerInfo.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT METHOD & ORDER SUMMARY */}
        <div className="checkout-right-column">
          {/* Order Summary Card */}
          <div className="summary-card">
            <h3>📋 Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="amount">${totalUSD.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="amount free">Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span className="amount">$0.00</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span className="amount">${totalUSD.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection (Only show when ready) */}
          {orderReady && totalUSD > 0 && (
            <div className="payment-card animation-fade-in">
              <div className="card-header">
                <h3><FaCreditCard /> Payment Method</h3>
              </div>

              <div className="payment-options-list">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option-card ${selectedPaymentMethod === method.id ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <span className="method-icon">{method.icon}</span>
                      <span className="method-name">{method.name}</span>
                    </div>
                    <FaCheckCircle className="radio-check" />
                  </label>
                ))}
              </div>

              {/* Action Button Area */}
              <div className="payment-action-area">
                {selectedPaymentMethod === "paypal" ? (
                  <div className="paypal-sdk-wrapper">
                    <PayPalCheckout total={totalUSD} customerInfo={customerInfo} />
                  </div>
                ) : (
                  <button
                    className="checkout-btn final-pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || !selectedPaymentMethod}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order - ${totalUSD.toFixed(2)}</span>
                        <FaArrowRight className="btn-arrow" />
                      </>
                    )}
                  </button>
                )}

                <div className="security-badges">
                  <span><FaLock /> Secure Payment</span>
                  <span><FaCheckCircle /> SSL Encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;