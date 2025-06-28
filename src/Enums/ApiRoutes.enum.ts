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
	VM: {
		USER: (vmId: number) => ({
			STATUS: `/@me/vm/${vmId}/status`,
			START: `/@me/vm/${vmId}/power/start`,
			STOP: `/@me/vm/${vmId}/power/stop`,
			REBOOT: `/@me/vm/${vmId}/power/reboot`,
		}),
	},
};
