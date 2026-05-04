import { useState } from "react";
import { Link } from "react-router-dom";

// ── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeft = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

// ── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_ITEMS = [
    {
        id: 1,
        name: "MacBook Air M4 Chip 13-Inch",
        price: 1450,
        qty: 1,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80"
    },
    {
        id: 3,
        name: "Apple AirPods Pro 2nd Gen",
        price: 249,
        qty: 1,
        image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=100&q=80"
    }
];

export default function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState("credit_card");

    const subtotal = DUMMY_ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400";

    return (
        <div className="min-h-screen bg-white">
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>

            {/* ── Minimal Header ── */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-1 select-none flex-shrink-0">
                        <span className="text-2xl font-black tracking-tight">
                            <span className="text-blue-600">Snap</span>
                            <span className="text-yellow-400">cart</span>
                        </span>
                    </Link>
                    <Link to="/cart" className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                        <ChevronLeft /> Back to Cart
                    </Link>
                </div>
            </header>

            {/* ── Main Layout ── */}
            <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">

                    {/* ── Left Column: Form ── */}
                    <div className="space-y-8">

                        {/* Contact Info */}
                        <section>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Contact Information</h2>
                            <div>
                                <input type="email" placeholder="Email address" className={inputClass} />
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Shipping Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <input type="text" placeholder="Full Name" className={inputClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <input type="text" placeholder="Address" className={inputClass} />
                                </div>
                                <div>
                                    <input type="text" placeholder="City" className={inputClass} />
                                </div>
                                <div>
                                    <input type="text" placeholder="ZIP Code" className={inputClass} />
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className="text-lg font-black text-gray-900 mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                {/* Credit Card Toggle */}
                                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={() => setPaymentMethod('credit_card')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-bold text-gray-800 text-sm">Credit Card</span>
                                </label>

                                {/* Credit Card Form (Visible if selected) */}
                                {paymentMethod === 'credit_card' && (
                                    <div className="pl-7 space-y-3 animate-fadeIn">
                                        <input type="text" placeholder="Card Number (0000 0000 0000 0000)" className={inputClass} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="MM/YY" className={inputClass} />
                                            <input type="text" placeholder="CVC" className={inputClass} />
                                        </div>
                                    </div>
                                )}

                                {/* PayPal Toggle */}
                                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={() => setPaymentMethod('paypal')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-bold text-gray-800 text-sm">PayPal</span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* ── Right Column: Order Summary ── */}
                    <div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sticky top-6">
                            <h2 className="text-lg font-black text-gray-900 mb-6">Order Summary</h2>

                            {/* Mini Item List */}
                            <div className="space-y-4 mb-6">
                                {DUMMY_ITEMS.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200 bg-white" />
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                                {item.qty}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <h3 className="font-bold text-gray-800 line-clamp-2">{item.name}</h3>
                                            <p className="text-gray-500 mt-1">${item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-800">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span className="font-bold text-emerald-600">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between items-end mt-2">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-blue-600">${total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Checkout Action */}
                            <button className="w-full mt-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all duration-150">
                                Place Order
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}