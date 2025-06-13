import dayjs from "dayjs";
import { useUser } from "../../Contexts/user.context";
import { useVMStatus } from "../../Contexts/vm.hooks";
import { VMCard } from "../../Components/VMCard";

export const HomePage = () => {
	const { user, logout } = useUser();
	const { vmsWithStatus, refreshVMStatus, refreshAllStatuses, startVM, stopVM, restartVM } = useVMStatus(user?.VMs || []);

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">
				Welcome to the Home Page
			</h1>
			<p className="mb-4">
				This is the main landing page of our application.
			</p>

			{user && (
				<div className="bg-gray-100 p-4 rounded-lg mb-4">
					<h2 className="text-lg font-semibold mb-2">
						User Information
					</h2>
					<p>
						<strong>Email:</strong> {user.email}
					</p>
					<p>
						<strong>ID:</strong> {user.id}
					</p>
					<p>
						<strong>Created At:</strong>{" "}
						{dayjs(user.createdAt).format("HH:mm:ss DD/MM/YYYY")}
					</p>					<div className="mt-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-md font-semibold">VMs</h3>
							<button
								onClick={refreshAllStatuses}
								className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Rafraîchir tout
							</button>
						</div>
						{vmsWithStatus.length > 0 ? (							<div className="space-y-4">
								{vmsWithStatus.map((vm) => (
									<VMCard 
										key={vm.id} 
										vm={vm} 
										onRefresh={refreshVMStatus}
										onStart={startVM}
										onStop={stopVM}
										onRestart={restartVM}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
								<p>Aucune VM trouvée</p>
							</div>
						)}
					</div>
				</div>
			)}

			<button
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
			>
				Logout
			</button>
		</div>
	);
};
