import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/Toast.jsx";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allOrders, setAllOrders] = useState(() => {
    const saved = localStorage.getItem("snapcart_all_orders");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    // Dữ liệu mẫu mặc định
    return [
      { id: "ORD-9921", customer: "Nguyễn Văn A", product: "Apple Watch S9", date: new Date().toISOString(), total: "1,250.00$", status: "Chờ duyệt", method: "MoMo" },
      { id: "ORD-9920", customer: "Trần Thị B", product: "JBL Live 660NC", date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), total: "159.00$", status: "Đã giao", method: "COD" },
    ];
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // Tự động lưu allOrders khi có thay đổi
  useEffect(() => {
    localStorage.setItem("snapcart_all_orders", JSON.stringify(allOrders));
  }, [allOrders]);

  // Thử lấy thông tin đăng nhập từ localStorage khi khởi chạy
  useEffect(() => {
    const savedUser = localStorage.getItem("snapcart_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Đảm bảo các trường mới tồn tại để tránh crash
      if (!parsedUser.favorites) parsedUser.favorites = [];
      if (!parsedUser.orders) parsedUser.orders = [];
      setUser(parsedUser);
    }
    const savedCart = localStorage.getItem("snapcart_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const login = (email, password) => {
    // Fake login: cứ nhập là thành công
    const role = email.toLowerCase() === "admin@luxe.com" ? "admin" : "user";
    const fakeUser = {
      name: role === "admin" ? "Administrator" : (email.split("@")[0] || "Khách hàng"),
      email: email,
      role: role,
      avatar: role === "admin" 
        ? "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
        : "https://i.pravatar.cc/150?u=" + email,
      points: role === "admin" ? 0 : Math.floor(Math.random() * 500) + 100,
      favorites: [],
      orders: role === "admin" ? [] : [
        { id: "ORD-1234", date: "07/05/2026", status: "Đang giao hàng", total: "15.000.000đ", items: "Apple Watch Series 9" },
        { id: "ORD-5678", date: "12/04/2026", status: "Đã giao", total: "5.690.000đ", items: "JBL Live 660NC" },
      ]
    };
    setUser(fakeUser);
    localStorage.setItem("snapcart_user", JSON.stringify(fakeUser));
    setIsAuthModalOpen(false);
    toast.success("Đăng nhập thành công!");
  };

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString(),
      status: "Chờ duyệt"
    };
    setAllOrders(prev => [newOrder, ...prev]);
    
    // Nếu là user đang đăng nhập, thêm vào lịch sử của họ
    if (user) {
      const updatedUser = { ...user, orders: [newOrder, ...(user.orders || [])] };
      setUser(updatedUser);
      localStorage.setItem("snapcart_user", JSON.stringify(updatedUser));
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setAllOrders(prev => {
      const updated = prev.map(order => order.id === orderId ? { ...order, status: status } : order);
      // Lưu ngay lập tức để tránh lỗi race condition với useEffect
      localStorage.setItem("snapcart_all_orders", JSON.stringify(updated));
      return updated;
    });
    toast.success(`Cập nhật đơn hàng ${orderId} thành ${status}`);
  };

  const toggleFavorite = (product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      return;
    }

    const isFavorite = user.favorites.find(p => p.id === product.id);
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = user.favorites.filter(p => p.id !== product.id);
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } else {
      updatedFavorites = [...user.favorites, product];
      toast.success("Đã thêm vào danh sách yêu thích ❤️");
    }

    const updatedUser = { ...user, favorites: updatedFavorites };
    setUser(updatedUser);
    localStorage.setItem("snapcart_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("snapcart_user");
    localStorage.removeItem("snapcart_token");
    toast.success("Đã đăng xuất");
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Cart functions
  const addToCart = (product, qty = 1, variant = null, color = null) => {
    setCart(prev => {
      // Find if item already exists with same product id, variant, and color
      const existing = prev.find(item => item.id === product.id && item.variant === variant && item.color === color);
      let newCart;
      if (existing) {
        newCart = prev.map(item => item === existing ? { ...item, qty: item.qty + qty } : item);
      } else {
        newCart = [...prev, { ...product, qty, variant, color, cartId: Math.random().toString(36).substring(7) }];
      }
      localStorage.setItem("snapcart_cart", JSON.stringify(newCart));
      return newCart;
    });
    toast.success("Đã thêm vào giỏ hàng");
  };

  const updateCartQty = (cartId, qty) => {
    setCart(prev => {
      const newCart = prev.map(item => item.cartId === cartId ? { ...item, qty } : item);
      localStorage.setItem("snapcart_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (cartId) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.cartId !== cartId);
      localStorage.setItem("snapcart_cart", JSON.stringify(newCart));
      return newCart;
    });
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const clearCart = (silent = false) => {
    setCart([]);
    localStorage.removeItem("snapcart_cart");
    localStorage.removeItem("snapcart_coupon");
    if (!silent) toast.success("Đã dọn dẹp giỏ hàng");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        toggleFavorite,
        allOrders,
        addOrder,
        updateOrderStatus,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
