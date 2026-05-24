import api from "./productService.js";

export const getAdminUsers = async ({ page = 1, size = 10, search = "", role = "ALL" } = {}) => {
  const response = await api.get("/admin/users", {
    params: {
      page,
      size,
      search: search.trim() || undefined,
      role: role === "ALL" ? undefined : role,
    },
  });
  return response.data;
};

export const getAdminUserStats = async () => {
  const response = await api.get("/admin/users/stats");
  return response.data;
};

export const setUserEnabled = async (userId, enabled) => {
  const response = await api.patch(`/admin/users/${userId}/enabled`, { enabled });
  return response.data;
};
