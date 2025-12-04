import './App.css';
import Navbar from './Componnents/Navbar/Navbar';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import LoginSignup from './Pages/LoginSignup';
import Footer  from './Componnents/Footer/Footer';
import men_banner from './Componnents/Assets/banner_mens.png'
import wonmen_banner from './Componnents/Assets/banner_women.png'
import kid_banner from './Componnents/Assets/banner_kids.png'
import banner from './Componnents/Assets/banner.png'
import Cart from './Pages/Cart'
import ProductGallery from './Componnents/ShowBy/ProductGallery';
import ChatBox from './Componnents/ChatBox/ChatBox';
import Checkout from './Componnents/Checkout/Checkout';
import PaymentSuccess from './Pages/PaymentSuccess';


function App() {
  return (
    <div>
     <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/men' element={<ShopCategory banner={men_banner} category="men" />} />
          <Route path='/women' element={<ShopCategory banner={wonmen_banner} category="women" />} />
          <Route path='/kid' element={<ShopCategory banner={kid_banner} category="kid" />} />
          <Route path='/accessory' element={<ShopCategory banner={banner} category="accessory" />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/productgallery' element={<ProductGallery />} /> {/* ✅ Chuyển ra đây */}
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
        <ChatBox/>
        <Footer />
      </BrowserRouter>
    </div>
  );
}


export default App;
