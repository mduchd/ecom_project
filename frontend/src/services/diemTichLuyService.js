import api from "./productService.js";

export const layCauHinhCheckout = async () => {
  const response = await api.get("/loyalty/checkout-settings");
  return response.data;
};

export const layCauHinhDoiDiem = async () => {
  const response = await api.get("/admin/loyalty/settings");
  return response.data;
};

export const capNhatCauHinhDoiDiem = async (payload) => {
  const response = await api.put("/admin/loyalty/settings", payload);
  return response.data;
};

export const layThongKeDiem = async () => {
  const response = await api.get("/admin/loyalty/summary");
  return response.data;
};

export const layLichSuDiem = async () => {
  const response = await api.get("/admin/loyalty/transactions");
  return response.data;
};

export const dieuChinhDiem = async (payload) => {
  const response = await api.post("/admin/loyalty/adjustments", payload);
  return response.data;
};

export const khoaDiemKhach = async (userId, locked) => {
  await api.patch(`/admin/loyalty/customers/${userId}/lock`, { locked });
};
