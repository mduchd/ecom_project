import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AIChatBot from './components/AIChatBot'
import Home from './pages/Home'
import Shop from './pages/Shop'
import AdminProducts from './pages/AdminProducts'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import Checkout from './pages/Checkout'
import Footer from './components/Footer';
import AdminProductForm from './pages/AdminProductForm';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white pb-20">
        <Header />
        <AIChatBot />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App