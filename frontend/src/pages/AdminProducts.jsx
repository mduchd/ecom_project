// src/pages/AdminProducts.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";

// ── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const EditIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);
const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);
const ChevronUpDownIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
);
const HomeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
    </svg>
);
const EyeIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <span className={`${color} text-lg`}>{icon}</span>
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-black text-gray-800">{value}</p>
            </div>
        </div>
    );
}

// ── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-gray-50">
            <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded-full w-8" /></td>
            <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-100 rounded-xl" /></td>
            <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded-full w-40" /></td>
            <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
            <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded-full w-16" /></td>
            <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    <div className="h-7 w-16 bg-gray-100 rounded-lg" />
                    <div className="h-7 w-16 bg-gray-100 rounded-lg" />
                </div>
            </td>
        </tr>
    );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel, loading }) {
    if (!product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                        <TrashIcon />
                    </div>
                    <h3 className="text-lg font-black text-gray-800">Delete Product?</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete{" "}
                        <span className="font-bold text-gray-800">"{product.name}"</span>?
                        This action <span className="text-red-500 font-bold">cannot be undone</span>.
                    </p>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-bold transition-colors shadow-md shadow-red-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : <TrashIcon />}
                        {loading ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold text-white transition-all
      ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        >
            {toast.type === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            {toast.message}
        </div>
    );
}

// ── Main AdminProducts ────────────────────────────────────────────────────────
export default function AdminProducts() {
    // ── Data state ──────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── UI state ────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Fetch products ───────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError(
                err.response?.status === 503 || !err.response
                    ? "Cannot connect to server. Make sure the backend is running on port 8080."
                    : err.message || "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // ── Show toast helper ────────────────────────────────────────────────────
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Delete handler ───────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteProduct(deleteTarget.id);
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            showToast(`"${deleteTarget.name}" has been deleted.`, "success");
        } catch (err) {
            showToast(
                err.response?.status === 404
                    ? "Product not found — it may have already been deleted."
                    : "Failed to delete product. Please try again.",
                "error"
            );
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    // ── Sort handler ─────────────────────────────────────────────────────────
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    // ── Derived: filter + sort ───────────────────────────────────────────────
    const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

    const displayed = products
        .filter((p) => {
            const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.category?.toLowerCase().includes(search.toLowerCase());
            const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
            return matchSearch && matchCategory;
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            const valA = a[sortField] ?? "";
            const valB = b[sortField] ?? "";
            const cmp = typeof valA === "number"
                ? valA - valB
                : String(valA).localeCompare(String(valB));
            return sortDir === "asc" ? cmp : -cmp;
        });

    // ── Stat counters ────────────────────────────────────────────────────────
    const inStockCount = products.filter((p) => p.stockQuantity > 0).length;
    const outStockCount = products.length - inStockCount;
    const categoryCount = new Set(products.map((p) => p.category)).size;

    // ── Sortable column header ───────────────────────────────────────────────
    const SortHeader = ({ field, label }) => (
        <th
            onClick={() => handleSort(field)}
            className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600 hover:bg-blue-50 transition-colors group"
        >
            <div className="flex items-center gap-1.5">
                {label}
                <span className={`transition-colors ${sortField === field ? "text-blue-500" : "text-gray-300 group-hover:text-blue-400"}`}>
                    <ChevronUpDownIcon />
                </span>
            </div>
        </th>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* ── Breadcrumb ── */}
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
                            <HomeIcon /> Home
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold">Admin / Products</span>
                    </nav>

                    {/* ── Page header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                                Admin Dashboard
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                Product Management
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Manage your store's product catalogue from one place.
                            </p>
                        </div>
                        <Link
                            to="/admin/products/new"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all self-start sm:self-auto flex-shrink-0"
                        >
                            <PlusIcon /> Add New Product
                        </Link>
                    </div>

                    {/* ── Stat cards ── */}
                    {!loading && !error && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard label="Total Products" value={products.length} icon="📦" color="text-blue-600" bg="bg-blue-50" />
                            <StatCard label="In Stock" value={inStockCount} icon="✅" color="text-emerald-600" bg="bg-emerald-50" />
                            <StatCard label="Out of Stock" value={outStockCount} icon="❌" color="text-red-500" bg="bg-red-50" />
                            <StatCard label="Categories" value={categoryCount} icon="🏷️" color="text-purple-600" bg="bg-purple-50" />
                        </div>
                    )}

                    {/* ── Table card ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Table toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-sm font-black text-gray-800">
                                    All Products
                                    <span className="ml-2 text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                        {displayed.length}
                                    </span>
                                </h2>
                                {/* Category filter pills */}
                                <div className="flex items-center gap-1.5 flex-wrap ml-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all
                        ${categoryFilter === cat
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 bg-white"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Search */}
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, category..."
                                        className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-52 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                {/* Refresh */}
                                <button
                                    onClick={fetchProducts}
                                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    title="Refresh"
                                >
                                    <RefreshIcon />
                                </button>
                            </div>
                        </div>

                        {/* ── Error state ── */}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-black text-gray-700 mb-1">Failed to load products</p>
                                <p className="text-xs text-gray-400 mb-5 max-w-sm">{error}</p>
                                <button
                                    onClick={fetchProducts}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    <RefreshIcon /> Retry
                                </button>
                            </div>
                        )}

                        {/* ── Table ── */}
                        {!error && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider w-16">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider w-14">Image</th>
                                            <SortHeader field="name" label="Product Name" />
                                            <SortHeader field="category" label="Category" />
                                            <SortHeader field="price" label="Price" />
                                            <SortHeader field="stockQuantity" label="Stock" />
                                            <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">

                                        {/* Loading skeleton rows */}
                                        {loading && Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}

                                        {/* Empty state */}
                                        {!loading && displayed.length === 0 && (
                                            <tr>
                                                <td colSpan={7}>
                                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                                        <svg className="w-12 h-12 opacity-20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                                                        </svg>
                                                        <p className="font-bold text-gray-500 mb-1">No products found</p>
                                                        <p className="text-xs">Try a different search or category filter.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Data rows */}
                                        {!loading && displayed.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-blue-50/40 transition-colors duration-100 group"
                                            >
                                                {/* ID */}
                                                <td className="px-4 py-3 text-xs font-bold text-gray-400 w-16">
                                                    #{String(product.id).padStart(3, "0")}
                                                </td>

                                                {/* Image */}
                                                <td className="px-4 py-3">
                                                    <img
                                                        src={product.imageUrl || "https://via.placeholder.com/40x40?text=?"}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded-xl border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-200"
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/40x40?text=?"; }}
                                                    />
                                                </td>

                                                {/* Name */}
                                                <td className="px-4 py-3 max-w-[220px]">
                                                    <p className="font-bold text-gray-800 truncate">{product.name}</p>
                                                    {product.brand && (
                                                        <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                                                    )}
                                                </td>

                                                {/* Category */}
                                                <td className="px-4 py-3">
                                                    {product.category ? (
                                                        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                                                            {product.category}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Price */}
                                                <td className="px-4 py-3">
                                                    <p className="font-black text-gray-900">
                                                        ${Number(product.price ?? 0).toLocaleString()}
                                                    </p>
                                                    {product.discountPrice && product.discountPrice > product.price && (
                                                        <p className="text-xs text-gray-400 line-through">
                                                            ${Number(product.discountPrice).toLocaleString()}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Stock */}
                                                <td className="px-4 py-3">
                                                    {product.stockQuantity > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            {product.stockQuantity} left
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* View */}
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold transition-colors"
                                                            title="View product page"
                                                        >
                                                            <EyeIcon />
                                                        </Link>

                                                        {/* Edit */}
                                                        <Link
                                                            to={`/admin/products/edit/${product.id}`}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold transition-colors"
                                                        >
                                                            <EditIcon /> Edit
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => setDeleteTarget(product)}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-colors"
                                                        >
                                                            <TrashIcon /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table footer */}
                        {!loading && !error && displayed.length > 0 && (
                            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 font-medium">
                                Showing <span className="font-bold text-gray-600">{displayed.length}</span> of{" "}
                                <span className="font-bold text-gray-600">{products.length}</span> products
                                {search && (
                                    <span> · filtered by "<span className="text-blue-600 font-bold">{search}</span>"</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Delete confirm modal ── */}
            <DeleteModal
                product={deleteTarget}
                onConfirm={handleDeleteConfirm}
                onCancel={() => !deleteLoading && setDeleteTarget(null)}
                loading={deleteLoading}
            />

            {/* ── Toast notification ── */}
            <Toast toast={toast} />
        </>
    );
}