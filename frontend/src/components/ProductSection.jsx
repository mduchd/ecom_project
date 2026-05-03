import { useState } from "react";
import ProductCard from "./ProductCard";

// ── Dummy Data ───────────────────────────────────────────────────────────────
const TABS = [
    "Top 30", "PC Gaming", "Computers",
    "Cameras", "Gadgets", "Smart Home", "Sport Equipments",
];

const PRODUCTS = {
    "Top 30": [
        {
            id: 1,
            name: "Gigabyte AI TOP 100 Z890 Core Ultra",
            price: 1300, oldPrice: null,
            rating: 4, reviews: 12,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: true,
            image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&q=80",
            inStock: true,
        },
        {
            id: 2,
            name: "MacBook Air M4 Chip 13-Inch (10-Core CPU, 8 Core GPU)",
            price: 1450, oldPrice: null,
            rating: 5, reviews: 34,
            badge: "5% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Top Rated", labelColor: "bg-emerald-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80",
            inStock: true,
        },
        {
            id: 3,
            name: 'BenQ GW2486TC 23.8" 100Hz IPS FHD Monitor',
            price: 800, oldPrice: null,
            rating: 4, reviews: 21,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Top Rated", labelColor: "bg-emerald-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80",
            inStock: true,
        },
        {
            id: 4,
            name: "Sony ZV-1 20.1MP Vlogging 4K Digital Camera",
            price: 1100, oldPrice: null,
            rating: 4, reviews: 18,
            badge: "10% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: false,
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
            inStock: true,
        },
        {
            id: 5,
            name: "GIGABYTE AORUS AGC310 Gaming Chair",
            price: 800, oldPrice: null,
            rating: 4, reviews: 9,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: false,
            image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&q=80",
            inStock: true,
        },
    ],
    "PC Gaming": [
        {
            id: 6,
            name: "ASUS ROG Strix G16 Gaming Laptop RTX 4070",
            price: 2199, oldPrice: 2499,
            rating: 5, reviews: 47,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Hot Deal", labelColor: "bg-orange-500",
            isNew: true,
            image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=300&q=80",
            inStock: true,
        },
        {
            id: 7,
            name: "Corsair K70 RGB TKL Mechanical Gaming Keyboard",
            price: 109, oldPrice: 139,
            rating: 4, reviews: 88,
            badge: "5% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Top Rated", labelColor: "bg-emerald-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&q=80",
            inStock: true,
        },
        {
            id: 8,
            name: "Logitech G Pro X Superlight 2 Gaming Mouse",
            price: 159, oldPrice: null,
            rating: 5, reviews: 63,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: true,
            image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80",
            inStock: true,
        },
        {
            id: 9,
            name: 'Samsung Odyssey G7 32" Curved Gaming Monitor',
            price: 699, oldPrice: 799,
            rating: 4, reviews: 29,
            badge: "10% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Top Rated", labelColor: "bg-emerald-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=300&q=80",
            inStock: true,
        },
        {
            id: 10,
            name: "HyperX Cloud Alpha Wireless Gaming Headset",
            price: 199, oldPrice: 249,
            rating: 4, reviews: 55,
            badge: "5% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: false,
            image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80",
            inStock: true,
        },
    ],
    Cameras: [
        {
            id: 11,
            name: "Canon EOS R50 Mirrorless Camera Body",
            price: 779, oldPrice: 899,
            rating: 5, reviews: 31,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Top Rated", labelColor: "bg-emerald-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&q=80",
            inStock: true,
        },
        {
            id: 12,
            name: "DJI Osmo Pocket 3 Creator Combo Stabilizer",
            price: 519, oldPrice: null,
            rating: 5, reviews: 42,
            badge: "5% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: true,
            image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300&q=80",
            inStock: true,
        },
    ],
    Computers: [
        {
            id: 13,
            name: "Apple Mac Mini M4 Pro 24GB RAM 512GB SSD",
            price: 1399, oldPrice: null,
            rating: 5, reviews: 19,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "New Arrival", labelColor: "bg-purple-500",
            isNew: true,
            image: "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?w=300&q=80",
            inStock: true,
        },
        {
            id: 14,
            name: "Dell XPS 8960 Desktop Intel Core i9 RTX 4070",
            price: 1799, oldPrice: 2099,
            rating: 4, reviews: 14,
            badge: "10% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Hot Deal", labelColor: "bg-orange-500",
            isNew: false,
            image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=300&q=80",
            inStock: false,
        },
    ],
    Gadgets: [
        {
            id: 15,
            name: "Apple AirPods Pro 2nd Gen USB-C Active Noise Cancel",
            price: 249, oldPrice: 279,
            rating: 5, reviews: 120,
            badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
            label: "Best Selling", labelColor: "bg-blue-600",
            isNew: false,
            image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300&q=80",
            inStock: true,
        },
    ],
    "Smart Home": [],
    "Sport Equipments": [],
};

// ── ProductSection ───────────────────────────────────────────────────────────
export default function ProductSection({
    title = "Best Seller",
    tabs = TABS,
    productsMap = PRODUCTS,
    viewAllHref = "#",
}) {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const products = productsMap[activeTab] ?? [];

    return (
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6">

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
                <a
                    href={viewAllHref || "#"}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                    VIEW ALL
                </a>
            </div>
            {/* Tab pills */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
              ${activeTab === tab
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {
                products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                        </svg>
                        <p className="text-sm font-semibold">No products in this category yet.</p>
                    </div>
                )
            }
        </section >
    );
}