// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/productService";
import { useAuth } from "../context/AuthContext.jsx";
import { FaHome, FaShoppingCart, FaHeart, FaRegHeart, FaCheck, FaStar, FaArrowLeft, FaSync, FaShieldAlt, FaTruck, FaExclamationTriangle } from "react-icons/fa";
import { FiGift } from "react-icons/fi";
import SPLienQuan from "../components/SanPhamLienQuan.jsx";
import Camket from "../components/CamKetSP.jsx";
import DanhGia from "../components/DanhGia.jsx";

// ── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => <FaHome className="w-3.5 h-3.5" />;
const CartIcon = () => <FaShoppingCart className="w-5 h-5" />;
const HeartIcon = ({ filled }) => filled ? <FaHeart className="w-5 h-5 text-red-500 transition-colors" /> : <FaRegHeart className="w-5 h-5 text-gray-500 transition-colors" />;
const CheckIcon = () => <FaCheck className="w-4 h-4" />;
const StarIcon = ({ filled }) => <FaStar className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-200"}`} />;
const ArrowLeftIcon = () => <FaArrowLeft className="w-4 h-4" />;
const RefreshIcon = () => <FaSync className="w-4 h-4" />;
const ShieldIcon = () => <FaShieldAlt className="w-5 h-5" />;
const TruckIcon = () => <FaTruck className="w-5 h-5" />;

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ productName, category }) {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
                <HomeIcon /> Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/shop" className="hover:text-blue-600 transition-colors font-medium text-vi">
                Cửa hàng
            </Link>
            {category && (
                <>
                    <span className="text-gray-300">/</span>
                    <Link
                        to={`/shop?category=${category}`}
                        className="hover:text-blue-600 transition-colors font-medium"
                    >
                        {category}
                    </Link>
                </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-semibold line-clamp-1 max-w-[200px]">
                {productName}
            </span>
        </nav>
    );
}

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating = 0, reviews = 0 }) {
    const safeRating = Math.min(5, Math.max(0, rating));
    return (
        <div className="flex items-center gap-2">
            <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < Math.round(safeRating)} />
                ))}
            </div>
            <span className="text-sm font-bold text-yellow-500">{safeRating.toFixed(1)}</span>
            {reviews > 0 && (
                <span className="text-sm text-gray-400 text-vi">({reviews.toLocaleString()} đánh giá)</span>
            )}
        </div>
    );
}

// ── Quantity Counter ─────────────────────────────────────────────────────────
function QuantityCounter({ value, onChange, max }) {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
            <button
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xl"
            >
                −
            </button>
            <input
                type="number"
                value={value}
                min={1}
                max={max}
                onChange={(e) => {
                    const v = Math.min(max, Math.max(1, Number(e.target.value) || 1));
                    onChange(v);
                }}
                className="w-14 h-10 text-center text-sm font-black text-gray-800 border-x border-gray-200 outline-none focus:bg-blue-50 transition-colors"
            />
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xl"
            >
                +
            </button>
        </div>
    );
}

