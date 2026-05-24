import api from "./productService";

export const getMyProfile = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

export const updateMyProfile = async (profile) => {
    const response = await api.put("/users/me", profile);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get("/users/me/orders");
    return response.data;
};

export const getMyPointTransactions = async () => {
    const response = await api.get("/users/me/points/transactions");
    return response.data;
};

export const changeMyPassword = async ({ currentPassword, newPassword }) => {
    await api.put("/users/me/password", { currentPassword, newPassword });
};
