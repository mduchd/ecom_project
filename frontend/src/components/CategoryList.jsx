import { Link } from "react-router-dom";

const CATEGORIES = [
    { 
        name: "Điện thoại", 
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&q=80", 
        to: "/shop?category=Điện thoại" 
    },
    { 
        name: "Laptop", 
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&q=80", 
        to: "/shop?category=Laptop" 
    },
    { 
        name: "Máy tính bảng", 
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&q=80", 
        to: "/shop?category=Máy tính bảng" 
    },
    { 
        name: "Âm thanh", 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80", 
        to: "/shop?category=Âm thanh" 
    },
    { 
        name: "Phụ kiện", 
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=150&q=80", 
        to: "/shop?category=Phụ kiện" 
    }
];

export default function CategoryList() {
    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-black text-gray-900 text-vi">Danh mục nổi bật</h2>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {CATEGORIES.map((cat, i) => (
                        <Link
                            key={i}
                            to={cat.to}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 group text-center cursor-pointer border border-transparent hover:border-gray-100 hover:bg-gray-50/50 hover:shadow-sm"
                        >
                            {/* Circle Image Wrapper */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center mb-3 shadow-inner border border-gray-100 bg-gray-50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                                <img 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Category"; }}
                                />
                            </div>
                            <span className="text-xs font-black text-gray-700 group-hover:text-blue-600 transition-colors leading-tight">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
