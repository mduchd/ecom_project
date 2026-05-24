// src/pages/AdminProductForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, createProduct, updateProduct, uploadFile } from "../services/productService";
import { FaArrowLeft, FaSave, FaSpinner, FaUpload } from "react-icons/fa";

// ── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => <FaArrowLeft className="w-4 h-4" />;
const SaveIcon = () => <FaSave className="w-4 h-4" />;

const CATEGORIES = ["Laptop", "Điện thoại", "Máy tính bảng", "Phụ kiện", "Âm thanh"];

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // ── States ───────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // Data Form khớp chuẩn với Spring Boot Entity
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: CATEGORIES[0],
        price: "",
        discountPrice: "",
        stockQuantity: "",
        imageUrl: "",
        description: "",
        specifications: "",
    });

    // ── Fetch dữ liệu nếu ở chế độ Edit ──────────────────────────────────────
    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await getProductById(id);
                    setFormData({
                        name: data.name || "",
                        brand: data.brand || "",
                        category: data.category || CATEGORIES[0],
                        price: data.price || "",
                        discountPrice: data.discountPrice || "",
                        stockQuantity: data.stockQuantity || "",
                        imageUrl: data.imageUrl || "",
                        description: data.description || "",
                        specifications: data.specifications || "",
                    });
                } catch (err) {
                    setError("Failed to fetch product details.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const res = await uploadFile(file);
            setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Chuyển đổi kiểu dữ liệu cho Backend
        const payload = {
            ...formData,
            price: Number(formData.price),
            discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
            stockQuantity: Number(formData.stockQuantity),
        };

        try {
            if (isEditMode) {
                await updateProduct(id, payload);
            } else {
                await createProduct(payload);
            }
            // Thành công thì đá về trang quản lý
            navigate("/admin/products");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/products"
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                        >
                            <ArrowLeftIcon />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {isEditMode ? "Edit Product" : "Add New Product"}
                            </h1>
                            <p className="text-sm text-gray-400 font-medium">
                                {isEditMode ? `Updating product #${id}` : "Fill in the details below"}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Cột trái (Thông tin chính) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3">Basic Information</h2>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="e.g. Laptop ASUS ROG Strix" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="e.g. ASUS, Apple" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Price ($) <span className="text-red-500">*</span></label>
                                    <input required type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Discount Price ($)</label>
                                    <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="Original price" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                                    <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3">Details & Specifications</h2>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none" placeholder="Write a detailed description about the product..." />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Specifications</label>
                                <textarea name="specifications" value={formData.specifications} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none font-mono" placeholder="CPU: Intel Core i7 | RAM: 16GB | SSD: 512GB" />
                                <p className="text-xs text-gray-400 mt-1.5 font-medium">Format: <span className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded">Property: Value | Property: Value</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải (Ảnh + Nút Submit) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3">Media</h2>

                            {/* File Upload Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Product Image</label>
                                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-600 rounded-xl text-sm font-bold cursor-pointer border border-blue-200 border-dashed transition-all">
                                    <FaUpload className="w-4 h-4" />
                                    <span>{uploading ? "Uploading..." : "Choose Image File"}</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            {/* Or Enter URL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Or Image URL <span className="text-red-500">*</span></label>
                                <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="https://example.com/image.jpg" />
                            </div>

                            {/* Image Preview & Uploading Spinner */}
                            <div className="aspect-square w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                                        <span className="text-xs font-bold text-gray-400">Uploading to cloud...</span>
                                    </div>
                                ) : formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Invalid+Image+URL"; }} />
                                ) : (
                                    <span className="text-sm font-bold text-gray-400">Image Preview</span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon /> {isEditMode ? "Save Changes" : "Create Product"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}