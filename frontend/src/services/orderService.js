import api from "./productService.js";

export const createOrder = async (payload) => {
  const response = await api.post("/orders", payload);
  return response.data;
};

export const cancelPendingOrder = async (code, cancelToken) => {
  const response = await api.post("/orders/cancel", {
    code,
    cancelToken: cancelToken || undefined,
  });
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export const trackOrder = async (code, email) => {
  const response = await api.get("/orders/track", {
    params: { code: code.trim(), email: email.trim() },
  });
  return response.data;
};

export const getAllOrders = getOrders;
