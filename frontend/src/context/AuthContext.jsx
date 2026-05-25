import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "../components/Toast.jsx";
import api from "../services/productService.js";
import { getMyProfile } from "../services/userService.js";

const AuthContext = createContext();

const readStoredUser = () => {
  const savedUser = localStorage.getItem("snapcart_user");
  if (!savedUser) {
    return null;
  }
  try {
    const parsedUser = JSON.parse(savedUser);
    if (!parsedUser.favorites) {
      parsedUser.favorites = [];
    }
    return parsedUser;
  } catch (error) {
    console.error("Không thể đọc thông tin người dùng đã lưu", error);
    return null;
  }
};

const readStoredCart = () => {
  const savedCart = localStorage.getItem("snapcart_cart");
  if (!savedCart) {
    return [];
  }
  try {
    return JSON.parse(savedCart);
  } catch (error) {
    console.error("Không thể đọc dữ liệu giỏ hàng", error);
    return [];
  }
};

const applyProfileToUser = (baseUser, profile) => {
  if (!baseUser || !profile) {
    return baseUser;
  }
  const pointsBalance = profile.pointsBalance ?? profile.points ?? baseUser.points ?? 0;
  const pointsLocked = profile.pointsLocked ?? profile.isPointsLocked ?? baseUser.pointsLocked ?? false;

  return {
    ...baseUser,
    name: profile.fullName || profile.username || baseUser.name,
    fullName: profile.fullName || baseUser.fullName || profile.username || baseUser.name,
    username: profile.username || baseUser.username,
    email: profile.email || baseUser.email,
    avatar: profile.avatar || baseUser.avatar,
    phoneNumber: profile.phoneNumber || "",
    address: profile.address || "",
    city: profile.city || "",
    postalCode: profile.postalCode || "",
    provider: profile.provider || baseUser.provider || "local",
    points: Number(pointsBalance) || 0,
    pointsLocked: Boolean(pointsLocked),
    memberTier: profile.memberTier || baseUser.memberTier || "BRONZE",
    memberTierLabel: profile.memberTierLabel || baseUser.memberTierLabel || "Đồng",
    deliveredSpend: Number(profile.deliveredSpend ?? baseUser.deliveredSpend ?? 0),
    nextTierThreshold: profile.nextTierThreshold ?? baseUser.nextTierThreshold ?? null,
    nextTierLabel: profile.nextTierLabel ?? baseUser.nextTierLabel ?? null,
    pointsMultiplier: Number(profile.pointsMultiplier ?? baseUser.pointsMultiplier ?? 1),
  };
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cart, setCart] = useState(() => readStoredCart());

  // Làm mới số điểm và hồ sơ từ server khi có token
  useEffect(() => {
    const token = localStorage.getItem("snapcart_token");
    if (!token) {
      return;
    }

    getMyProfile()
      .then((profile) => {
        setUser((prev) => {
          const baseUser = prev || readStoredUser();
          if (!baseUser) {
            return prev;
          }
          const updated = applyProfileToUser(baseUser, profile);
          localStorage.setItem("snapcart_user", JSON.stringify(updated));
          return updated;
        });
      })
      .catch((error) => {
        console.error("Không thể làm mới số điểm tích lũy", error);
      });
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
        points: 0,
        pointsLocked: false,
        favorites: []
      };

      localStorage.setItem("snapcart_token", actualToken);
      const profile = await getMyProfile();
      const userWithProfile = applyProfileToUser(loggedInUser, profile);
      setUser(userWithProfile);
      localStorage.setItem("snapcart_user", JSON.stringify(userWithProfile));
      setIsAuthModalOpen(false);
      toast.success("Đăng nhập thành công!");
      return userWithProfile;
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
        points: 0,
        pointsLocked: false,
        favorites: []
      };

      localStorage.setItem("snapcart_token", actualToken);
      const profile = await getMyProfile();
      const userWithProfile = applyProfileToUser(loggedInUser, profile);
      setUser(userWithProfile);
      localStorage.setItem("snapcart_user", JSON.stringify(userWithProfile));
      setIsAuthModalOpen(false);
      toast.success("Đăng nhập bằng Google thành công!");
      return userWithProfile;
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

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem("snapcart_token")) {
      return null;
    }
    try {
      const profile = await getMyProfile();
      setUser((prev) => {
        const baseUser = prev || readStoredUser();
        if (!baseUser) {
          return prev;
        }
        const updated = applyProfileToUser(baseUser, profile);
        localStorage.setItem("snapcart_user", JSON.stringify(updated));
        return updated;
      });
      return profile;
    } catch (error) {
      console.error("Không thể làm mới hồ sơ người dùng", error);
      return null;
    }
  }, []);

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
        refreshProfile,
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

