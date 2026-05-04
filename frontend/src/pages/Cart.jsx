// src/pages/Cart.jsx
import { useState } from "react";
import { Link } from 'react-router-dom';

// ── Dummy Cart Data ──────────────────────────────────────────────────────────
const INITIAL_ITEMS = [
    {
        id: 1,
        name: "MacBook Air M4 Chip 13-Inch (10-Core CPU, 8 Core GPU)",
        category: "Laptops",
        price: 1450,
        qty: 1,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80",
        sku: "APL-MBA-M4-13",
        inStock: true,
    },
    {
        id: 2,
        name: "Sony ZV-1 20.1MP Vlogging 4K Digital Camera",
        category: "Cameras",
        price: 1100,
        qty: 2,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80",
        sku: "SNY-ZV1-BLK",
        inStock: true,
    },
    {
        id: 3,
        name: "Apple AirPods Pro 2nd Gen USB-C Active Noise Cancel",
        category: "Accessories",
        price: 249,
        qty: 1,
        image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200&q=80",
        sku: "APL-APP2-USBC",
        inStock: true,
    },
];

const VALID_COUPONS = {
    SAVE10: { type: "percent", value: 10, label: "10% off" },
    FLAT50: { type: "fixed", value: 50, label: "$50 off" },
    TECH20: { type: "percent", value: 20, label: "20% off" },
};

const FREE_SHIPPING_THRESHOLD = 399;

// ── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const TagIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);
const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const ChevronRight = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);
const HomeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const GiftIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4 2 2 0 000 4h4zm0 0V6a4 4 0 014-4 2 2 0 010 4h-4zm-7 4h14M5 12a2 2 0 00-2 2v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-2-2H5z" />
    </svg>
);

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb() {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <a href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
                <HomeIcon /> Home
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-semibold">Shopping Cart</span>
        </nav>
    );
}

