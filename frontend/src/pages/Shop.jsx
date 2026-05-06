// src/pages/Shop.jsx
import { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";

// ── Dummy Data ───────────────────────────────────────────────────────────────
export const ALL_PRODUCTS = [
    {
        id: 1,
        name: "Gigabyte AI TOP 100 Z890 Core Ultra",
        price: 1300, oldPrice: null,
        rating: 4, reviews: 12,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Best Selling", labelColor: "bg-blue-600",
        category: "Computers",
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
        category: "Laptops",
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
        category: "Accessories",
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
        category: "Cameras",
        isNew: false,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
        inStock: true,
    },
    {
        id: 5,
        name: "GIGABYTE AORUS AGC310 Gaming Chair",
        price: 800, oldPrice: 999,
        rating: 4, reviews: 9,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Sale", labelColor: "bg-red-500",
        category: "Accessories",
        isNew: false,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&q=80",
        inStock: true,
    },
    {
        id: 6,
        name: "ASUS ROG Strix G16 Gaming Laptop RTX 4070",
        price: 2199, oldPrice: 2499,
        rating: 5, reviews: 47,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Hot Deal", labelColor: "bg-orange-500",
        category: "Laptops",
        isNew: true,
        image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=300&q=80",
        inStock: true,
    },
    {
        id: 7,
        name: "Logitech G Pro X Superlight 2 Gaming Mouse",
        price: 159, oldPrice: null,
        rating: 5, reviews: 63,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Best Selling", labelColor: "bg-blue-600",
        category: "Accessories",
        isNew: true,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80",
        inStock: true,
    },
    {
        id: 8,
        name: "Canon EOS R50 Mirrorless Camera Body",
        price: 779, oldPrice: 899,
        rating: 5, reviews: 31,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Top Rated", labelColor: "bg-emerald-500",
        category: "Cameras",
        isNew: false,
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&q=80",
        inStock: true,
    },
    {
        id: 9,
        name: "Apple AirPods Pro 2nd Gen USB-C",
        price: 249, oldPrice: 279,
        rating: 5, reviews: 120,
        badge: "5% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Sale", labelColor: "bg-red-500",
        category: "Accessories",
        isNew: false,
        image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300&q=80",
        inStock: true,
    },
    {
        id: 10,
        name: "Apple Mac Mini M4 Pro 24GB RAM 512GB SSD",
        price: 1399, oldPrice: null,
        rating: 5, reviews: 19,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "New Arrival", labelColor: "bg-purple-500",
        category: "Computers",
        isNew: true,
        image: "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?w=300&q=80",
        inStock: true,
    },
    {
        id: 11,
        name: "Dell XPS 8960 Desktop Intel Core i9 RTX 4070",
        price: 1799, oldPrice: 2099,
        rating: 4, reviews: 14,
        badge: "10% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Hot Deal", labelColor: "bg-orange-500",
        category: "Computers",
        isNew: false,
        image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=300&q=80",
        inStock: false,
    },
    {
        id: 12,
        name: "TP-Link Archer AX53 AX3000 Gigabit Router",
        price: 89, oldPrice: null,
        rating: 4, reviews: 77,
        badge: "0% Installment", badgeColor: "bg-red-50 text-red-400",
        label: "Best Selling", labelColor: "bg-blue-600",
        category: "Networking",
        isNew: false,
        image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300&q=80",
        inStock: true,
    },
];

const CATEGORIES = ["All", "Laptops", "Computers", "Cameras", "Accessories", "Networking"];
const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Top Rated", value: "rating" },
    { label: "Newest First", value: "newest" },
];
const PAGE_SIZE = 8;

// ── Helpers ──────────────────────────────────────────────────────────────────
const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const HomeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
    </svg>
);

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ category }) {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <a href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
                <HomeIcon />
                Home
            </a>
            <span className="text-gray-300">/</span>
            <a href="/shop" className="hover:text-blue-600 transition-colors font-medium">
                Products
            </a>
            {category !== "All" && (
                <>
                    <span className="text-gray-300">/</span>
                    <span className="text-blue-600 font-semibold">{category}</span>
                </>
            )}
        </nav>
    );
}

