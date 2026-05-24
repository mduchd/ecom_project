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
    const [uploadingSub, setUploadingSub] = useState(false);
    const [error, setError] = useState(null);
    const [subImagesList, setSubImagesList] = useState([]);
    const [subImageInputUrl, setSubImageInputUrl] = useState("");

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
        subImages: "",
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
                        subImages: data.subImages || "",
                    });
                    if (data.subImages) {
                        const list = data.subImages.split(",").map(s => s.trim()).filter(Boolean);
                        setSubImagesList(list);
                    } else {
                        setSubImagesList([]);
                    }
                } catch (err) {
                    setError("Không tải được thông tin sản phẩm.");
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
            setError(err.response?.data?.message || "Không tải lên được ảnh.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingSub(true);
        setError(null);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const res = await uploadFile(file);
                if (res?.url) {
                    uploadedUrls.push(res.url);
                }
            }
            setSubImagesList((prev) => [...prev, ...uploadedUrls]);
        } catch (err) {
            setError(err.response?.data?.message || "Không tải lên được ảnh thư viện.");
        } finally {
            setUploadingSub(false);
        }
    };

    const handleAddSubImageUrl = () => {
        if (!subImageInputUrl.trim()) return;
        setSubImagesList((prev) => [...prev, subImageInputUrl.trim()]);
        setSubImageInputUrl("");
    };

    const handleRemoveSubImage = (indexToRemove) => {
        setSubImagesList((prev) => prev.filter((_, index) => index !== indexToRemove));
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
            subImages: subImagesList.join(","),
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
            setError(err.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm.");
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
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight text-vi">
                                {isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                            </h1>
                            <p className="text-sm text-gray-400 font-medium text-vi">
                                {isEditMode ? `Cập nhật sản phẩm #${id}` : "Điền thông tin bên dưới"}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 text-vi">
                        {error}
                    </div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Cột trái (Thông tin chính) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3 text-vi">Thông tin cơ bản</h2>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Tên sản phẩm <span className="text-red-500">*</span></label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-vi" placeholder="VD: Laptop ASUS ROG Strix" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Thương hiệu</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="VD: ASUS, Apple" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Danh mục <span className="text-red-500">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-vi">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Giá (VND) <span className="text-red-500">*</span></label>
                                    <input required type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="1" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Giá gốc (VND)</label>
                                    <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} min="0" step="1" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="Giá trước khi giảm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Số lượng tồn kho <span className="text-red-500">*</span></label>
                                    <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3 text-vi">Mô tả &amp; thông số</h2>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-vi" placeholder="Viết mô tả chi tiết về sản phẩm..." />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Thông số kỹ thuật</label>
                                <textarea name="specifications" value={formData.specifications} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none font-mono" placeholder="CPU: Intel Core i7 | RAM: 16GB | SSD: 512GB" />
                                <p className="text-xs text-gray-400 mt-1.5 font-medium text-vi">Định dạng: <span className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded">Thuộc tính: Giá trị | Thuộc tính: Giá trị</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải (Ảnh + Nút Submit) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3 text-vi">Hình ảnh</h2>

                            {/* File Upload Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Tải ảnh sản phẩm</label>
                                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-600 rounded-xl text-sm font-bold cursor-pointer border border-blue-200 border-dashed transition-all text-vi">
                                    <FaUpload className="w-4 h-4" />
                                    <span>{uploading ? "Đang tải lên..." : "Chọn file ảnh"}</span>
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
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Hoặc URL ảnh <span className="text-red-500">*</span></label>
                                <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" placeholder="https://example.com/image.jpg" />
                            </div>

                            {/* Image Preview & Uploading Spinner */}
                            <div className="aspect-square w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                                        <span className="text-xs font-bold text-gray-400 text-vi">Đang tải lên cloud...</span>
                                    </div>
                                ) : formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Xem trước" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Invalid+Image+URL"; }} />
                                ) : (
                                    <span className="text-sm font-bold text-gray-400 text-vi">Xem trước ảnh</span>
                                )}
                            </div>
                        </div>

                        {/* Product Gallery Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                            <h2 className="text-base font-black text-gray-800 border-b border-gray-50 pb-3 text-vi">Thư viện ảnh</h2>

                            {/* File Upload Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-vi">Tải nhiều ảnh thư viện</label>
                                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-600 rounded-xl text-sm font-bold cursor-pointer border border-blue-200 border-dashed transition-all text-vi">
                                    <FaUpload className="w-4 h-4" />
                                    <span>{uploadingSub ? "Đang tải lên..." : "Chọn ảnh thư viện"}</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple
                                        onChange={handleSubImageUpload} 
                                        className="hidden" 
                                        disabled={uploadingSub}
                                    />
                                </label>
                            </div>

                            {/* Or Enter URL */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700 text-vi">Hoặc thêm URL ảnh</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url" 
                                        value={subImageInputUrl} 
                                        onChange={(e) => setSubImageInputUrl(e.target.value)} 
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all" 
                                        placeholder="https://example.com/sub-image.jpg" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddSubImageUrl}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all text-vi"
                                    >
                                        Thêm
                                    </button>
                                </div>
                            </div>

                            {/* Sub Images List Grid */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 text-vi">Xem trước thư viện ({subImagesList.length})</label>
                                {subImagesList.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {subImagesList.map((imgUrl, index) => (
                                            <div key={index} className="aspect-square bg-gray-50 rounded-xl border border-gray-150 overflow-hidden relative group shadow-sm">
                                                <img 
                                                    src={imgUrl} 
                                                    alt={`Ảnh thư viện ${index + 1}`} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Invalid+URL"; }} 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all opacity-90 sm:opacity-0 group-hover:opacity-100"
                                                    title="Xóa ảnh"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 text-vi">
                                        Chưa có ảnh thư viện
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-black rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-vi"
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <SaveIcon /> {isEditMode ? "Lưu thay đổi" : "Tạo sản phẩm"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
