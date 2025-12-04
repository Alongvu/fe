import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import { useNavigate } from "react-router-dom";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    removeFromCart,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // 🟢 Tạo đơn ngay khi nhấn checkout
  const createOrderBeforeCheckout = async () => {
    const products = Object.keys(cartItems)
      .filter((key) => cartItems[key] > 0)
      .map((key) => {
        const [id, size] = key.split("_");
        const product = all_product.find((p) => p.id === Number(id));

        return {
          id: Number(id),
          name: product.name,
          size,
          quantity: cartItems[key],
          price: product.new_price,
          category: product.category,
        };
      });

    const orderData = {
      customer: "Khách Hàng",
      phone: "",
      address: "",
      total: getTotalCartAmount(),
      products,
      status: "pending",
    };

    const res = await fetch("http://localhost:4000/addorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("orderId", data.orderId);
    }
  };

  const handleCheckout = async () => {
    if (getTotalCartAmount() > 0) {
      await createOrderBeforeCheckout();
      navigate("/checkout");
    } else {
      alert("🛒 Giỏ hàng đang trống!");
    }
  };

  return (
    <div className="cartitems">

      <div className="cartitems-format-main">
        <p>Product</p>
        <p>Name</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Tatol</p>
        <p>Delete</p>
      </div>
      <hr />

      {Object.keys(cartItems)
        .filter((key) => cartItems[key] > 0)
        .map((key) => {
          const [id, size] = key.split("_");
          const product = all_product.find((p) => p.id === Number(id));

          return (
            <div key={key}>
              <div className="cartitems-format">
                <img src={product.image} alt="" className="cartitems-product-icon" />

                <p>{product.name}</p>
                <p>{size}</p>
                <p>{product.new_price.toLocaleString()}$</p>

                <p>{cartItems[key]}</p>

                <p>{(product.new_price * cartItems[key]).toLocaleString()}$</p>

                <img
                  src={remove_icon}
                  onClick={() => removeFromCart(key)}
                  className="cartitems-remove-icon"
                />
              </div>
              <hr />
            </div>
          );
        })}

      {/* --- CART TOTAL + PROMO CODE --- */}
      <div className="cartitems-down">
        {/* LEFT SIDE */}
        <div className="cartitems-total">
          <h1>Cart Totals</h1>

          <div className="cartitems-total-item">
            <p>Subtotal</p>
            <p>{getTotalCartAmount().toLocaleString()}$</p>
          </div>

          <div className="cartitems-total-item">
            <p>Shipping fee</p>
            <p>Free</p>
          </div>

          <div className="cartitems-total-item">
            <h3>Total</h3>
            <h3>{getTotalCartAmount().toLocaleString()}$

                
            </h3>
          </div>

          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        {/* RIGHT SIDE — PROMO CODE */}
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>

          <div className="cartitems-promobox">
            <input type="text" placeholder="" />
            <button>Submit</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CartItems;
