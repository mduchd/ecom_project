// src/services/productService.js
import axios from "axios";

// ── Axios instance dùng chung ─────────────────────────────────────────────
const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000, // 10 giây timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor (gắn JWT token vào đây) ──────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("snapcart_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor (log lỗi tập trung) ─────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.";
        console.error("[API Error]", message);
        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────────────────
//  PRODUCT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách sản phẩm
 * @param {string|null} category  - lọc theo danh mục
 * @param {string|null} search    - tìm theo tên
 */
export const getProducts = async (category = null, search = null) => {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (search && search.trim()) params.search = search.trim();

    const response = await api.get("/products", { params });
    return response.data; // trả về array Product[]
};

/**
 * Lấy chi tiết 1 sản phẩm theo id
 * @param {number} id
 */
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

/**
 * Thêm sản phẩm mới (dành cho Admin)
 * @param {Object} productData
 */
export const createProduct = async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
};

/**
 * Cập nhật sản phẩm (dành cho Admin)
 * @param {number} id
 * @param {Object} productData
 */
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

/**
 * Xóa sản phẩm (dành cho Admin)
 * @param {number} id
 */
export const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
};

export default api;