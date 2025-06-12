import axios from "axios";
import { getStoredToken, removeStoredToken } from "../Contexts/user.context";

export const Api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Intercepteur pour ajouter le token JWT aux requêtes
Api.interceptors.request.use(
	(config) => {
		const token = getStoredToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

Api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			removeStoredToken();
			window.location.href = "/auth/login";
		}
		return Promise.reject(error);
	},
);
