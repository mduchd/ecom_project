import { useState } from "react";
import { Link } from 'react-router-dom';

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, reviews }) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                        key={i}
                        className={`w-3 h-3 ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            {reviews !== undefined && (
                <span className="text-[11px] text-gray-400">({reviews})</span>
            )}
        </div>
    );
}

// ── Cart Icon ────────────────────────────────────────────────────────────────
function CartIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

// ── Heart Icon ───────────────────────────────────────────────────────────────
function HeartIcon({ filled }) {
    return (
        <svg
            className={`w-4 h-4 transition-colors ${filled ? "text-red-500" : "text-gray-300"}`}
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

// ── ProductCard ──────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
    const [wished, setWished] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1500);
    };
// "/chi-tiet"
// {`/product/${product.id}`}
    return (
        <Link to="/chi-tiet" className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">

            {/* Wishlist button */}
            <button
                onClick={(e) => { e.preventDefault(); setWished(!wished); }}
                className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
                <HeartIcon filled={wished} />
            </button>

            {/* NEW badge */}
            {product.isNew && (
                <span className="absolute top-2.5 left-2.5 z-10 bg-yellow-400 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    NEW
                </span>
            )}

            {/* Installment badge */}
            {product.badge && (
                <div className={`absolute top-0 left-0 right-0 flex justify-center pt-1 z-10 ${product.isNew ? "pl-12" : ""}`}>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${product.badgeColor} border border-current border-opacity-20`}>
                        {product.badge}
                    </span>
                </div>
            )}

            {/* Product Image */}
            <div className="relative h-44 bg-gray-50 flex items-center justify-center p-4 overflow-hidden mt-5">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 px-3.5 pb-3.5 pt-2.5 gap-1.5">

                {/* Status label */}
                {product.label && (
                    <span className={`self-start text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full ${product.labelColor}`}>
                        {product.label}
                    </span>
                )}

                {/* Product name */}
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* Stars */}
                <StarRating rating={product.rating} reviews={product.reviews} />

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-gray-900">
                        ${product.price.toLocaleString()}
                    </span>
                    {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                            ${product.oldPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Stock */}
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                    <span className={`text-[11px] font-medium ${product.inStock ? "text-emerald-600" : "text-red-400"}`}>
                        {product.inStock ? "In stock" : "Out of stock"}
                    </span>
                </div>

                {/* Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`mt-1.5 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold
            opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
            transition-all duration-300
            ${addedToCart
                            ? "bg-emerald-500 text-white"
                            : product.inStock
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    {addedToCart ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Added!
                        </>
                    ) : (
                        <>
                            <CartIcon />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </Link>
    );
}