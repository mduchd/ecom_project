// src/pages/AdminProducts.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSync, FaSort, FaHome, FaEye, FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaInbox, FaBoxOpen, FaCheckCircle, FaTimesCircle, FaTag } from "react-icons/fa";

// ── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => <FaPlus className="w-4 h-4" />;
const EditIcon = () => <FaEdit className="w-3.5 h-3.5" />;
const TrashIcon = () => <FaTrash className="w-3.5 h-3.5" />;
const SearchIcon = () => <FaSearch className="w-4 h-4" />;
const RefreshIcon = () => <FaSync className="w-4 h-4" />;
const ChevronUpDownIcon = () => <FaSort className="w-3.5 h-3.5" />;
const HomeIcon = () => <FaHome className="w-3.5 h-3.5" />;
const EyeIcon = () => <FaEye className="w-3.5 h-3.5" />;

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
                            <FaSpinner className="w-4 h-4 animate-spin" />
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
                <FaCheck className="w-4 h-4 flex-shrink-0" />
            ) : (
                <FaTimes className="w-4 h-4 flex-shrink-0" />
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
                            <StatCard label="Total Products" value={products.length} icon={<FaBoxOpen />} color="text-blue-600" bg="bg-blue-50" />
                            <StatCard label="In Stock" value={inStockCount} icon={<FaCheckCircle />} color="text-emerald-600" bg="bg-emerald-50" />
                            <StatCard label="Out of Stock" value={outStockCount} icon={<FaTimesCircle />} color="text-red-500" bg="bg-red-50" />
                            <StatCard label="Categories" value={categoryCount} icon={<FaTag />} color="text-purple-600" bg="bg-purple-50" />
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
                                    <FaExclamationTriangle className="w-7 h-7 text-red-400" />
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
                                                        <FaInbox className="w-12 h-12 opacity-20 mb-3" />
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