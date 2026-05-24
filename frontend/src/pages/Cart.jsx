import { useState } from "react";
import { Link } from 'react-router-dom';
import ThanhToan from "./ThanhToan";
import { useAuth } from "../context/AuthContext.jsx";
import { FaTrash, FaTag, FaShoppingCart, FaLock, FaChevronRight, FaHome, FaCheckCircle, FaTimes, FaGift, FaSpinner, FaCheck, FaArrowLeft, FaTruck } from "react-icons/fa";

const VALID_COUPONS = {
    SAVE10: { type: "percent", value: 10, label: "10% giảm" },
    FLAT50: { type: "fixed", value: 50000, label: "Giảm 50.000đ" },
    TECH20: { type: "percent", value: 20, label: "20% giảm" },
};

const FREE_SHIPPING_THRESHOLD = 2000000;

// ── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => <FaTrash className="w-4 h-4" />;
const TagIcon = () => <FaTag className="w-4 h-4" />;
const CartIcon = () => <FaShoppingCart className="w-5 h-5" />;
const LockIcon = () => <FaLock className="w-4 h-4" />;
const ChevronRight = () => <FaChevronRight className="w-4 h-4" />;
const HomeIcon = () => <FaHome className="w-3.5 h-3.5" />;
const CheckCircleIcon = () => <FaCheckCircle className="w-4 h-4" />;
const XIcon = () => <FaTimes className="w-3.5 h-3.5" />;
const GiftIcon = () => <FaGift className="w-4 h-4" />;

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
                            {item.name} {item.variant && `- ${item.variant}`} {item.color && `(${item.color})`}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Mã SP: {item.cartId}</p>
                    </div>
                    <button
                        onClick={() => onRemove(item.cartId)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <TrashIcon />
                    </button>
                </div>

                {/* Price + qty + total */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">
                            {item.price?.toLocaleString()}đ ×
                        </span>
                        <QtyControl value={item.qty} onChange={(v) => onQtyChange(item.cartId, v)} />
                    </div>
                    <span className="text-base font-black text-gray-900">
                        {lineTotal?.toLocaleString()}đ
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
                <FaShoppingCart className="w-10 h-10 text-gray-300" />
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
                    {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : "Apply"}
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
                        <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                            Mua thêm <span className="text-blue-900">{remaining.toLocaleString()}đ</span> để được miễn phí vận chuyển! <FaTruck className="text-blue-700" />
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
                        <p className="text-xs font-bold">Bạn đã mở khóa MIỄN PHÍ vận chuyển! 🎉</p>
                    </div>
                )}

                {/* Line items */}
                <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tạm tính</span>
                        <span className="font-bold text-gray-800">{subtotal.toLocaleString()}đ</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Phí vận chuyển</span>
                        <span className={`font-bold ${shipping === 0 ? "text-emerald-600" : "text-gray-800"}`}>
                            {shipping === 0 ? "MIỄN PHÍ" : `${shipping.toLocaleString()}đ`}
                        </span>
                    </div>

                    {coupon && (
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <GiftIcon /> Giảm giá ({coupon.code})
                            </span>
                            <span className="font-bold text-emerald-600">-{discount.toLocaleString()}đ</span>
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
                        <span className="text-sm font-bold text-gray-600">Tổng cộng</span>
                        <p className="text-[11px] text-gray-400">Đã bao gồm thuế & phí</p>
                    </div>
                    <span className="text-2xl font-black text-blue-600">{total.toLocaleString()}đ</span>
                </div>

                {/* Checkout button */}
                {checkedOut ? (
                    <div className="w-full py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black flex items-center justify-center gap-2">
                        <CheckCircleIcon /> Order Placed!
                    </div>
                ) : (
                    < Link to="/checkout"
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all duration-150"
                    >
                        Proceed to Checkout <ChevronRight />
                    </Link>
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
        </div >
    );
}

// ── Cart Page ────────────────────────────────────────────────────────────────
export default function Cart() {
    const { cart: items, updateCartQty, removeFromCart, clearCart } = useAuth();

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
                            onClick={clearCart}
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
                            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <CartItem
                                        key={item.cartId}
                                        item={item}
                                        onQtyChange={updateCartQty}
                                        onRemove={removeFromCart}
                                    />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                                <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                    <FaArrowLeft className="w-4 h-4" />
                                    Tiếp tục mua sắm
                                </Link>
                                <div className="text-sm text-gray-500">
                                    {items.length} sản phẩm ·{" "}
                                    <span className="font-black text-gray-800">
                                        {items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}đ
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