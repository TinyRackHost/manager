export const LoadingPage = () => {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
			<p className="ml-4 text-lg text-gray-700">Chargement...</p>
		</div>
	);
};
