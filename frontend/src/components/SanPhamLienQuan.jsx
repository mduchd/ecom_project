import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useAuth } from "../context/AuthContext.jsx";

export default function SPLienQuan({ category, currentId, onSelectProduct }) {
    const [listsp, setListsp] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toggleFavorite, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!category) return;
        const fetchRelated = async () => {
            setLoading(true);
            try {
                const data = await getProducts(category);
                if (Array.isArray(data)) {
                    // Lọc sản phẩm hiện tại ra và chỉ lấy tối đa 5 sản phẩm tương tự để giao diện cân đối
                    const filtered = data.filter(item => item.id !== currentId).slice(0, 5);
                    setListsp(filtered);
                }
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm tương tự:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [category, currentId]);

    const handleSelect = (item) => {
        if (onSelectProduct) {
            onSelectProduct(item);
        } else {
            navigate(`/product/${item.id}`);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className="mt-12 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Sản Phẩm Tương Tự</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!listsp || listsp.length === 0) {
        return null; // Không hiển thị nếu không có sản phẩm tương tự
    }

    return (
        <div className="relative mt-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sản Phẩm Tương Tự</h2>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {listsp.map((item, index) => {
                    const isAvailable = item.stockQuantity > 0;
                    return (
                        <div
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="group relative bg-white border border-gray-100 rounded-2xl p-4 flex flex-col pb-14 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            {/* Product Image */}
                            <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2">
                                <img
                                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    src={item.imageUrl || "https://via.placeholder.com/300x300?text=No+Image"}
                                    alt={item.name}
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image"; }}
                                />
                                {!isAvailable && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">Hết hàng</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem] mb-2">
                                {item.name}
                            </h3>

                            <div className="mt-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-red-600 font-black text-base">
                                        {item.price?.toLocaleString()}đ
                                    </p>
                                    {item.discountPrice && item.discountPrice > item.price && (
                                        <p className="text-xs text-gray-400 line-through">
                                            {item.discountPrice?.toLocaleString()}đ
                                        </p>
                                    )}
                                </div>

                                <div className="bg-green-50/50 rounded-lg p-2 border border-green-100">
                                    <p className="text-[10px] text-green-700 font-semibold line-clamp-2">
                                        Trả góp 0% lãi suất, tối đa 9 tháng qua thẻ tín dụng.
                                    </p>
                                </div>
                            </div>

                            {/* Wishlist Button */}
                            <div
                                className="absolute bottom-3 right-3 flex items-center rounded-lg gap-1.5 p-1 px-2 hover:bg-gray-100 cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item);
                                }}
                            >
                                <AiOutlineHeart className="text-blue-500 text-lg group-hover:hidden" />
                                <AiFillHeart className="text-blue-500 text-lg hidden group-hover:block animate-pulse" />
                                <span className="text-[11px] font-bold text-blue-500">Yêu thích</span>
                            </div>

                            {/* Badge */}
                            {item.discountPrice && item.discountPrice > item.price && (
                                <div className="absolute left-3 top-[-5px] rounded-md p-1 bg-red-600 shadow-sm shadow-red-100">
                                    <p className="text-white text-[9px] font-black uppercase">
                                        Giảm {(item.discountPrice - item.price).toLocaleString()}đ
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}