// ── Quantity Control ─────────────────────────────────────────────────────────
function QtyControl({ value, onChange }) {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
            <button
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
            >
                −
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-sm font-black text-gray-800 border-x border-gray-200">
                {value}
            </span>
            <button
                onClick={() => onChange(value + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold"
            >
                +
            </button>
        </div>
    );
}

// ── Cart Item Row ────────────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
    const lineTotal = item.price * item.qty;

    return (
        <div className="group flex gap-4 p-4 sm:p-5 hover:bg-blue-50/30 transition-colors duration-150 rounded-2xl">
            {/* Image */}
            <div className="relative flex-shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100 shadow-sm"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                    {item.qty}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Name + remove */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-0.5">
                            {item.category}
                        </p>
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                            {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <TrashIcon />
                    </button>
                </div>

                {/* Price + qty + total */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">
                            ${item.price.toLocaleString()} ×
                        </span>
                        <QtyControl value={item.qty} onChange={(v) => onQtyChange(item.id, v)} />
                    </div>
                    <span className="text-base font-black text-gray-900">
                        ${lineTotal.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Empty Cart ───────────────────────────────────────────────────────────────
function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-black text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
            <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95"
            >
                <CartIcon /> Start Shopping
            </Link>
        </div>
    );
}

// ── Coupon Input ─────────────────────────────────────────────────────────────
function CouponInput({ applied, onApply, onRemove }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApply = () => {
        if (!code.trim()) return;
        setLoading(true);
        setError("");
        setTimeout(() => {
            const coupon = VALID_COUPONS[code.trim().toUpperCase()];
            if (coupon) {
                onApply({ code: code.trim().toUpperCase(), ...coupon });
                setCode("");
            } else {
                setError("Invalid coupon code. Try SAVE10, FLAT50 or TECH20.");
            }
            setLoading(false);
        }, 600);
    };

    if (applied) {
        return (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircleIcon />
                    <span className="text-sm font-bold">{applied.code}</span>
                    <span className="text-xs text-emerald-500">({applied.label})</span>
                </div>
                <button
                    onClick={onRemove}
                    className="text-emerald-500 hover:text-red-500 transition-colors"
                >
                    <XIcon />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <TagIcon />
                    </span>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApply()}
                        placeholder="Enter coupon code"
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400 font-medium tracking-wide"
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={!code.trim() || loading}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0"
                >
                    {loading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : "Apply"}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <XIcon /> {error}
                </p>
            )}
            <p className="text-[11px] text-gray-400">Try: <span className="font-mono font-bold">SAVE10</span>, <span className="font-mono font-bold">FLAT50</span>, <span className="font-mono font-bold">TECH20</span></p>
        </div>
    );
}

// ── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({ items }) {
    const [coupon, setCoupon] = useState(null);
    const [checkedOut, setCheckedOut] = useState(false);

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 29;

    const discount = coupon
        ? coupon.type === "percent"
            ? Math.round(subtotal * coupon.value / 100)
            : coupon.value
        : 0;

    const total = subtotal + shipping - discount;

    const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-black text-gray-800">Order Summary</h2>
                <p className="text-xs text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="px-5 py-5 space-y-4">

                {/* Free shipping progress */}
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="bg-blue-50 rounded-xl p-3.5 space-y-2">
                        <p className="text-xs font-bold text-blue-700">
                            Add <span className="text-blue-900">${remaining.toLocaleString()}</span> more for FREE shipping! 🚚
                        </p>
                        <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${shippingProgress}%` }}
                            />
                        </div>
                    </div>
                )}
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                    <div className="bg-emerald-50 rounded-xl p-3.5 flex items-center gap-2 text-emerald-700">
                        <CheckCircleIcon />
                        <p className="text-xs font-bold">You've unlocked FREE shipping! 🎉</p>
                    </div>
                )}

                {/* Line items */}
                <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-gray-800">${subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Shipping</span>
                        <span className={`font-bold ${shipping === 0 ? "text-emerald-600" : "text-gray-800"}`}>
                            {shipping === 0 ? "FREE" : `$${shipping}`}
                        </span>
                    </div>

                    {coupon && (
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <GiftIcon /> Discount ({coupon.code})
                            </span>
                            <span className="font-bold text-emerald-600">-${discount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Coupon */}
                <div>
                    <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
                        <TagIcon /> Coupon Code
                    </p>
                    <CouponInput
                        applied={coupon}
                        onApply={setCoupon}
                        onRemove={() => setCoupon(null)}
                    />
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Total */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-sm font-bold text-gray-600">Total</span>
                        <p className="text-[11px] text-gray-400">Incl. taxes & fees</p>
                    </div>
                    <span className="text-2xl font-black text-blue-600">${total.toLocaleString()}</span>
                </div>

                {/* Checkout button */}
                {checkedOut ? (
                    <div className="w-full py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black flex items-center justify-center gap-2">
                        <CheckCircleIcon /> Order Placed!
                    </div>
                ) : (
                    <button
                        onClick={() => setCheckedOut(true)}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all duration-150"
                    >
                        Proceed to Checkout <ChevronRight />
                    </button>
                )}

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 text-gray-400">
                    <LockIcon />
                    <span className="text-[11px] font-medium">Secure checkout — SSL encrypted</span>
                </div>

                {/* Payment icons */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {["VISA", "MC", "AMEX", "PayPal", "Apple Pay"].map((p) => (
                        <span key={p} className="text-[10px] font-black px-2.5 py-1 border border-gray-200 rounded-md text-gray-500 bg-gray-50">
                            {p}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Cart Page ────────────────────────────────────────────────────────────────
export default function Cart() {
    const [items, setItems] = useState(INITIAL_ITEMS);

    const handleQtyChange = (id, qty) =>
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));

    const handleRemove = (id) =>
        setItems((prev) => prev.filter((i) => i.id !== id));

    const handleClearAll = () => setItems([]);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Breadcrumb */}
                <Breadcrumb />

                {/* Page title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Shopping Cart
                        </h1>
                        <div className="flex gap-1 mt-1.5">
                            <div className="h-1 w-10 rounded-full bg-blue-600" />
                            <div className="h-1 w-4 rounded-full bg-yellow-400" />
                        </div>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <TrashIcon /> Clear All
                        </button>
                    )}
                </div>

                {/* Main layout */}
                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

                        {/* ── Left: Cart Items ── */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                            {/* List header */}
                            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                                <span>Product</span>
                                <span>Unit Price</span>
                                <span>Quantity</span>
                                <span>Total</span>
                                <span></span>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-50">
                                {items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onQtyChange={handleQtyChange}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                                <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Continue Shopping
                                </Link>
                                <div className="text-sm text-gray-500">
                                    {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
                                    <span className="font-black text-gray-800">
                                        ${items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Order Summary ── */}
                        <OrderSummary items={items} />
                    </div>
                )}
            </div>
        </main>
    );
}