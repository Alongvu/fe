import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart, 
  FaLock, 
  FaArrowRight,
  FaTrashAlt,
  FaCheckCircle 
} from "react-icons/fa";
import { 
  MdLocalShipping 
} from "react-icons/md";

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
      <div className="cartitems-header">
        <h1>Shopping Cart</h1>
        <p className="cart-count">
          {Object.keys(cartItems).filter((key) => cartItems[key] > 0).length} items
        </p>
      </div>

      {Object.keys(cartItems).filter((key) => cartItems[key] > 0).length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">
            <FaShoppingCart />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add some items to get started!</p>
          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="cartitems-list">
            <div className="cartitems-table-header">
              <div className="col-product">Product</div>
              <div className="col-name">Details</div>
              <div className="col-price">Price</div>
              <div className="col-quantity">Quantity</div>
              <div className="col-total">Total</div>
              <div className="col-remove"></div>
            </div>

            {Object.keys(cartItems)
              .filter((key) => cartItems[key] > 0)
              .map((key) => {
                const [id, size] = key.split("_");
                const product = all_product.find((p) => p.id === Number(id));

                return (
                  <div key={key} className="cartitem-card">
                    <div className="col-product">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="cartitem-image" 
                      />
                    </div>

                    <div className="col-name">
                      <h3>{product.name}</h3>
                      <span className="product-size">Size: {size}</span>
                    </div>

                    <div className="col-price">
                      <span className="price">${product.new_price.toLocaleString()}</span>
                    </div>

                    <div className="col-quantity">
                      <div className="quantity-badge">{cartItems[key]}</div>
                    </div>

                    <div className="col-total">
                      <span className="total-price">
                        ${(product.new_price * cartItems[key]).toLocaleString()}
                      </span>
                    </div>

                    <div className="col-remove">
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(key)}
                        title="Remove item"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* --- CART SUMMARY + PROMO CODE --- */}
          <div className="cartitems-bottom">
            {/* LEFT SIDE — PROMO CODE */}
            <div className="cartitems-promocode">
              <h3>Have a promo code?</h3>
              <p>Enter your code to get discount</p>
              <div className="cartitems-promobox">
                <input type="text" placeholder="Enter promo code" />
                <button>Apply</button>
              </div>
            </div>

            {/* RIGHT SIDE — CART TOTAL */}
            <div className="cartitems-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span className="value">${getTotalCartAmount().toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>
                  <MdLocalShipping style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Shipping
                </span>
                <span className="value free">Free</span>
              </div>

              <div className="summary-row discount">
                <span>Discount</span>
                <span className="value">-$0</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span className="value">${getTotalCartAmount().toLocaleString()}</span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                <span>Proceed to Checkout</span>
                <FaArrowRight className="arrow" />
              </button>

              <div className="secure-checkout">
                <FaLock />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItems;
