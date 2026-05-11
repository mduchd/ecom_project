import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/Toast.jsx';

import Header from './components/Header'
import AIChatBot from './components/AIChatBot'
import Home from './pages/Home'
import Shop from './pages/Shop'
import AdminProducts from './pages/AdminProducts'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import Checkout from './pages/Checkout'
import ThanhToan from './pages/ThanhToan'
import Footer from './components/Footer';
import AdminProductForm from './pages/AdminProductForm';
import ChiTietSP from './pages/ChiTietSP';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white pb-20">
        <Toaster position="top-right" />
        <Header />
        <AIChatBot />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/product/:id" element={<ChiTietSP />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/checkout" element={<ThanhToan />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App