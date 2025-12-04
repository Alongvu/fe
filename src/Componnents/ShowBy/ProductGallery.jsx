import React, { useEffect, useState } from "react";
import "./ProductGallery.css";
import ProductCard from "./ProductCard";
import all_product from "../Assets/all_product"; // sản phẩm tĩnh

const ProductGallery = () => {
  const [products, setProducts] = useState(all_product);
  const [sortType, setSortType] = useState("default");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // 🔹 Lấy sản phẩm từ backend
  useEffect(() => {
    fetch("http://localhost:4000/allproduct")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Dữ liệu backend:", data);

        // ✅ Chuẩn hóa dữ liệu backend
        const formattedBackend = data.map((p) => ({
          id: p.id || p._id,
          name: p.name,
          // ✅ Viết hoa chữ cái đầu
          category:
            p.category && p.category.length > 0
              ? p.category.charAt(0).toUpperCase() +
                p.category.slice(1).toLowerCase()
              : "",
          new_price: Number(p.new_price),
          old_price: Number(p.old_price),
          image: p.image?.startsWith("http")
            ? p.image
            : `http://localhost:4000/images/${p.image?.replace("uploads\\", "")}`,
        }));

        // ✅ Gộp dữ liệu
        setProducts((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const merged = [
            ...prev,
            ...formattedBackend.filter((p) => !existingIds.has(p.id)),
          ];
          console.log("✅ Sau khi gộp:", merged);
          return merged;
        });
      })
      .catch((err) => console.error("❌ Lỗi lấy sản phẩm:", err));
  }, []);

  // 🔹 Lọc & sắp xếp
  const filteredProducts = products
    .filter((p) => {
      if (categoryFilter === "all") return true;
      // so sánh không phân biệt hoa/thường
      return (
        (p.category || "").toLowerCase() === categoryFilter.toLowerCase()
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.new_price);
      const priceB = Number(b.new_price);
      if (sortType === "price-low") return priceA - priceB;
      if (sortType === "price-high") return priceB - priceA;
      return 0;
    });

  return (
    <div className="product-container">
      {/* Bộ lọc và sắp xếp */}
      <div className="product-filters">
        <div className="filter-category">
          <label>Product Type:</label>
          <select onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All</option>
            {/* ✅ Dùng giá trị trùng với .toLowerCase() để lọc khớp */}
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kid">Kid</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>

        <div className="filter-sort">
          <label>Sort by:</label>
          <select onChange={(e) => setSortType(e.target.value)}>
            <option value="default">Default</option>
            <option value="price-low">Low Price → High Price</option>
            <option value="price-high">High Price → Low Price</option>
          </select>
        </div>
      </div>

      {/* Hiển thị danh sách sản phẩm */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-result">No suitable products</p>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
