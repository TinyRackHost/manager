import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
	getStoredToken,
	getStoredRefreshToken,
	removeStoredToken,
	removeStoredRefreshToken,
	setStoredToken,
	setStoredRefreshToken,
} from "../Contexts/user.context";
import { ApiRoutes } from "../Enums/ApiRoutes.enum";

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

export const Api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

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

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(token);
		}
	});

	failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
	try {
		const refreshTokenValue = getStoredRefreshToken();
		if (!refreshTokenValue) {
			return null;
		}

		const response = await axios.post<{
			accessToken: string;
			refreshToken: string;
		}>(
			`${import.meta.env.VITE_API_URL}${ApiRoutes.AUTH.REFRESH}`,
			{ refreshToken: refreshTokenValue },
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (response.data && response.data.accessToken) {
			setStoredToken(response.data.accessToken);
			if (response.data.refreshToken) {
				setStoredRefreshToken(response.data.refreshToken);
			}
			return response.data.accessToken;
		}

		return null;
	} catch (error) {
		console.error("Failed to refresh token:", error);
		removeStoredToken();
		removeStoredRefreshToken();
		return null;
	}
};

Api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as ExtendedAxiosRequestConfig;

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return Api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const newToken = await refreshToken();
				if (newToken) {
					processQueue(null, newToken);
					if (originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
					}
					return Api(originalRequest);
				} else {
					processQueue(new Error("Token refresh failed"), null);
					window.location.href = "/auth/login";
					return Promise.reject(error);
				}
			} catch (refreshError) {
				processQueue(refreshError, null);
				window.location.href = "/auth/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);
