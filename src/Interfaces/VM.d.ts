export interface VM {
	id: number;
	hostname: string;
}

export interface VMStatus {
	hostname: string;
	status: string;
	disk: number;
	memory: {
		used: number;
		max: number;
		percent: number;
	};
	cpu: {
		used: number;
		max: number;
		percent: number;
	};
	net: {
		int: number;
		out: number;
	};
}

export interface VMWithStatus extends VM {
	status?: VMStatus;
	isLoadingStatus?: boolean;
	lastUpdated?: Date;
}
