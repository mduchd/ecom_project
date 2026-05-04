import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Shop from './pages/Shop'
import AdminProducts from './pages/AdminProducts'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white pb-20">
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />

          {/* 2. Thay đoạn chữ tạm thời bằng component <Shop /> */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App