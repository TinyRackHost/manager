import { useCallback, useEffect, useState, useRef } from "react";
import { AxiosError } from "axios";
import { ApiRoutes } from "../Enums/ApiRoutes.enum";
import type { VM, VMStatus, VMWithStatus } from "../Interfaces/VM";
import { Api } from "../Libs/axios";
import { useUser } from "./user.context";

export const useVMStatus = (vms: VM[]) => {
	const { user, setUser } = useUser();
	const [vmsWithStatus, setVmsWithStatus] = useState<VMWithStatus[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialLoadRef = useRef(true);

	const removeVMFromUser = useCallback(
		(vmId: number) => {
			if (user) {
				const updatedVMs = user.VMs.filter((vm) => vm.id !== vmId);
				setUser({
					...user,
					VMs: updatedVMs,
				});
			}
			// Also remove from local state
			setVmsWithStatus((prevVms) =>
				prevVms.filter((vm) => vm.id !== vmId),
			);
		},
		[user, setUser],
	);
	const fetchVMStatus = useCallback(
		async (vmId: number): Promise<VMStatus | undefined> => {
			try {
				const response = await Api.get<VMStatus>(
					ApiRoutes.VM.USER(vmId).STATUS,
				);
				return response.data;
			} catch (error: unknown) {
				// Check if error is 404 (VM not found)
				if (
					error instanceof AxiosError &&
					error.response?.status === 404
				) {
					console.warn(
						`VM ${vmId} not found (404), removing from user's VMs`,
					);
					removeVMFromUser(vmId);
					return undefined;
				}

				console.error(
					`Erreur lors du fetch du statut de la VM ${vmId}:`,
					error,
				);
				return undefined;
			}
		},
		[removeVMFromUser],
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
				// Only return VM data if it wasn't removed (status fetch didn't return due to 404)
				if (
					status !== undefined ||
					user?.VMs.find((userVm) => userVm.id === vm.id)
				) {
					return {
						...vm,
						status,
						isLoadingStatus: false,
						lastUpdated: new Date(),
					} as VMWithStatus;
				}
				return null; // VM was removed
			});

			try {
				const vmsWithStatuses = await Promise.all(statusPromises);
				// Filter out null values (removed VMs)
				const validVMs = vmsWithStatuses.filter(
					(vm): vm is VMWithStatus => vm !== null,
				);
				setVmsWithStatus(validVMs);
			} catch (error) {
				console.error(
					"Erreur lors du fetch des statuts des VMs:",
					error,
				);

				// Only keep VMs that still exist in user's VM list
				const existingVMs = vms.filter((vm) =>
					user?.VMs.find((userVm) => userVm.id === vm.id),
				);
				setVmsWithStatus(
					existingVMs.map((vm) => ({
						...vm,
						isLoadingStatus: false,
					})),
				);
			}
		},
		[vms, fetchVMStatus, user?.VMs],
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
				// Check if VM still exists in user's VM list (might have been removed due to 404)
				if (user?.VMs.find((userVm) => userVm.id === vmId)) {
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
				}
			});
		},
		[fetchVMStatus, user?.VMs],
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
