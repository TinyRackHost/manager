import { createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import type { User } from "../Interfaces/User";
import * as dayjs from "dayjs";

export interface JWTPayload {
	exp?: number;
	iat?: number;
	user?: User;
	[key: string]: unknown;
}

export interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	isAuthenticated: boolean;
	login: (user: User, token?: string) => void;
	logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
	undefined,
);

export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};

export const getStoredToken = (): string | null => {
	return Cookies.get("authToken") || null;
};

export const setStoredToken = (token: string): void => {
	Cookies.set("authToken", token, { 
		expires: 30, 
		secure: true, 
		sameSite: 'strict' 
	});
};

export const removeStoredToken = (): void => {
	Cookies.remove("authToken");
};

export const decodeJWT = (token: string): JWTPayload | null => {
	try {
		const decoded = jwtDecode(token) as JWTPayload;
		return decoded;
	} catch (error) {
		console.error("Erreur lors du décodage du token JWT:", error);
		return null;
	}
};

export const isTokenExpired = (token: string): boolean => {
	try {
		const decoded = jwtDecode(token) as JWTPayload;
		if (!decoded || !decoded.exp) return true;

		const currentTime = Math.floor(Date.now() / 1000);
		return decoded.exp < currentTime;
	} catch (error) {
		console.error("Erreur lors de la vérification du token JWT:", error);
		return true;
	}
};

export const getTokenExpirationDate = (token: string): dayjs.Dayjs | null => {
	try {
		const decoded = jwtDecode(token) as JWTPayload;
		if (!decoded || !decoded.exp) return null;

		return dayjs.unix(decoded.exp);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de la date d'expiration:",
			error,
		);
		return null;
	}
};

export const getTimeUntilExpiration = (token: string): number | null => {
	try {
		const decoded = jwtDecode(token) as JWTPayload;
		if (!decoded || !decoded.exp) return null;

		const expiration = dayjs.unix(decoded.exp);
		const now = dayjs();
		const timeLeft = expiration.diff(now, "second");

		return timeLeft > 0 ? timeLeft : 0;
	} catch (error) {
		console.error("Erreur lors du calcul du temps restant:", error);
		return null;
	}
};
