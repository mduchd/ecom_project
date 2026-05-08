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
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'

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
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App