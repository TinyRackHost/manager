import React, { useEffect, useState, type ReactNode } from "react";
import { ApiRoutes } from "../Enums/ApiRoutes.enum";
import type { User } from "../Interfaces/User";
import { Api } from "../Libs/axios";
import {
	decodeJWT,
	getStoredToken,
	isTokenExpired,
	removeStoredToken,
	setStoredToken,
	UserContext,
	type UserContextType,
} from "./user.hooks";

interface UserProviderProps {
	children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const initializeAuth = async () => {
			const token = getStoredToken();

			if (!token || isTokenExpired(token)) {
				removeStoredToken();
				setIsLoading(false);
				return;
			}

			try {
				const payload = decodeJWT(token);

				if (payload && payload.user) {
					setUser(payload.user);
				} else {
					const response = await Api.get<User>(ApiRoutes.USER.ME);
					setUser(response.data);
				}
			} catch (error) {
				console.error(
					"Erreur lors de l'initialisation de l'authentification:",
					error,
				);
				removeStoredToken();
			}

			setIsLoading(false);
		};

		initializeAuth();
	}, []);

	const isAuthenticated = user !== null;

	const login = (userData: User, token?: string) => {
		setUser(userData);
		if (token) {
			setStoredToken(token);
		}
	};

	const logout = () => {
		setUser(null);
		removeStoredToken();
	};

	const value: UserContextType = {
		user,
		setUser,
		isLoading,
		setIsLoading,
		isAuthenticated,
		login,
		logout,
	};
	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
};
