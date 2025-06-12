import dayjs from "dayjs";
import { useUser } from "../../Contexts/user.hooks";

export const HomePage = () => {
	const { user, logout } = useUser();

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
					</p>
					<div className="mt-4">
						<h3 className="text-md font-semibold mb-2">VMs</h3>
						<div className="flex">
							{user.VMs?.map((vm, idx) => (
								<div
									key={vm.id}
									className="bg-white shadow rounded p-3 mb-4"
								>
									<p>
										<strong>VM ID:</strong> {vm.id}
									</p>
									<p>
										<strong>VM Hostname:</strong>{" "}
										{vm.hostname}
									</p>
									{idx < user.VMs.length - 1 && (
										<hr className="my-3 border-gray-300" />
									)}
								</div>
							))}
						</div>
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