// ── Select Dropdown ──────────────────────────────────────────────────────────
function SelectDropdown({ label, options, value, onChange }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer"
            >
                {options.map((opt) =>
                    typeof opt === "string" ? (
                        <option key={opt} value={opt}>{opt === "All" ? `${label}: All` : opt}</option>
                    ) : (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )
                )}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDownIcon />
            </span>
        </div>
    );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
function Toolbar({ category, setCategory, sort, setSort, total, currentCount }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            {/* Result count */}
            <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-800">{currentCount}</span> of{" "}
                <span className="font-bold text-gray-800">{total}</span> products
            </p>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:inline">
                    Filter:
                </span>
                <SelectDropdown
                    label="Category"
                    options={CATEGORIES}
                    value={category}
                    onChange={(val) => { setCategory(val); }}
                />
                <SelectDropdown
                    label="Sort"
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={setSort}
                />
            </div>
        </div>
    );
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
    if (total <= 1) return null;

    const pages = Array.from({ length: total }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1.5 mt-10">
            {/* Previous */}
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600
          hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600
          transition-all duration-150"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
            </button>

            {/* Page numbers */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onChange(page)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all duration-150
            ${current === page
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Next */}
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600
          hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600
          transition-all duration-150"
            >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-25" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <p className="text-base font-bold text-gray-500 mb-1">No products found</p>
            <p className="text-sm mb-5">Try adjusting your filters.</p>
            <button
                onClick={onReset}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
                Reset Filters
            </button>
        </div>
    );
}

// ── Shop Page ────────────────────────────────────────────────────────────────
export default function Shop() {
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("default");
    const [page, setPage] = useState(1);

    // Filter + sort
    const filtered = useMemo(() => {
        let list = category === "All"
            ? ALL_PRODUCTS
            : ALL_PRODUCTS.filter((p) => p.category === category);

        switch (sort) {
            case "price_asc": list = [...list].sort((a, b) => a.price - b.price); break;
            case "price_desc": list = [...list].sort((a, b) => b.price - a.price); break;
            case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
            case "newest": list = [...list].filter((p) => p.isNew).concat([...list].filter((p) => !p.isNew)); break;
            default: break;
        }
        return list;
    }, [category, sort]);

    // Reset page when filter changes
    const handleCategory = (val) => { setCategory(val); setPage(1); };
    const handleSort = (val) => { setSort(val); setPage(1); };
    const handleReset = () => { setCategory("All"); setSort("default"); setPage(1); };

    // Paginate
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* ── Breadcrumb + Title ── */}
                <div className="space-y-1.5">
                    <Breadcrumb category={category} />
                    <div className="flex items-end justify-between">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            {category === "All" ? "All Products" : category}
                        </h1>
                        <span className="text-sm text-gray-400 font-medium hidden sm:block">
                            {filtered.length} items
                        </span>
                    </div>
                    {/* Decorative underline */}
                    <div className="flex gap-1 pt-0.5">
                        <div className="h-1 w-10 rounded-full bg-blue-600" />
                        <div className="h-1 w-4 rounded-full bg-yellow-400" />
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <Toolbar
                    category={category}
                    setCategory={handleCategory}
                    sort={sort}
                    setSort={handleSort}
                    total={filtered.length}
                    currentCount={paginated.length}
                />

                {/* ── Product Grid ── */}
                {/* Phần Tiêu đề và Thanh công cụ bổ sung */}
                <div className="mb-8 mt-4">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-2">
                        Home <span className="mx-2">/</span> <span className="text-gray-900 font-medium">Products</span>
                    </div>

                    {/* Title & Sort */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">All Products</h1>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium hidden sm:block">Sort by:</span>
                            <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white cursor-pointer shadow-sm hover:border-gray-300 transition-colors">
                                <option>Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Top Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {paginated.length > 0 ? (
                        paginated.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <EmptyState onReset={handleReset} />
                    )}
                </div>

                {/* ── Pagination ── */}
                <Pagination
                    current={page}
                    total={totalPages}
                    onChange={setPage}
                />
            </div>
        </main>
    );
}