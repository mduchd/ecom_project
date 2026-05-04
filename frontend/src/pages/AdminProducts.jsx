// src/pages/AdminProducts.jsx
import { useState } from "react";

// ── Dummy Data ───────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "MacBook Air M4 Chip 13-Inch",
        category: "Laptops",
        price: 1450,
        stock: true,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=80&q=80",
    },
    {
        id: 2,
        name: "Sony ZV-1 20.1MP Vlogging 4K Camera",
        category: "Cameras",
        price: 1100,
        stock: true,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&q=80",
    },
    {
        id: 3,
        name: "ASUS ROG Strix G16 Gaming Laptop RTX 4070",
        category: "Laptops",
        price: 2199,
        stock: true,
        image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=80&q=80",
    },
    {
        id: 4,
        name: "Dell XPS 8960 Desktop Core i9 RTX 4070",
        category: "Computers",
        price: 1799,
        stock: false,
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=80&q=80",
    },
    {
        id: 5,
        name: "Apple AirPods Pro 2nd Gen USB-C",
        category: "Accessories",
        price: 249,
        stock: true,
        image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=80&q=80",
    },
    {
        id: 6,
        name: "Canon EOS R50 Mirrorless Camera Body",
        category: "Cameras",
        price: 779,
        stock: true,
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=80&q=80",
    },
    {
        id: 7,
        name: "TP-Link Archer AX53 AX3000 Router",
        category: "Networking",
        price: 89,
        stock: true,
        image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=80&q=80",
    },
];

const CATEGORIES = ["Laptops", "Computers", "Cameras", "Accessories", "Networking", "Gaming"];

const EMPTY_FORM = {
    name: "", price: "", category: CATEGORIES[0], image: "", stock: true,
};

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
const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-black text-gray-800">{value}</p>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel }) {
    if (!product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fadeIn">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                        <TrashIcon />
                    </div>
                    <h3 className="text-lg font-black text-gray-800">Delete Product?</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete{" "}
                        <span className="font-bold text-gray-700">"{product.name}"</span>?
                        This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors shadow-md shadow-red-100"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Product Form Modal ───────────────────────────────────────────────────────
function ProductModal({ mode, form, onChange, onSave, onClose }) {
    const isEdit = mode === "edit";

    const inputClass =
        "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal box */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-800">
                            {isEdit ? "Edit Product" : "Add New Product"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? "Update the product details below." : "Fill in the details to add a new product."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Form body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Image preview */}
                    {form.image && (
                        <div className="flex justify-center">
                            <img
                                src={form.image}
                                alt="preview"
                                className="w-24 h-24 object-cover rounded-xl border border-gray-100 shadow-sm"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            Product Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. MacBook Air M4 13-Inch"
                            value={form.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Price + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                Price (USD) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e) => onChange("price", e.target.value)}
                                    className={`${inputClass} pl-7`}
                                    min={0}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Category</label>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={(e) => onChange("category", e.target.value)}
                                    className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                                >
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Image URL</label>
                        <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={form.image}
                            onChange={(e) => onChange("image", e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Stock toggle */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-gray-700">In Stock</p>
                            <p className="text-xs text-gray-400">Mark product as available</p>
                        </div>
                        <button
                            onClick={() => onChange("stock", !form.stock)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.stock ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.stock ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!form.name || !form.price}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-md shadow-blue-100"
                    >
                        {isEdit ? "Save Changes" : "Add Product"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Data Table ───────────────────────────────────────────────────────────────
function ProductTable({ products, onEdit, onDelete }) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="w-14 h-14 opacity-20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                </svg>
                <p className="font-bold text-gray-500">No products found</p>
                <p className="text-sm">Try a different search keyword.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {["ID", "Image", "Product Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                            <th
                                key={h}
                                className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                        <tr
                            key={p.id}
                            className="hover:bg-blue-50/50 transition-colors duration-150 group"
                        >
                            {/* ID */}
                            <td className="px-4 py-3 text-xs font-bold text-gray-400">
                                #{String(p.id).padStart(3, "0")}
                            </td>

                            {/* Image */}
                            <td className="px-4 py-3">
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-200"
                                />
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3">
                                <p className="font-bold text-gray-800 max-w-[220px] truncate">{p.name}</p>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3">
                                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                                    {p.category}
                                </span>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3 font-black text-gray-800">
                                ${p.price.toLocaleString()}
                            </td>

                            {/* Stock */}
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${p.stock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.stock ? "bg-emerald-500" : "bg-red-400"}`} />
                                    {p.stock ? "In Stock" : "Out of Stock"}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold transition-colors"
                                    >
                                        <EditIcon /> Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(p)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-colors"
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
    );
}

// ── AdminProducts Page ───────────────────────────────────────────────────────
export default function AdminProducts() {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [search, setSearch] = useState("");
    const [modalMode, setModalMode] = useState(null); // null | "add" | "edit"
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Derived ──
    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );
    const inStockCount = products.filter((p) => p.stock).length;
    const outStockCount = products.length - inStockCount;

    // ── Handlers ──
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setModalMode("add");
    };

    const openEdit = (p) => {
        setForm({ name: p.name, price: p.price, category: p.category, image: p.image, stock: p.stock });
        setEditingId(p.id);
        setModalMode("edit");
    };

    const closeModal = () => setModalMode(null);

    const handleFormChange = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = () => {
        if (!form.name || !form.price) return;
        if (modalMode === "add") {
            const newProduct = {
                ...form,
                price: Number(form.price),
                id: Date.now(),
            };
            setProducts((prev) => [newProduct, ...prev]);
        } else {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingId ? { ...p, ...form, price: Number(form.price) } : p
                )
            );
        }
        closeModal();
    };

    const handleDeleteConfirm = () => {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Admin Panel</p>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage your store's product catalogue.</p>
                        </div>
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-150 self-start sm:self-auto"
                        >
                            <PlusIcon />
                            Add New Product
                        </button>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Total Products" value={products.length}
                            color="bg-blue-600"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>}
                        />
                        <StatCard label="In Stock" value={inStockCount}
                            color="bg-emerald-500"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        />
                        <StatCard label="Out of Stock" value={outStockCount}
                            color="bg-red-400"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                        />
                        <StatCard label="Categories" value={[...new Set(products.map((p) => p.category))].length}
                            color="bg-purple-500"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                        />
                    </div>

                    {/* ── Table Card ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Table toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-black text-gray-800">
                                All Products
                                <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {filtered.length}
                                </span>
                            </h2>
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <ProductTable
                            products={filtered}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                        />
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            {modalMode && (
                <ProductModal
                    mode={modalMode}
                    form={form}
                    onChange={handleFormChange}
                    onSave={handleSave}
                    onClose={closeModal}
                />
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <DeleteModal
                    product={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}