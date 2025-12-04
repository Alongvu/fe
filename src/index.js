import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ShopContextProvider from './Context/ShopContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PayPalScriptProvider options={{
    "client-id": "AeKXQOXYVEr1SGFDySbp7iKVMDlB92C2mki0BwsEj7jmPSc7s02OthA8X5feIkgEWTT3eCpWB8dWzCP_",
    currency: "USD"
  }}>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </PayPalScriptProvider>
);
