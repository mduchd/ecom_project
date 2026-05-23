import api from "./productService";

export const quoteOrder = async (items, couponCode = "") => {
    const response = await api.post("/orders/quote", { items, couponCode });
    return response.data;
};

export const createOrder = async (payload) => {
    const response = await api.post("/orders", payload);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get("/orders/my");
    return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get("/orders");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
};
