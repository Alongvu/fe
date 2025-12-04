import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./PayPalCheckout.css";

const PayPalCheckout = ({ total, customerInfo }) => {

  const createOrder = async () => {
    const res = await fetch("http://localhost:4000/create-paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }),
    });
    const data = await res.json();
  return data.id; // chắc chắn chỉ trả id
  };

  const onApprove = async (data) => {
    const res = await fetch("http://localhost:4000/capture-paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: data.orderID }),
    });
    const details = await res.json();

    await fetch("http://localhost:4000/addorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        total,
        products: details.purchase_units?.[0]?.items?.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.unit_amount.value,
        })) || [],
      }),
    });

    alert("✅ Thanh toán thành công! Cảm ơn bạn ❤️");
    window.location.href = "/";
  };

  return (
    <div className="paypal-container">
<PayPalScriptProvider options={{ "client-id": "AeKXQOXYVEr1SGFDySbp7iKVMDlB92C2mki0BwsEj7jmPSc7s02OthA8X5feIkgEWTT3eCpWB8dWzCP_" }}>
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "pill", label: "pay" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error("❌ PayPal Error:", err);
            alert("Thanh toán thất bại, vui lòng thử lại.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckout;
