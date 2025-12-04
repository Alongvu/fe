import React, { useContext } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import dropdown_icon from '../Componnents/Assets/dropdown_icon.png'
import Item from '../Componnents/Item/Item'
import { Link } from "react-router-dom";


const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  console.log("📦 Category hiện tại:", props.category);
console.log("🛍️ Danh mục có trong all_product:", all_product.map(p => p.category));
console.log("🛍️ Sản phẩm hiển thị:", all_product.filter(p => p.category === props.category));

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Show all </span> products from my shop
        </p>
        <Link to="/productgallery" className="shopcategory-sort">
          Show by <img src={dropdown_icon} alt="" />
        </Link>

      </div>
      <div className="shopcategory-products">
        {all_product.map((item, i) => {
          if (props.category === item.category) {
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
          }
          else {
            return null;
          }
        })}
      </div>
      <div className="shopcategory-loadmore">
        Explore More
      </div>
    </div>
  )
}
export default ShopCategory