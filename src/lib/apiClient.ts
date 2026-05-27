import axios from "axios";
import { clearAuth, getToken } from "./auth";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && getToken() !== null) {
            clearAuth();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export default apiClient;
