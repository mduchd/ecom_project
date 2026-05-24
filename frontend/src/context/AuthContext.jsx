import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/Toast.jsx";
import api from "../services/productService.js";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // Th盻ｭ l蘯･y thﾃｴng tin ﾄ惰ハg nh蘯ｭp t盻ｫ localStorage khi kh盻殃 ch蘯｡y
  useEffect(() => {
    const savedUser = localStorage.getItem("snapcart_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // ﾄ雪ｺ｣m b蘯｣o cﾃ｡c trﾆｰ盻拵g m盻嬖 t盻渡 t蘯｡i ﾄ黛ｻ・trﾃ｡nh crash
      if (!parsedUser.favorites) parsedUser.favorites = [];
      setUser(parsedUser);
    }
    const savedCart = localStorage.getItem("snapcart_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Không thể đọc dữ liệu giỏ hàng", e);
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/signin", { username: email, password });
      const { token, accessToken, id, username, email: resEmail, roles, avatar } = response.data;
      const actualToken = token || accessToken;
      
      const role = roles.includes("ROLE_ADMIN") ? "admin" : "user";
      const loggedInUser = {
        id,
        name: username,
        email: resEmail,
        role: role,
        avatar: avatar || (role === "admin" 
          ? "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
          : "https://i.pravatar.cc/150?u=" + resEmail),
        points: role === "admin" ? 0 : Math.floor(Math.random() * 500) + 100,
        favorites: []
      };
      
      setUser(loggedInUser);
      localStorage.setItem("snapcart_user", JSON.stringify(loggedInUser));
      localStorage.setItem("snapcart_token", actualToken);
      setIsAuthModalOpen(false);
      toast.success("Đăng nhập thành công!");
      return loggedInUser;
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản.";
      toast.error(msg);
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await api.post("/auth/google", { token: googleToken });
      const { token, accessToken, id, username, email: resEmail, roles, avatar } = response.data;
      const actualToken = token || accessToken;
      
      const role = roles.includes("ROLE_ADMIN") ? "admin" : "user";
      const loggedInUser = {
        id,
        name: username,
        email: resEmail,
        role: role,
        avatar: avatar || (role === "admin" 
          ? "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
          : "https://i.pravatar.cc/150?u=" + resEmail),
        points: role === "admin" ? 0 : Math.floor(Math.random() * 500) + 100,
        favorites: []
      };
      
      setUser(loggedInUser);
      localStorage.setItem("snapcart_user", JSON.stringify(loggedInUser));
      localStorage.setItem("snapcart_token", actualToken);
      setIsAuthModalOpen(false);
      toast.success("Đăng nhập bằng Google thành công!");
      return loggedInUser;
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập bằng Google thất bại!";
      toast.error(msg);
      throw error;
    }
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
      toast.success("Đã thêm vào danh sách yêu thích");
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
        newCart = [...prev, {
          ...product,
          image: product.image || product.imageUrl || "",
          qty,
          variant,
          color,
          cartId: Math.random().toString(36).substring(7)
        }];
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
        loginWithGoogle,
        logout,
        toggleFavorite,
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

