import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
    FaPhoneAlt,
    FaChevronDown,
    FaSearch,
    FaUser,
    FaShoppingCart,
    FaBars,
    FaTimes,
    FaGlobe,
    FaInfoCircle,
    FaQuestionCircle,
    FaEnvelope,
    FaLaptop,
    FaCamera,
    FaHeadphones,
    FaTabletAlt,
    FaThLarge,
    FaMapMarkerAlt,
} from "react-icons/fa";

const CATEGORIES = [
    { label: "Tất cả danh mục", icon: <FaChevronDown className="inline-block mr-1 text-gray-400" /> },
    { label: "Laptop", icon: <FaLaptop className="inline-block mr-1 text-blue-500" /> },
    { label: "PC & Máy tính", icon: <FaLaptop className="inline-block mr-1 text-blue-400" /> },
    { label: "Phụ kiện", icon: <FaHeadphones className="inline-block mr-1 text-yellow-500" /> },
    { label: "Gaming & VR", icon: <FaCamera className="inline-block mr-1 text-purple-500" /> },
    { label: "Mạng", icon: <FaGlobe className="inline-block mr-1 text-green-500" /> },
    { label: "Máy ảnh", icon: <FaCamera className="inline-block mr-1 text-pink-500" /> },
    { label: "Điện thoại", icon: <FaPhoneAlt className="inline-block mr-1 text-emerald-500" /> },
    { label: "Máy tính bảng", icon: <FaTabletAlt className="inline-block mr-1 text-indigo-500" /> },
    { label: "Lưu trữ & USB", icon: <FaHeadphones className="inline-block mr-1 text-orange-500" /> },
    { label: "Âm thanh", icon: <FaHeadphones className="inline-block mr-1 text-red-500" /> },
    { label: "Văn phòng", icon: <FaEnvelope className="inline-block mr-1 text-gray-500" /> },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];
const LANGUAGES = ["Tiếng Việt", "Tiếng Anh"];
const NAV_LINKS = [
    { label: "Trang chủ", to: "/" },
    { label: "Sản phẩm", to: "/shop" },
    { label: "Liên hệ", to: "/contact" },
];

function Dropdown({ options, selected, onChange, icon }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-700 text-xs font-medium transition-colors duration-150 py-0.5"
            >
                {icon && <span className="text-gray-500">{icon}</span>}
                {selected}
                <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50 min-w-[110px] overflow-hidden animate-fadeIn">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                                selected === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600"
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function TopBar({ currency, setCurrency, language, setLanguage }) {
    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <FaPhoneAlt className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-medium text-gray-600">Hotline 24/7:</span>
                    <a href="tel:08824586945" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                        088-24586945
                    </a>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <a
                        href="#"
                        className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full transition-colors duration-150"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse inline-block" />
                        Theo dõi đơn
                    </a>
                    <Dropdown selected={currency} options={CURRENCIES} onChange={setCurrency} />
                    <div className="w-px h-3.5 bg-gray-300" />
                    <Dropdown selected={language} options={LANGUAGES} onChange={setLanguage} icon={<FaGlobe className="w-3.5 h-3.5" />} />
                </div>
            </div>
        </div>
    );
}

function Logo() {
    return (
        <Link to="/" className="flex items-center gap-1 select-none flex-shrink-0">
            <span className="text-2xl font-black tracking-tight">
                <span className="text-blue-600">Snap</span>
                <span className="text-yellow-400">cart</span>
            </span>
        </Link>
    );
}

function CategoryDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectCategory = (catLabel) => {
        setOpen(false);
        if (catLabel === "Tất cả danh mục") {
            navigate("/shop");
        } else {
            navigate(`/shop?category=${encodeURIComponent(catLabel)}`);
        }
    };

    return (
        <div className="relative hidden md:block" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all select-none border border-blue-100"
            >
                <FaThLarge className="w-3.5 h-3.5" />
                <span>Danh mục</span>
                <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2.5 overflow-hidden animate-fadeIn">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => handleSelectCategory(cat.label)}
                            className="flex items-center w-full text-left px-4 py-2 text-xs text-gray-700 font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            {cat.icon}
                            <span className="ml-2 truncate">{cat.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const PROVINCES = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Bình Dương",
    "Đồng Nai"
];

function RegionDropdown() {
    const [open, setOpen] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState("Hồ Chí Minh");
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative hidden lg:block" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all select-none border border-gray-200/60 text-left leading-tight min-w-[130px]"
            >
                <FaMapMarkerAlt className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <div className="truncate">
                    <p className="text-[9px] text-gray-400 font-medium">Xem giá tại</p>
                    <p className="text-[11px] font-bold text-gray-700 truncate">{selectedProvince}</p>
                </div>
                <FaChevronDown className={`w-2.5 h-2.5 ml-auto text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-fadeIn">
                    {PROVINCES.map((prov) => (
                        <button
                            key={prov}
                            onClick={() => {
                                setSelectedProvince(prov);
                                setOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                                selectedProvince === prov
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                            }`}
                        >
                            {prov}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchBar() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-2 lg:mx-4">
            <div className="flex h-11 rounded-xl overflow-hidden border-2 border-blue-600 shadow-sm focus-within:shadow-md focus-within:border-blue-700 transition-all duration-200 bg-white">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="flex-1 px-4 text-xs font-medium text-gray-700 placeholder-gray-400 outline-none bg-white"
                />
                <button type="submit" className="px-4 lg:px-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0">
                    <FaSearch className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}

function UserActions({ cartCount, cartTotal }) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/login" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group">
                <span className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                    <FaUser className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </span>
                <div className="leading-tight hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-medium">Xin chào</p>
                    <p className="text-xs font-bold">Đăng nhập / Đăng ký</p>
                </div>
            </Link>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            <Link to="/cart" className="flex items-center gap-2 group">
                <div className="relative">
                    <span className="w-9 h-9 rounded-full bg-yellow-400 group-hover:bg-yellow-500 flex items-center justify-center text-gray-800 transition-colors shadow-sm">
                        <FaShoppingCart className="w-5 h-5" />
                    </span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                            {cartCount}
                        </span>
                    )}
                </div>
                <div id="cart-icon" className="leading-tight hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-medium">Giỏ hàng</p>
                    <p className="text-xs font-bold text-gray-800">{cartTotal}đ</p>
                </div>
            </Link>
        </div>
    );
}

function DesktopNav() {
    return (
        <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-0.5 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-150">
                Trang chủ
            </Link>

            <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                    Trang
                    <FaChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden hidden group-hover:block">
                    <div className="py-2">
                        <Link to="/about" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600">
                            <FaInfoCircle className="text-blue-500 text-sm" /> Về chúng tôi
                        </Link>
                        <Link to="/faq" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600">
                            <FaQuestionCircle className="text-blue-500 text-sm" /> Câu hỏi thường gặp
                        </Link>
                        <Link to="/contact" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600">
                            <FaEnvelope className="text-blue-500 text-sm" /> Liên hệ
                        </Link>
                    </div>
                </div>
            </div>

            <Link to="/shop" className="flex items-center gap-0.5 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-150">
                Sản phẩm
            </Link>
            <Link to="/contact" className="flex items-center gap-0.5 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-150">
                Liên hệ
            </Link>
        </nav>
    );
}

function MobileMenu({ open, onClose }) {
    return (
        <>
            <div onClick={onClose} className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
            <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Logo />
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            onClick={onClose}
                            className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                            {link.label}
                            <FaChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400" />
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-4 pt-4 px-5 space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Danh mục</p>
                        {CATEGORIES.map((cat) => (
                            <button key={cat.label} onClick={onClose} className="flex items-center w-full text-left px-0 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                                {cat.icon}
                                <span className="ml-1 truncate">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <Link to="/login" onClick={onClose} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                        <FaUser className="w-5 h-5" />
                        <span className="text-sm font-bold">Đăng nhập / Đăng ký</span>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function Header() {
    const [currency, setCurrency] = useState("USD");
    const [language, setLanguage] = useState("Tiếng Việt");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cart } = useAuth();

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString();

    return (
        <>
            <header className="sticky top-0 z-30 w-full shadow-sm">
                <TopBar currency={currency} setCurrency={setCurrency} language={language} setLanguage={setLanguage} />

                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
                        <button className="lg:hidden text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0" onClick={() => setMobileMenuOpen(true)}>
                            <FaBars className="w-6 h-6" />
                        </button>

                        <Logo />
                        <CategoryDropdown />
                        <RegionDropdown />
                        <SearchBar />
                        <UserActions cartCount={cartCount} cartTotal={cartTotal} />
                    </div>
                </div>
            </header>

            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
    );
}
