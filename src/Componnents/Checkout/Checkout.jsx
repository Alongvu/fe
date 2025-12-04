// src/components/Checkout/Checkout.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import PayPalCheckout from "../PayPalCheckout/PayPalCheckout";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

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
    { id: "cod", name: "Cash on Delivery (COD)", icon: "💵" },
    { id: "momo", name: "MoMo Wallet", icon: "🟪" },
    { id: "vnpay", name: "VNPay QR", icon: "🟦" },
    { id: "zalopay", name: "ZaloPay", icon: "🟩" },
    { id: "paypal", name: "PayPal / International Cards", icon: "🅿️" },
  ];

  return (
    <div className="checkout-container">
      {/* BỌC BAO NGOÀI ĐỂ TẠO LAYOUT FLEX */}
      <div className="checkout-layout-wrapper">
        
        {/* CỘT BÊN TRÁI: THÔNG TIN GIAO HÀNG */}
        <div className="checkout-left-column">
          <h1>Shipping Information</h1>
          <form onSubmit={handleSubmitInfo} className="checkout-form">
            <div className="form-group">
                <label>Full Name:</label>
                <input name="name" value={customerInfo.name} onChange={handleChange} required placeholder="" />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={customerInfo.email} onChange={handleChange} required placeholder="email@example.com"/>
            </div>
            <div className="form-group">
                <label>Phone Number:</label>
                <input name="phone" value={customerInfo.phone} onChange={handleChange} required placeholder=""/>
            </div>
            <div className="form-group">
                <label>Shipping Address:</label>
                <input name="address" value={customerInfo.address} onChange={handleChange} required placeholder="..." />
            </div>

            {!orderReady && (
                <button type="submit" className="checkout-btn continue-btn">
                Continue to payment method
                </button>
            )}
          </form>
        </div>

        {/* CỘT BÊN PHẢI: PHƯƠNG THỨC THANH TOÁN (Chỉ hiện khi đã điền thông tin) */}
        {orderReady && totalUSD > 0 && (
          <div className="checkout-right-column animation-fade-in">
            <div className="payment-section modern-payment">
              <div className="payment-header">
                <h2>Select Payment Method</h2>
                <p className="total-review">
                  Total: <strong>${totalUSD.toFixed(2)}</strong>
                </p>
              </div>

              {/* Payment Method Selection List */}
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
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                  </label>
                ))}
              </div>

              {/* Final Action Button Area */}
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
                    {loading ? "Processing..." : `Place Order Now`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;