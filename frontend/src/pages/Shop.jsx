// src/pages/Shop.jsx
import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";

// ── Constants ────────────────────────────────────────────────────────────────
// Thay thế dòng CATEGORIES cũ bằng dòng này:
const CATEGORIES = ["All", "Laptop", "Điện thoại", "Máy tính bảng", "Phụ kiện", "Âm thanh"];

const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Top Rated", value: "rating" },
    { label: "Newest First", value: "newest" },
];

const PAGE_SIZE = 8;

// ── Helper: sort locally sau khi đã fetch về ─────────────────────────────────
const sortProducts = (list, sort) => {
    switch (sort) {
        case "price_asc": return [...list].sort((a, b) => a.price - b.price);
        case "price_desc": return [...list].sort((a, b) => b.price - a.price);
        case "rating": return [...list].sort((a, b) => b.rating - a.rating);
        case "newest": return [...list].sort((a, b) => (b.isNewProduct ? 1 : 0) - (a.isNewProduct ? 1 : 0));
        default: return list;
    }
};

// ── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
    </svg>
);
const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);
const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ category }) {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
                <HomeIcon /> Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/shop" className="hover:text-blue-600 transition-colors font-medium">
                Products
            </Link>
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
function SelectDropdown({ options, value, onChange }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer"
            >
                {options.map((opt) =>
                    typeof opt === "string"
                        ? <option key={opt} value={opt}>{opt}</option>
                        : <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDownIcon />
            </span>
        </div>
    );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
function Toolbar({ category, setCategory, sort, setSort, search, setSearch, total, currentCount }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-800">{currentCount}</span> of{" "}
                <span className="font-bold text-gray-800">{total}</span> products
            </p>

            <div className="flex items-center gap-2 flex-wrap">
                {/* Search input */}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-44 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                </div>

                <SelectDropdown options={CATEGORIES} value={category} onChange={setCategory} />
                <SelectDropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />
            </div>
        </div>
    );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-44 bg-gray-100" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                <div className="h-4 bg-gray-100 rounded-full w-full" />
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-2" />
            </div>
        </div>
    );
}

function LoadingSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
    );
}

// ── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-base font-black text-gray-700 mb-1">Failed to load products</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-xs">{message}</p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-100"
            >
                <RefreshIcon /> Try Again
            </button>
        </div>
    );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-14 h-14 opacity-20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <p className="font-bold text-gray-500 mb-1">No products found</p>
            <p className="text-sm mb-5">Try adjusting your filters or search term.</p>
            <button
                onClick={onReset}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
                Reset Filters
            </button>
        </div>
    );
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
    if (total <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-1.5 mt-10">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
            </button>

            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onChange(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
            ${current === i + 1
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        }`}
                >
                    {i + 1}
                </button>
            ))}

            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ── Shop Page ────────────────────────────────────────────────────────────────
export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    // ── Filter / sort state ──
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [sort, setSort] = useState("default");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // ── API state ────────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch từ API ─────────────────────────────────────────────────────────
    // useCallback để tránh tạo lại hàm mỗi render
    useEffect(() => {
        const urlCat = searchParams.get("category") || "All";
        setCategory(urlCat);
    }, [searchParams]);
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Gửi category & search lên Backend để lọc ở server
            const data = await getProducts(category, search);
            setProducts(data);
            setPage(1); // reset về trang 1 sau mỗi lần fetch
        } catch (err) {
            setError(
                err.response?.status === 503
                    ? "Cannot connect to server. Please make sure the backend is running on port 8080."
                    : err.message || "Something went wrong."
            );
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    // Gọi API mỗi khi category hoặc search thay đổi
    // Dùng debounce nhẹ cho search để không gọi API liên tục
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, search ? 400 : 0); // debounce 400ms khi đang gõ search

        return () => clearTimeout(timer);
    }, [fetchProducts, search]);

    // ── Sort cục bộ (không cần gọi lại API) ──────────────────────────────────
    const sorted = sortProducts(products, sort);
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleCategory = (val) => {
        setCategory(val);
        setPage(1);
        // Đẩy category mới lên thanh địa chỉ (URL)
        if (val === "All") {
            setSearchParams({});
        } else {
            setSearchParams({ category: val });
        }
    };
    const handleSort = (val) => { setSort(val); setPage(1); };
    const handleSearch = (val) => { setSearch(val); setPage(1); };
    const handleReset = () => { setCategory("All"); setSort("default"); setSearch(""); setPage(1); };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Breadcrumb */}
                <Breadcrumb category={category} />

                {/* Page title */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            {category === "All" ? "All Products" : category}
                        </h1>
                        <div className="flex gap-1 mt-1.5">
                            <div className="h-1 w-10 rounded-full bg-blue-600" />
                            <div className="h-1 w-4 rounded-full bg-yellow-400" />
                        </div>
                    </div>
                    {!loading && !error && (
                        <span className="text-sm text-gray-400 font-medium hidden sm:block">
                            {products.length} items found
                        </span>
                    )}
                </div>

                {/* Toolbar */}
                <Toolbar
                    category={category} setCategory={handleCategory}
                    sort={sort} setSort={handleSort}
                    search={search} setSearch={handleSearch}
                    total={sorted.length}
                    currentCount={paginated.length}
                />

                {/* ── Content area ── */}
                {loading ? (
                    <LoadingSkeleton count={PAGE_SIZE} />
                ) : error ? (
                    <ErrorState message={error} onRetry={fetchProducts} />
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {paginated.length > 0
                                ? paginated.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                                : <EmptyState onReset={handleReset} />
                            }
                        </div>

                        <Pagination
                            current={page}
                            total={totalPages}
                            onChange={setPage}
                        />
                    </>
                )}
            </div>
        </main>
    );
}