// src/pages/ProductDetail.jsx
import { useState } from "react";

// ── Dummy Product Data ───────────────────────────────────────────────────────
const PRODUCT = {
    id: 2,
    name: "MacBook Air M4 Chip 13-Inch",
    subtitle: "10-Core CPU, 8-Core GPU, 16GB RAM, 512GB SSD",
    category: "Laptops",
    brand: "Apple",
    price: 1450,
    oldPrice: 1599,
    discount: 9,
    rating: 4.8,
    reviews: 234,
    sold: 1820,
    badge: "Top Rated",
    badgeColor: "bg-emerald-500",
    inStock: true,
    stockCount: 12,
    sku: "APL-MBA-M4-13-512",
    description: `The new MacBook Air with M4 chip is Apple's thinnest, lightest, and most affordable laptop yet — now with even more power. The M4 chip delivers a massive leap in performance, with a 10-core CPU and 8-core GPU that handles everything from everyday tasks to professional-grade creative work. With up to 32GB of unified memory and up to 512GB SSD, it's a beast for multitasking, video editing, and running your favorite apps simultaneously.\n\nThe stunning 13.6-inch Liquid Retina display comes with 500 nits of brightness and P3 wide color support, making it one of the most gorgeous displays ever put in a laptop at this price point. Up to 18 hours of battery life means you can go all day and night without reaching for a charger.`,
    images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=90",
        "https://images.unsplash.com/photo-1611186871525-97f96eec3a9d?w=700&q=90",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&q=90",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=90",
    ],
    specs: [
        { label: "Chip", value: "Apple M4" },
        { label: "CPU", value: "10-Core" },
        { label: "GPU", value: "8-Core" },
        { label: "RAM", value: "16GB Unified Memory" },
        { label: "Storage", value: "512GB SSD" },
        { label: "Display", value: '13.6" Liquid Retina, 2560×1664, 500 nits' },
        { label: "Battery", value: "Up to 18 hours" },
        { label: "Weight", value: "1.24 kg (2.7 lbs)" },
        { label: "OS", value: "macOS Sequoia" },
        { label: "Ports", value: "2× Thunderbolt 4, MagSafe 3, 3.5mm Audio" },
        { label: "Camera", value: "12MP Center Stage" },
        { label: "Connectivity", value: "Wi-Fi 6E, Bluetooth 5.3" },
        { label: "Color", value: "Midnight / Starlight / Sky Blue / Silver" },
        { label: "Warranty", value: "1 Year Apple Limited Warranty" },
    ],
    features: [
        "Thinnest MacBook Air ever — just 11.5mm thin",
        "M4 chip with next-generation Neural Engine",
        "Up to 32GB of unified memory (configurable)",
        "MagSafe 3 magnetic charging",
        "Fanless silent design for zero noise",
        "Center Stage camera with 12MP resolution",
    ],
    tags: ["Apple", "MacBook", "Laptop", "M4", "Ultrabook"],
};

// ── Icons ────────────────────────────────────────────────────────────────────
const StarFull = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const StarHalf = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <defs>
            <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
        </defs>
        <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const HeartIcon = ({ filled }) => (
    <svg className={`w-5 h-5 transition-colors ${filled ? "text-red-500" : "text-gray-600"}`}
        fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
const ShareIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);
const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const HomeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);
const TruckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);
const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// ── Star Rating Display ──────────────────────────────────────────────────────
function StarRating({ rating, reviews, size = "md" }) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array(full).fill(0).map((_, i) => <StarFull key={`f${i}`} />)}
                {hasHalf && <StarHalf />}
                {Array(empty).fill(0).map((_, i) => (
                    <svg key={`e${i}`} className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm font-bold text-yellow-500">{rating}</span>
            <span className="text-sm text-gray-400">({reviews.toLocaleString()} reviews)</span>
        </div>
    );
}

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ product }) {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/shop" },
                { label: product.category, href: `/shop?cat=${product.category}` },
                { label: product.name, href: null },
            ].map((crumb, i, arr) => (
                <span key={i} className="flex items-center gap-1.5">
                    {i === 0 && <HomeIcon />}
                    {crumb.href ? (
                        <a href={crumb.href}
                            className="hover:text-blue-600 transition-colors font-medium max-w-[120px] truncate">
                            {crumb.label}
                        </a>
                    ) : (
                        <span className="text-blue-600 font-semibold max-w-[200px] truncate">
                            {crumb.label}
                        </span>
                    )}
                    {i < arr.length - 1 && <span className="text-gray-300">/</span>}
                </span>
            ))}
        </nav>
    );
}

// ── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({ images, name }) {
    const [active, setActive] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
                className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-md cursor-zoom-in aspect-square"
                onClick={() => setZoomed(!zoomed)}
            >
                <img
                    src={images[active]}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${zoomed ? "scale-150" : "scale-100"}`}
                />
                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {zoomed ? "Click to zoom out" : "Click to zoom in"}
                </div>
                {/* Discount ribbon */}
                {PRODUCT.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                        -{PRODUCT.discount}%
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => { setActive(i); setZoomed(false); }}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150
              ${active === i
                                ? "border-blue-600 shadow-md shadow-blue-100"
                                : "border-gray-100 hover:border-gray-300"}`}
                    >
                        <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Quantity Counter ─────────────────────────────────────────────────────────
function QuantityCounter({ value, onChange, max }) {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit shadow-sm">
            <button
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >−</button>
            <input
                type="number"
                value={value}
                min={1}
                max={max}
                onChange={(e) => {
                    const v = Math.min(max, Math.max(1, Number(e.target.value)));
                    onChange(v);
                }}
                className="w-14 h-10 text-center text-sm font-black text-gray-800 border-x border-gray-200 outline-none focus:bg-blue-50 transition-colors"
            />
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >+</button>
        </div>
    );
}

// ── Trust Badges ─────────────────────────────────────────────────────────────
function TrustBadges() {
    const badges = [
        { icon: <TruckIcon />, label: "Free Shipping", sub: "Orders over $399" },
        { icon: <ShieldIcon />, label: "2 Year Warranty", sub: "Apple Certified" },
        { icon: <RefreshIcon />, label: "30-Day Returns", sub: "Hassle-free" },
    ];
    return (
        <div className="grid grid-cols-3 gap-2 mt-2">
            {badges.map(({ icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-3 gap-1.5">
                    <span className="text-blue-600">{icon}</span>
                    <span className="text-[11px] font-bold text-gray-700 leading-tight">{label}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">{sub}</span>
                </div>
            ))}
        </div>
    );
}

// ── Product Info (right column) ──────────────────────────────────────────────
function ProductInfo({ product }) {
    const [qty, setQty] = useState(1);
    const [wished, setWished] = useState(false);
    const [addedToCart, setAdded] = useState(false);

    const handleCart = () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Brand + badge */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.brand}</span>
                <span className={`text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full ${product.badgeColor}`}>
                    {product.badge}
                </span>
                <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    SKU: {product.sku}
                </span>
            </div>

            {/* Name */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">{product.subtitle}</p>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-4 flex-wrap">
                <StarRating rating={product.rating} reviews={product.reviews} />
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">
                    <span className="font-bold text-gray-700">{product.sold.toLocaleString()}</span> sold
                </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Price */}
            <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-blue-600">
                    ${product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                    <div className="flex flex-col mb-1">
                        <span className="text-sm text-gray-400 line-through">${product.oldPrice.toLocaleString()}</span>
                        <span className="text-xs font-bold text-red-500">Save ${(product.oldPrice - product.price).toLocaleString()}</span>
                    </div>
                )}
            </div>

            {/* Short description */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description.split("\n")[0]}</p>

            {/* Feature list */}
            <ul className="space-y-1.5">
                {product.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CheckIcon />
                        </span>
                        {f}
                    </li>
                ))}
            </ul>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Stock */}
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                <span className={`text-sm font-bold ${product.inStock ? "text-emerald-600" : "text-red-500"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
                {product.inStock && (
                    <span className="text-xs text-gray-400">({product.stockCount} units left)</span>
                )}
            </div>

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <QuantityCounter value={qty} onChange={setQty} max={product.stockCount} />
                    <span className="text-sm text-gray-500 font-medium">
                        Total: <span className="font-black text-gray-800">${(product.price * qty).toLocaleString()}</span>
                    </span>
                </div>

                <div className="flex gap-2">
                    {/* Add to Cart */}
                    <button
                        onClick={handleCart}
                        disabled={!product.inStock}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all duration-200 shadow-lg active:scale-95
              ${addedToCart
                                ? "bg-emerald-500 shadow-emerald-100 text-white"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white"
                            } disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                    >
                        {addedToCart ? <><CheckIcon /> Added to Cart!</> : <><CartIcon /> Add to Cart</>}
                    </button>

                    {/* Wishlist */}
                    <button
                        onClick={() => setWished(!wished)}
                        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-95 flex-shrink-0
              ${wished
                                ? "border-red-200 bg-red-50 text-red-500"
                                : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-400"
                            }`}
                    >
                        <HeartIcon filled={wished} />
                    </button>

                    {/* Share */}
                    <button className="w-14 h-14 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-95 flex-shrink-0">
                        <ShareIcon />
                    </button>
                </div>
            </div>

            {/* Trust badges */}
            <TrustBadges />

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400">Tags:</span>
                {product.tags.map((tag) => (
                    <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium hover:bg-blue-100 cursor-pointer transition-colors">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Tabs Section ─────────────────────────────────────────────────────────────
const TABS = ["Description", "Specifications", "Reviews"];

function TabsSection({ product }) {
    const [activeTab, setActiveTab] = useState("Description");

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab nav */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all duration-150 border-b-2
              ${activeTab === tab
                                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                        {tab}
                        {tab === "Reviews" && (
                            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {product.reviews}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="p-6 sm:p-8">

                {/* ── Description ── */}
                {activeTab === "Description" && (
                    <div className="space-y-5">
                        {product.description.split("\n\n").map((para, i) => (
                            <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
                        ))}
                        <div>
                            <h3 className="text-base font-black text-gray-800 mb-3">Key Features</h3>
                            <ul className="grid sm:grid-cols-2 gap-2.5">
                                {product.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <CheckIcon />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* ── Specifications ── */}
                {activeTab === "Specifications" && (
                    <div>
                        <h3 className="text-base font-black text-gray-800 mb-4">Technical Specifications</h3>
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                            <table className="w-full text-sm">
                                <tbody>
                                    {product.specs.map(({ label, value }, i) => (
                                        <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                            <td className="px-4 py-3 font-bold text-gray-600 w-1/3 border-r border-gray-100 whitespace-nowrap">
                                                {label}
                                            </td>
                                            <td className="px-4 py-3 text-gray-800 font-medium">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Reviews ── */}
                {activeTab === "Reviews" && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-gray-50 rounded-2xl p-5">
                            <div className="text-center flex-shrink-0">
                                <div className="text-6xl font-black text-gray-900">{product.rating}</div>
                                <div className="flex justify-center mt-1"><StarRating rating={product.rating} reviews={product.reviews} /></div>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const pct = star === 5 ? 68 : star === 4 ? 20 : star === 3 ? 8 : star === 2 ? 3 : 1;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 w-4">{star}</span>
                                            <StarFull />
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400 w-8">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sample reviews */}
                        {[
                            { name: "Alex T.", stars: 5, date: "Apr 12, 2025", text: "Absolutely love this machine. The M4 chip is incredibly fast and the battery lasts all day easily. Best laptop I've ever owned." },
                            { name: "Sarah L.", stars: 5, date: "Mar 28, 2025", text: "Upgraded from an Intel MacBook and the difference is night and day. Runs cool and silent. Highly recommend!" },
                            { name: "James K.", stars: 4, date: "Mar 15, 2025", text: "Great laptop overall. Only wish it had more ports. But performance is top-notch for the price." },
                        ].map(({ name, stars, date, text }) => (
                            <div key={name} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                                            {name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{name}</p>
                                            <p className="text-xs text-gray-400">{date}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 flex-shrink-0">
                                        {Array(stars).fill(0).map((_, i) => <StarFull key={i} />)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main ProductDetail Page ──────────────────────────────────────────────────
export default function ProductDetail() {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Breadcrumb */}
                <Breadcrumb product={PRODUCT} />

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    <ImageGallery images={PRODUCT.images} name={PRODUCT.name} />
                    <ProductInfo product={PRODUCT} />
                </div>

                {/* Tabs */}
                <TabsSection product={PRODUCT} />
            </div>
        </main>
    );
}