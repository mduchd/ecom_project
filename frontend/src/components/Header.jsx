import { useState } from "react";
import { Link } from 'react-router-dom';

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const PhoneIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
);

const ChevronDown = ({ className = "w-3 h-3" }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GlobeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
);

// ── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    "All Categories", "Laptops", "PC & Computers", "Accessories",
    "Gaming & VR", "Networking", "Cameras", "Cell Phones", "Tablets",
    "Storage & USB", "Sounds", "Office",
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Vietnamese"];
const NAV_LINKS = ["Home", "Pages", "Products", "Contact"];

// ── Sub-components ──────────────────────────────────────────────────────────

function Dropdown({ label, options, selected, onChange, icon }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-700 text-xs font-medium transition-colors duration-150 py-0.5"
            >
                {icon && <span className="text-gray-500">{icon}</span>}
                {label ?? selected}
                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50 min-w-[110px] overflow-hidden animate-fadeIn">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors ${selected === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600"}`}
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
                    <PhoneIcon />
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
                        Track Order
                    </a>

                    <Dropdown selected={currency} options={CURRENCIES} onChange={setCurrency} />

                    <div className="w-px h-3.5 bg-gray-300" />

                    <Dropdown
                        selected={language}
                        options={LANGUAGES}
                        onChange={setLanguage}
                        icon={<GlobeIcon />}
                    />
                </div>
            </div>
        </div>
    );
}

function SearchBar() {
    const [category, setCategory] = useState("All Categories");
    const [catOpen, setCatOpen] = useState(false);
    const [query, setQuery] = useState("");

    return (
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="flex h-11 rounded-xl overflow-hidden border-2 border-blue-600 shadow-sm focus-within:shadow-md focus-within:border-blue-700 transition-all duration-200 bg-white">

                <div className="relative hidden sm:flex">
                    <button
                        onClick={() => setCatOpen(!catOpen)}
                        className="flex items-center gap-1.5 px-3 lg:px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border-r border-gray-200 whitespace-nowrap transition-colors h-full"
                    >
                        <span className="max-w-[100px] truncate">{category}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${catOpen ? "rotate-180" : ""}`} />
                    </button>

                    {catOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-52 max-h-72 overflow-y-auto">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setCategory(cat); setCatOpen(false); }}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${category === cat ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="flex-1 px-4 text-sm text-gray-700 placeholder-gray-400 outline-none bg-white"
                />

                <button className="px-4 lg:px-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0">
                    <SearchIcon />
                </button>
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

function UserActions({ cartCount = 3, cartTotal = "1,520.00" }) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/login" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group">
                <span className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                    <UserIcon />
                </span>
                <div className="leading-tight hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-medium">Welcome</p>
                    <p className="text-xs font-bold">Log In / Sign Up</p>
                </div>
            </Link>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            <Link to="/cart" className="flex items-center gap-2 group">
                <div className="relative">
                    <span className="w-9 h-9 rounded-full bg-yellow-400 group-hover:bg-yellow-500 flex items-center justify-center text-gray-800 transition-colors shadow-sm">
                        <CartIcon />
                    </span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                            {cartCount}
                        </span>
                    )}
                </div>
                <div id="cart-icon" className="leading-tight hidden lg:block">
                    <p className="text-[10px] text-gray-400 font-medium">Cart</p>
                    <p className="text-xs font-bold text-gray-800">${cartTotal}</p>
                </div>
            </Link>
        </div>
    );
}

const NAV_ITEMS = [
    { label: "Home", to: "/", children: null },
    {
        label: "Pages",
        to: "#",
        children: [
            { label: "About Us", to: "/about", icon: "👋" },
            { label: "FAQ", to: "/faq", icon: "❓" },
            { label: "Contact", to: "/contact", icon: "✉️" },
        ],
    },
    {
        label: "Products",
        to: "/shop",
        children: [
            { label: "Laptops", to: "/shop?cat=Laptops", icon: "💻" },
            { label: "Cameras", to: "/shop?cat=Cameras", icon: "📷" },
            { label: "Accessories", to: "/shop?cat=Accessories", icon: "🎧" },
        ],
    },
    { label: "Contact", to: "/contact", children: null },
];

// ── Nav Dropdown Item ────────────────────────────────────────────────────────
function NavDropdown({ item }) {
    const [open, setOpen] = useState(false);
    let closeTimer = null;

    const handleMouseEnter = () => {
        clearTimeout(closeTimer);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        // small delay so cursor can move into dropdown
        closeTimer = setTimeout(() => setOpen(false), 120);
    };

    // No children → plain link
    if (!item.children) {
        return (
            <Link
                to={item.to}
                className="flex items-center gap-0.5 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-150"
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger */}
            <button
                className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-150
          ${open
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
            >
                {item.label}
                <svg
                    className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180 text-blue-500" : "text-gray-400"}`}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    {/* Arrow tip */}
                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                    <div className="py-2 relative">
                        {item.children.map((child, i) => (
                            <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-100 group"
                            >
                                <span className="text-base flex-shrink-0">{child.icon}</span>
                                <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                                    {child.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── DesktopNav ───────────────────────────────────────────────────────────────
function DesktopNav() {
    return (
        <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
                <NavDropdown key={item.label} item={item} />
            ))}
        </nav>
    );
}

function MobileMenu({ open, onClose }) {
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Logo />
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">

                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link}
                            to={link === "Home" ? "/" : link === "Products" ? "/shop" : `/${link.toLowerCase()}`}
                            onClick={onClose}
                            className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                            {link}
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400" />
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-4 pt-4 px-5 space-y-3">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Categories</p>
                        {CATEGORIES.slice(1).map((cat) => (
                            <a
                                key={cat}
                                href="#"
                                onClick={onClose}
                                className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors"
                            >
                                {cat}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                        <UserIcon />
                        <span className="text-sm font-bold">Log In / Sign Up</span>
                    </a>
                </div>
            </div>
        </>
    );
}

// ── Main Header Component ───────────────────────────────────────────────────
export default function Header() {
    const [currency, setCurrency] = useState("USD");
    const [language, setLanguage] = useState("English");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
      `}</style>

            <header className="sticky top-0 z-30 w-full shadow-sm">
                {/* Row 1 */}
                <TopBar
                    currency={currency} setCurrency={setCurrency}
                    language={language} setLanguage={setLanguage}
                />

                {/* Row 2 */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
                        <button
                            className="lg:hidden text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <MenuIcon />
                        </button>

                        <Logo />
                        <DesktopNav />
                        <SearchBar />
                        <UserActions cartCount={3} cartTotal="1,520.00" />
                    </div>
                </div>
            </header>

            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
    );
}