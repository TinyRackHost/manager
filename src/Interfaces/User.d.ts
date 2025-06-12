import type { VM } from "./VM";

export interface User {
	id: number;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	VMs: VM[];
}
