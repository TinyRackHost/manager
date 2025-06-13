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
			STATUS: `/vm/${vmId}/status`,
			START: `/vm/${vmId}/power/start`,
			STOP: `/vm/${vmId}/power/stop`,
			REBOOT: `/vm/${vmId}/power/reboot`,
		}),
	},
};
