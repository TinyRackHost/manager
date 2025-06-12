export const Method = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	PATCH: "PATCH",
	DELETE: "DELETE",
	HEAD: "HEAD",
	OPTIONS: "OPTIONS",
} as const;

export const ApiRoutes = {
	AUTH: {
		LOGIN: "/auth/login",
		REFRESH: "/auth/refresh",
	},
	USER: {
		PROFILE: "/@me/profile",
	},
};
