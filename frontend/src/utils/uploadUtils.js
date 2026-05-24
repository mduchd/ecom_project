export const UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MAX_SIZE_MB = 5;
export const UPLOAD_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const UPLOAD_ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.gif";
export const UPLOAD_HINT = `JPG, PNG, WebP hoặc GIF — tối đa ${UPLOAD_MAX_SIZE_MB} MB`;

export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getApiErrorMessage(error, fallback = "Đã xảy ra lỗi.") {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error?.message === "Network Error") return "Không kết nối được server. Kiểm tra mạng hoặc thử lại.";
    if (error?.code === "ECONNABORTED") return "Tải ảnh quá lâu. Thử lại với ảnh nhỏ hơn.";
    return fallback;
}

export function validateImageFile(file) {
    if (!file) {
        return "Không có file được chọn.";
    }

    if (file.size > UPLOAD_MAX_SIZE_BYTES) {
        return `Ảnh vượt quá giới hạn ${UPLOAD_MAX_SIZE_MB} MB (file hiện tại: ${formatFileSize(file.size)}). Vui lòng chọn ảnh nhẹ hơn.`;
    }

    const mimeOk = UPLOAD_ACCEPTED_MIME_TYPES.includes(file.type);
    const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    const extOk = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

    if (!mimeOk && !extOk) {
        return "Định dạng không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.";
    }

    return null;
}
