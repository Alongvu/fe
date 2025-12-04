import React, { createContext, useEffect, useState } from 'react';
import staticProducts from "../Componnents/Assets/all_product";

export const ShopContext = createContext(null);

// 🛒 Khởi tạo giỏ hàng trống
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

// 📦 Hàm gộp sản phẩm tĩnh + backend
const mergeProducts = (localData, backendData) => {
  return [
    ...localData,
    ...backendData.map((p, i) => ({
      ...p,
      id: p.id || 1000 + i, // tránh trùng id
      category: (p.category || "other").trim().toLowerCase(),
      image: p.image?.startsWith("http")
        ? p.image // ảnh từ backend (URL)
        : `http://localhost:4000/${p.image?.replace(/\\/g, "/")}`, // fix đường dẫn backend cũ
      new_price: Number(p.new_price || 0),
      old_price: Number(p.old_price || p.new_price || 0),
    })),
  ];
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // 🔁 Lấy dữ liệu backend và gộp với local
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/allproduct');
        const backendData = await response.json();

        console.log("📦 Dữ liệu backend:", backendData);
        const merged = mergeProducts(staticProducts, backendData);
        console.log("✅ Sau khi gộp:", merged);

        setAll_Product(merged);
      } catch (error) {
        console.error("❌ Lỗi khi tải sản phẩm:", error);
        setAll_Product(staticProducts); // fallback nếu lỗi server
      }
    };

    fetchProducts();
  }, []);

  console.log("Fetched products:", all_product);

  // 🛍️ Các hàm giỏ hàng
  const addToCart = (itemId, size) => {
    setCartItems((prev) => {
      const key = `${itemId}_${size}`;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        const [id] = key.split("_");
        const product = all_product.find((p) => p.id === Number(id));
        if (product) {
          totalAmount += product.new_price * cartItems[key];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        totalItem += cartItems[key];
      }
    }
    return totalItem;
  };

  // 📤 Truyền dữ liệu ra context
  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
