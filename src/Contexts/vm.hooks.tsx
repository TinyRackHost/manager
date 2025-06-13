import { useCallback, useEffect, useState, useRef } from "react";
import { ApiRoutes } from "../Enums/ApiRoutes.enum";
import type { VM, VMStatus, VMWithStatus } from "../Interfaces/VM";
import { Api } from "../Libs/axios";

export const useVMStatus = (vms: VM[]) => {
	const [vmsWithStatus, setVmsWithStatus] = useState<VMWithStatus[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialLoadRef = useRef(true);
	const fetchVMStatus = useCallback(
		async (vmId: number): Promise<VMStatus | undefined> => {
			try {
				const response = await Api.get<VMStatus>(
					ApiRoutes.VM.USER(vmId).STATUS,
				);
				return response.data;
			} catch (error) {
				console.error(
					`Erreur lors du fetch du statut de la VM ${vmId}:`,
					error,
				);
				return undefined;
			}
		},
		[],
	);
	const startVM = useCallback(async (vmId: number): Promise<boolean> => {
		try {
			await Api.patch(ApiRoutes.VM.USER(vmId).START);
			return true;
		} catch (error) {
			console.error(`Erreur lors du démarrage de la VM ${vmId}:`, error);
			return false;
		}
	}, []);

	const stopVM = useCallback(async (vmId: number): Promise<boolean> => {
		try {
			await Api.patch(ApiRoutes.VM.USER(vmId).STOP);
			return true;
		} catch (error) {
			console.error(`Erreur lors de l'arrêt de la VM ${vmId}:`, error);
			return false;
		}
	}, []);

	const restartVM = useCallback(async (vmId: number): Promise<boolean> => {
		try {
			await Api.patch(ApiRoutes.VM.USER(vmId).REBOOT);
			return true;
		} catch (error) {
			console.error(
				`Erreur lors du redémarrage de la VM ${vmId}:`,
				error,
			);
			return false;
		}
	}, []);
	const fetchAllVMStatuses = useCallback(
		async (showLoading = true) => {
			if (!vms || vms.length === 0) {
				setVmsWithStatus([]);
				return;
			}

			if (showLoading) {
				const initialVms: VMWithStatus[] = vms.map((vm) => ({
					...vm,
					isLoadingStatus: true,
				}));
				setVmsWithStatus(initialVms);
			}

			const statusPromises = vms.map(async (vm) => {
				const status = await fetchVMStatus(vm.id);
				return {
					...vm,
					status,
					isLoadingStatus: false,
					lastUpdated: new Date(),
				};
			});

			try {
				const vmsWithStatuses = await Promise.all(statusPromises);
				setVmsWithStatus(vmsWithStatuses);
			} catch (error) {
				console.error(
					"Erreur lors du fetch des statuts des VMs:",
					error,
				);

				setVmsWithStatus(
					vms.map((vm) => ({
						...vm,
						isLoadingStatus: false,
					})),
				);
			}
		},
		[vms, fetchVMStatus],
	);
	const refreshVMStatus = useCallback(
		(vmId: number, showLoading = true) => {
			if (showLoading) {
				setVmsWithStatus((prevVms) =>
					prevVms.map((vm) =>
						vm.id === vmId ? { ...vm, isLoadingStatus: true } : vm,
					),
				);
			}
			fetchVMStatus(vmId).then((status) => {
				setVmsWithStatus((prevVms) =>
					prevVms.map((vm) =>
						vm.id === vmId
							? {
									...vm,
									status,
									isLoadingStatus: false,
									lastUpdated: new Date(),
								}
							: vm,
					),
				);
			});
		},
		[fetchVMStatus],
	);
	useEffect(() => {
		fetchAllVMStatuses(isInitialLoadRef.current);
		isInitialLoadRef.current = false;

		intervalRef.current = setInterval(() => {
			fetchAllVMStatuses(false);
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [fetchAllVMStatuses]);
	return {
		vmsWithStatus,
		refreshVMStatus: (vmId: number) => refreshVMStatus(vmId, true),
		refreshAllStatuses: () => fetchAllVMStatuses(true),
		startVM,
		stopVM,
		restartVM,
	};
};
