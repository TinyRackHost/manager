import type { VMWithStatus } from "../Interfaces/VM";

interface VMCardProps {
	vm: VMWithStatus;
	onRefresh: (vmId: number) => void;
	onStart: (vmId: number) => Promise<boolean>;
	onStop: (vmId: number) => Promise<boolean>;
	onRestart: (vmId: number) => Promise<boolean>;
}

const formatBytes = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case "running":
			return "text-green-600 bg-green-100";
		case "stopped":
			return "text-red-600 bg-red-100";
		case "starting":
			return "text-yellow-600 bg-yellow-100";
		default:
			return "text-gray-600 bg-gray-100";
	}
};

export const VMCard: React.FC<VMCardProps> = ({
	vm,
	onRefresh,
	onStart,
	onStop,
	onRestart,
}) => {
	const handleRefresh = () => {
		onRefresh(vm.id);
	};

	const handleStart = async () => {
		await onStart(vm.id);
	};

	const handleStop = async () => {
		await onStop(vm.id);
	};

	const handleRestart = async () => {
		await onRestart(vm.id);
	};

	return (
		<div className="bg-white shadow-lg rounded-lg p-6 mb-4 border border-gray-200 hover:shadow-xl transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">
						{vm.hostname}
					</h3>
					<p className="text-sm text-gray-500">ID: {vm.id}</p>
				</div>
				<div className="flex items-center gap-2">
					{vm.status && (
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vm.status.status)}`}
						>
							{vm.status.status}
						</span>
					)}
					<div className="flex items-center gap-1">
						{vm.status?.status === "stopped" && (
							<button
								onClick={handleStart}
								className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
								title="Démarrer la VM"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6-6a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</button>
						)}

						{vm.status?.status === "running" && (
							<>
								<button
									onClick={handleStop}
									className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
									title="Arrêter la VM"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
										<rect
											x="9"
											y="9"
											width="6"
											height="6"
										/>
									</svg>
								</button>

								<button
									onClick={handleRestart}
									className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full transition-colors"
									title="Redémarrer la VM"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</button>
							</>
						)}
					</div>
					<button
						onClick={handleRefresh}
						disabled={vm.isLoadingStatus}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
						title="Rafraîchir le statut"
					>
						<svg
							className={`w-4 h-4 ${vm.isLoadingStatus ? "animate-spin" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					</button>
					<div
						className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
						title="Mise à jour automatique active"
					></div>
				</div>
			</div>

			{vm.isLoadingStatus ? (
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
					<span className="ml-2 text-gray-500">
						Chargement du statut...
					</span>
				</div>
			) : vm.status ? (
				<div>
					{vm.lastUpdated && (
						<div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Dernière mise à jour:{" "}
							{vm.lastUpdated.toLocaleTimeString()}
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Mémoire */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Mémoire
							</h4>
							<div className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>Utilisée:</span>
									<span>
										{formatBytes(vm.status.memory.used)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Maximum:</span>
									<span>
										{formatBytes(vm.status.memory.max)}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
									<div
										className="bg-blue-500 h-2 rounded-full transition-all"
										style={{
											width: `${vm.status.memory.percent}%`,
										}}
									></div>
								</div>
								<div className="text-xs text-gray-500 text-center">
									{vm.status.memory.percent.toFixed(1)}%
								</div>
							</div>
						</div>

						{/* CPU */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								CPU
							</h4>
							<div className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>Utilisé:</span>
									<span>{vm.status.cpu.used}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Cœurs:</span>
									<span>{vm.status.cpu.max}</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
									<div
										className="bg-green-500 h-2 rounded-full transition-all"
										style={{
											width: `${vm.status.cpu.percent}%`,
										}}
									></div>
								</div>
								<div className="text-xs text-gray-500 text-center">
									{vm.status.cpu.percent.toFixed(1)}%
								</div>
							</div>
						</div>

						{/* Réseau */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Réseau
							</h4>
							<div className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>Entrant:</span>
									<span>
										{formatBytes(vm.status.net.int)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Sortant:</span>
									<span>
										{formatBytes(vm.status.net.out)}
									</span>
								</div>
							</div>
						</div>

						{/* Disque */}
						<div className="bg-gray-50 p-4 rounded-lg md:col-span-3">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Disque
							</h4>
							<div className="text-sm">
								<span>
									Utilisé: {formatBytes(vm.status.disk)}
								</span>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-8 text-gray-500">
					<p>Impossible de charger le statut de cette VM</p>
					<button
						onClick={handleRefresh}
						className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
					>
						Réessayer
					</button>
				</div>
			)}
		</div>
	);
};
