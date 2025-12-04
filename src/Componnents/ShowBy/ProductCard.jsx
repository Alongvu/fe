import React from "react";
import "./ProductGallery";


const ProductCard = ({ product }) => {
  const imageUrl =
    product.image?.startsWith("http") || product.image?.startsWith("/")
      ? product.image
      : `http://localhost:4000/images/${product.image?.replace("uploads\\", "")}`;

  return (
    <div className="product-card">
      <img
        src={imageUrl}
        alt={product.name}
        className="product-image"
        onError={(e) => (e.target.style.display = "none")} // tránh lỗi ảnh
      />
      <h3>{product.name}</h3>
      <div className="product-prices">
        <span className="new-price">{product.new_price}$</span>
        <span className="old-price">{product.old_price}$</span>
      </div>
      <p className="product-category">
        Loại:{" "}
        {product.category
          ? product.category.charAt(0).toUpperCase() +
            product.category.slice(1).toLowerCase()
          : ""}
      </p>
    </div>
  );
};

export default ProductCard;
