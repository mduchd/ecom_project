import { useState, useEffect } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "./ProductCard";
import { FaFire, FaClock } from "react-icons/fa";

export default function FlashSale() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Countdown Timer (Đếm ngược 3 giờ từ lúc mở trang hoặc đếm ngược đến cuối ngày)
    const [timeLeft, setTimeLeft] = useState(10800); // 3 tiếng = 10800 giây

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 10800));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return { h, m, s };
    };

    const { h, m, s } = formatTime(timeLeft);

    useEffect(() => {
        const fetchPromoProducts = async () => {
            try {
                const data = await getProducts();
                if (Array.isArray(data)) {
                    // Lấy các sản phẩm có giảm giá trước, nếu không đủ thì lấy sản phẩm thường
                    let promo = data.filter(item => item.discountPrice && item.discountPrice > item.price);
                    if (promo.length === 0) {
                        promo = data.slice(0, 5);
                    }
                    setProducts(promo.slice(0, 5));
                }
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm Flash Sale:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromoProducts();
    }, []);

    if (loading) {
        return (
            <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
                <div className="bg-blue-500 rounded-2xl p-5 animate-pulse h-80" />
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-5 shadow-lg border border-blue-500">
                
                {/* Header Flash Sale */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-white/20 pb-4">
                    <div className="flex items-center gap-2.5 text-white">
                        <FaFire className="w-7 h-7 text-yellow-300 animate-bounce" />
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">FLASH SALE GIỜ VÀNG</h2>
                    </div>
                    
                    {/* Countdown Timer Boxes */}
                    <div className="flex items-center gap-2 text-white">
                        <FaClock className="w-4 h-4 text-white/80" />
                        <span className="text-xs font-bold mr-1">KẾT THÚC SAU:</span>
                        <div className="flex items-center gap-1 font-mono text-sm font-black">
                            <span className="bg-white text-blue-600 px-2.5 py-1 rounded-lg shadow-sm">{h}</span>
                            <span>:</span>
                            <span className="bg-white text-blue-600 px-2.5 py-1 rounded-lg shadow-sm">{m}</span>
                            <span>:</span>
                            <span className="bg-white text-blue-600 px-2.5 py-1 rounded-lg shadow-sm">{s}</span>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