// ── Trust Badges ─────────────────────────────────────────────────────────────
function TrustBadges() {
    return (
        <div className="grid grid-cols-2 gap-2.5">
            {[
                { icon: <TruckIcon />, label: "Miễn phí vận chuyển", sub: "Đơn từ 399.000đ", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: <ShieldIcon />, label: "Bảo hành 2 năm", sub: "Chính hãng", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(({ icon, label, sub, color, bg }) => (
                <div key={label} className={`flex items-center gap-2.5 p-3 rounded-xl ${bg}`}>
                    <span className={color}>{icon}</span>
                    <div>
                        <p className={`text-xs font-black ${color} text-vi`}>{label}</p>
                        <p className="text-[10px] text-gray-400 text-vi">{sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Specifications Parser ────────────────────────────────────────────────────
// specifications có thể là String dài, hoặc đã là Array từ backend
function SpecificationsTable({ specs }) {
    if (!specs) return <p className="text-sm text-gray-400 italic text-vi">Sản phẩm chưa có thông số kỹ thuật.</p>;

    let parsedSpecs = [];

    // Nếu dữ liệu từ Backend là một chuỗi (ví dụ: "CPU: Intel Core i7 | RAM: 16GB | ...")
    if (typeof specs === "string") {
        parsedSpecs = specs
            .split("|") // Cắt chuỗi dựa trên dấu '|'
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => {
                // Tách key và value dựa trên dấu ':'
                const colonIdx = item.indexOf(":");
                if (colonIdx === -1) return { label: item, value: "" };
                return {
                    label: item.substring(0, colonIdx).trim(),
                    value: item.substring(colonIdx + 1).trim(),
                };
            });
    }
    // Nếu dữ liệu từ Backend đã là một mảng Object (phòng hờ sau này nâng cấp Database)
    else if (typeof specs === "object" && !Array.isArray(specs)) {
        parsedSpecs = Object.entries(specs).map(([key, val]) => ({
            label: key.replace(/([A-Z])/g, " $1").trim().replace(/^./, str => str.toUpperCase()), // Viết hoa chữ cái đầu
            value: String(val)
        }));
    }

    // Hiển thị giao diện Table
    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
                <tbody>
                    {parsedSpecs.length > 0 ? (
                        parsedSpecs.map(({ label, value }, i) => (
                            <tr key={i} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                                <td className="px-5 py-3.5 font-bold text-gray-700 w-1/3 bg-gray-50/80 border-r border-gray-100 text-[11px] text-vi">
                                    {label}
                                </td>
                                <td className="px-5 py-3.5 text-gray-800 font-medium leading-relaxed">
                                    {value || "—"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-5 py-4 text-gray-500 italic text-center text-vi">Định dạng thông số không hợp lệ.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            {/* Left */}
            <div className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-2xl" />
                <div className="grid grid-cols-4 gap-2">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>
            {/* Right */}
            <div className="space-y-4 pt-2">
                <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                <div className="h-8 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 rounded-full w-1/3" />
                <div className="h-6 bg-gray-100 rounded-full w-1/4" />
                <div className="space-y-2 pt-2">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-3 bg-gray-100 rounded-full" />
                    ))}
                </div>
                <div className="h-12 bg-gray-100 rounded-xl w-full mt-4" />
            </div>
        </div>
    );
}

// ── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FaExclamationTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-base font-black text-gray-700 mb-1 text-vi">Không tìm thấy sản phẩm</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs text-vi">{message}</p>
            <div className="flex items-center gap-3">
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-vi"
                >
                    <ArrowLeftIcon /> Quay lại cửa hàng
                </Link>
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-100 text-vi"
                >
                    <RefreshIcon /> Thử lại
                </button>
            </div>
        </div>
    );
}

// ── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({ imageUrl, subImages, name }) {
    const [zoomed, setZoomed] = useState(false);
    const [active, setActive] = useState(0);

    // Build the thumbs array from imageUrl and parsed subImages
    const thumbs = [imageUrl];
    if (subImages && typeof subImages === "string") {
        const parsed = subImages.split(",").map(s => s.trim()).filter(Boolean);
        thumbs.push(...parsed);
    }
    const finalThumbs = thumbs.filter(Boolean);
    const displayThumbs = finalThumbs.length > 0 ? finalThumbs : ["https://via.placeholder.com/600x600?text=No+Image"];

    // Reset active thumbnail and zoom when imageUrl or subImages change
    useEffect(() => {
        setActive(0);
        setZoomed(false);
    }, [imageUrl, subImages]);

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
                onClick={() => setZoomed(!zoomed)}
                className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-md cursor-zoom-in aspect-square"
            >
                <img
                    src={displayThumbs[active] || "https://via.placeholder.com/600x600?text=No+Image"}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${zoomed ? "scale-150" : "scale-100"}`}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=No+Image"; }}
                />
                <span className="absolute bottom-3 right-3 bg-black/25 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {zoomed ? "Nhấn để thu nhỏ" : "Nhấn để phóng to"}
                </span>
            </div>

            {/* Thumbnails */}
            {displayThumbs.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {displayThumbs.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => { setActive(i); setZoomed(false); }}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150
                  ${active === i
                                    ? "border-blue-600 shadow-md shadow-blue-100"
                                    : "border-gray-100 hover:border-gray-300"}`}
                        >
                            <img
                                src={img}
                                alt={`${name} view ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/100x100?text=?"; }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Product Info ─────────────────────────────────────────────────────────────
function ProductInfo({ product, onAddToCart }) {
    const [qty, setQty] = useState(1);
    const [wished, setWished] = useState(false);
    const [addedToCart, setAdded] = useState(false);

    // ── Map đúng tên field từ Backend ──
    const {
        name,
        brand,
        category,
        price,
        discountPrice,    // giá gốc (trước khi giảm)
        stockQuantity,    // số lượng tồn kho
        rating,
        reviews,
        description,
        specifications,
    } = product;

    const inStock = stockQuantity > 0;
    const maxQty = inStock ? stockQuantity : 0;
    const savedPrice = discountPrice && discountPrice > price
        ? discountPrice - price
        : null;

    const handleAddToCart = () => {
      if (!inStock) return;
      onAddToCart(
        {
          ...product,
          image: product.imageUrl || product.image || "",
        },
        qty
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Brand + Category badges */}
            <div className="flex items-center gap-2 flex-wrap">
                {brand && (
                    <span className="text-xs font-black text-gray-400 text-vi">
                        {brand}
                    </span>
                )}
                {brand && category && <span className="text-gray-200">·</span>}
                {category && (
                    <Link
                        to={`/shop?category=${category}`}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        {category}
                    </Link>
                )}
            </div>

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {name}
            </h1>

            {/* Star rating */}
            {rating !== undefined && (
                <StarRating rating={rating} reviews={reviews} />
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Price block */}
            <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-black text-blue-600">
                    {Number(price).toLocaleString()}đ
                </span>
                {discountPrice && discountPrice > price && (
                    <div className="flex flex-col mb-1">
                        <span className="text-sm text-gray-400 line-through font-medium">
                            {Number(discountPrice).toLocaleString()}đ
                        </span>
                        {savedPrice && (
                            <span className="text-xs font-bold text-red-500">
                                Tiết kiệm {savedPrice.toLocaleString()}đ
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {description}
                </p>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Stock status */}
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                <span className={`text-sm font-bold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                    {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
                {inStock && (
                    <span className="text-xs text-gray-400 text-vi">
                        (Còn {stockQuantity} sản phẩm)
                    </span>
                )}
            </div>

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-3">
                {inStock && (
                    <div className="flex items-center gap-3 flex-wrap">
                        <QuantityCounter value={qty} onChange={setQty} max={maxQty} />
                        <span className="text-sm text-gray-500 font-medium text-vi">
                            Tổng:{" "}
                            <span className="font-black text-gray-900">
                                {(Number(price) * qty).toLocaleString()}đ
                            </span>
                        </span>
                    </div>
                )}

                {/* Buttons row */}
                <div className="flex gap-2">
                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-black
              transition-all duration-200 shadow-lg active:scale-[0.98]
              ${addedToCart
                                ? "bg-emerald-500 shadow-emerald-100 text-white"
                                : inStock
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                            }`}
                    >
                        {addedToCart ? (
                            <><CheckIcon /> Đã thêm vào giỏ!</>
                        ) : (
                            <><CartIcon /> {inStock ? "Thêm vào giỏ" : "Hết hàng"}</>
                        )}
                    </button>

                    {/* Wishlist */}
                    <button
                        onClick={() => setWished(!wished)}
                        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-95 flex-shrink-0
              ${wished
                                ? "border-red-200 bg-red-50"
                                : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50"
                            }`}
                    >
                        <HeartIcon filled={wished} />
                    </button>
                </div>
            </div>

            {/* Trust badges */}
            <TrustBadges />

            {/* Promotions block */}
            <div className="border w-full h-auto p-4 bg-green-50/50 rounded-2xl border-yellow-300/50 flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FiGift className="text-red-500 w-5 h-5 animate-bounce"/>
                        <p className="font-black text-sm text-gray-800 text-vi">Khuyến mãi đi kèm</p>
                    </div>
                </div>
                {[
                    "Trả góp 0% lãi suất, tối đa 9 tháng qua thẻ tín dụng.",
                    "Giảm 1.000.000đ khi mua kèm combo điện thoại + phụ kiện chính hãng.",
                    "Giảm thêm 10% cho các sản phẩm công nghệ đi kèm."
                ].map((vl, index) => (
                    <div key={index} className="flex gap-3 items-start">
                        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-green-200 flex items-center justify-center font-bold text-xs text-green-800 border border-green-300">
                            {index + 1}
                        </div>
                        <p className="text-xs text-gray-700 font-semibold leading-relaxed">{vl}</p>
                    </div>
                ))}
            </div>

            {/* Commitments (Camket) */}
            <div className="w-full">
                <Camket />
            </div>

            {/* Meta info */}
            <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-1">
                {brand && <span className="text-vi">Thương hiệu: <strong className="text-gray-700">{brand}</strong></span>}
                {category && <span className="text-vi">Danh mục: <strong className="text-gray-700">{category}</strong></span>}
            </div>
        </div>
    );
}

// ── Detail Tabs ───────────────────────────────────────────────────────────────
const TABS = [
    { id: "Description", label: "Mô tả" },
    { id: "Specifications", label: "Thông số kỹ thuật" },
];

function DetailTabs({ product }) {
    const [active, setActive] = useState("Description");

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab nav */}
            <div className="flex border-b border-gray-100">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActive(tab.id)}
                        className={`px-6 py-4 text-sm font-bold transition-all duration-150 border-b-2 text-vi
              ${active === tab.id
                                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="p-6 sm:p-8">
                {active === "Description" && (
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-vi">
                        {product.description || (
                            <p className="text-gray-400 italic">Chưa có mô tả sản phẩm.</p>
                        )}
                    </div>
                )}

                {active === "Specifications" && (
                    <SpecificationsTable specs={product.specifications} />
                )}
            </div>
        </div>
    );
}

// ── Main ProductDetail Page ───────────────────────────────────────────────────
export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProductById(id);
            setProduct(data);
        } catch (err) {
            const status = err.response?.status;
            setError(
                status === 404
                    ? `Không tìm thấy sản phẩm với mã "${id}".`
                    : status === 503 || !err.response
                        ? "Không thể kết nối máy chủ. Vui lòng đảm bảo backend đang chạy ở cổng 8080."
                        : err.message || "Đã xảy ra lỗi."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    return (
        <main lang="vi" className="min-h-screen bg-gray-50">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Breadcrumb — luôn hiển thị */}
                <div className="flex items-center justify-between gap-4">
                    <Breadcrumb
                        productName={product?.name ?? "Đang tải..."}
                        category={product?.category}
                    />
                    <Link
                        to="/shop"
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                    >
                        <ArrowLeftIcon /> Quay lại cửa hàng
                    </Link>
                </div>

                {/* ── Loading ── */}
                {loading && <LoadingSkeleton />}

                {/* ── Error ── */}
                {!loading && error && (
                    <ErrorState message={error} onRetry={fetchProduct} />
                )}

                {/* ── Content ── */}
                {!loading && !error && product && (
                    <>
                        {/* 2-column grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                            <ImageGallery imageUrl={product.imageUrl} subImages={product.subImages} name={product.name} />
                            <ProductInfo product={product} onAddToCart={addToCart} />
                        </div>

                        {/* Detail tabs */}
                        <DetailTabs product={product} />

                        {/* Related Products */}
                        <SPLienQuan category={product.category} currentId={product.id} />

                        {/* Reviews & Ratings */}
                        <DanhGia sanPhamHienTai={product} />
                    </>
                )}
            </div>
        </main>
    );
}
