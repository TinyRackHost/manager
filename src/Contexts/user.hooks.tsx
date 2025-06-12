import React, { useEffect, useState, type ReactNode } from "react";
import { ApiRoutes } from "../Enums/ApiRoutes.enum";
import type { User } from "../Interfaces/User";
import { Api } from "../Libs/axios";
import {
	decodeJWT,
	getStoredToken,
	getStoredRefreshToken,
	isTokenExpired,
	removeStoredToken,
	removeStoredRefreshToken,
	setStoredToken,
	setStoredRefreshToken,
	UserContext,
	type UserContextType,
} from "./user.context";

interface UserProviderProps {
	children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const refreshAccessToken = async (): Promise<boolean> => {
		try {
			const refreshToken = getStoredRefreshToken();
			if (!refreshToken) {
				return false;
			}

			const response = await Api.post<{
				accessToken: string;
				refreshToken: string;
			}>(ApiRoutes.AUTH.REFRESH, { refreshToken });

			if (response.data && response.data.accessToken) {
				setStoredToken(response.data.accessToken);
				if (response.data.refreshToken) {
					setStoredRefreshToken(response.data.refreshToken);
				}
				return true;
			}

			return false;
		} catch (error) {
			console.error("Erreur lors du refresh du token:", error);
			removeStoredToken();
			removeStoredRefreshToken();
			return false;
		}
	};
	useEffect(() => {
		const initializeAuth = async () => {
			const token = getStoredToken();

			if (!token || isTokenExpired(token)) {
				const refreshSuccessful = await refreshAccessToken();
				if (!refreshSuccessful) {
					removeStoredToken();
					removeStoredRefreshToken();
					setIsLoading(false);
					return;
				}
			}

			try {
				const currentToken = getStoredToken();
				if (currentToken) {
					const payload = decodeJWT(currentToken);

					if (payload && payload.user) {
						setUser(payload.user);
					} else {
						const response = await Api.get<User>(ApiRoutes.USER.ME);
						setUser(response.data);
					}
				}
			} catch (error) {
				console.error(
					"Erreur lors de l'initialisation de l'authentification:",
					error,
				);
				removeStoredToken();
				removeStoredRefreshToken();
			}

			setIsLoading(false);
		};

		initializeAuth();
	}, []);

	const isAuthenticated = user !== null;
	const login = (userData: User, token?: string, refreshToken?: string) => {
		setUser(userData);
		if (token) {
			setStoredToken(token);
		}
		if (refreshToken) {
			setStoredRefreshToken(refreshToken);
		}
	};

	const logout = () => {
		setUser(null);
		removeStoredToken();
		removeStoredRefreshToken();
	};
	const value: UserContextType = {
		user,
		setUser,
		isLoading,
		setIsLoading,
		isAuthenticated,
		login,
		logout,
		refreshAccessToken,
	};
	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
};
