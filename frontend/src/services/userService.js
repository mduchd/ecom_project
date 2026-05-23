import api from "./productService";

export const getMyProfile = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

export const updateMyProfile = async (profile) => {
    const response = await api.put("/users/me", profile);
    return response.data;
};
