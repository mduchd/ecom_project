import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { Toaster } from './components/Toast.jsx';
import { useAuth } from "./context/AuthContext.jsx";

import Header from './components/Header'
import AIChatBot from './components/AIChatBot'
import Home from './pages/Home'
import Shop from './pages/Shop'
import AdminProducts from './pages/AdminProducts'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import ThanhToan from './pages/ThanhToan'
import OrderTracking from './pages/OrderTracking'
import Footer from './components/Footer';
import AdminProductForm from './pages/AdminProductForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminDiemTichLuyPage from './pages/AdminDiemTichLuyPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function HomeRoute() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
}

function AdminShell({ children }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="text-sm font-black text-gray-900">
              Trang quản trị
            </Link>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">Tổng quan</Link>
              <Link to="/admin/products" className="text-gray-600 hover:text-blue-600">Sản phẩm</Link>
              <Link to="/admin/users" className="text-gray-600 hover:text-blue-600">Người dùng</Link>
              <Link to="/admin/loyalty" className="text-gray-600 hover:text-blue-600">Điểm tích lũy</Link>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const pathSegments = location.pathname.toLowerCase().split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] || "";
  const isAuthRoute = lastSegment === "login" || lastSegment === "signup";
  const isAdminRoute = pathSegments[0] === "admin";
  const hidePublicLayout = isAuthRoute || isAdminRoute;

  return (
    <>
      <div className={hidePublicLayout ? "min-h-screen bg-white" : "min-h-screen bg-white pb-20"}>
        <Toaster position="top-right" />
        {!hidePublicLayout && <Header />}
        {!hidePublicLayout && <AIChatBot />}

        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin/products" element={<AdminRoute><AdminShell><AdminProducts /></AdminShell></AdminRoute>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/checkout" element={<ThanhToan />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/admin/products/new" element={<AdminRoute><AdminShell><AdminProductForm /></AdminShell></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminShell><AdminProductForm /></AdminShell></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminShell><AdminDashboard /></AdminShell></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminShell><AdminUsersPage /></AdminShell></AdminRoute>} />
          <Route path="/admin/loyalty" element={<AdminRoute><AdminShell><AdminDiemTichLuyPage /></AdminShell></AdminRoute>} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      {!hidePublicLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
