import { Link } from "react-router-dom";

const CATEGORIES = [
    {
        name: "Dien thoai",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/i/p/iphone-16-pro-max.png",
        to: `/shop?category=${encodeURIComponent("Điện thoại")}`
    },
    {
        name: "Laptop",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/m/a/macbook_2__5.png",
        to: "/shop?category=Laptop"
    },
    {
        name: "May tinh bang",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/f/r/frame_100_1_2__2.png",
        to: `/shop?category=${encodeURIComponent("Máy tính bảng")}`
    },
    {
        name: "Am thanh",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/f/r/frame_428_2.png",
        to: `/shop?category=${encodeURIComponent("Âm thanh")}`
    },
    {
        name: "Phu kien",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/t/e/text_ng_n_93__1_3.png",
        to: `/shop?category=${encodeURIComponent("Phụ kiện")}`
    },
    {
        name: "Dong ho",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/a/p/apple_lte_4__1_4.png",
        to: `/shop?category=${encodeURIComponent("Đồng hồ thông minh")}`
    },
    {
        name: "Man hinh",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/g/r/group_895_1_.png",
        to: `/shop?category=${encodeURIComponent("Màn hình")}`
    },
    {
        name: "Mang",
        image: "https://cdn2.cellphones.com.vn/x/media/catalog/product/w/i/wifi-mesh-tp-link-deco-x20-wifi-6-ax1800-3-pack.png",
        to: `/shop?category=${encodeURIComponent("Mạng")}`
    }
];

export default function CategoryList() {
    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-black text-gray-900">Danh muc noi bat</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={cat.to}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 group text-center cursor-pointer border border-transparent hover:border-gray-100 hover:bg-gray-50/50 hover:shadow-sm"
                        >
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
