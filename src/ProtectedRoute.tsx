import { Navigate } from "react-router-dom";
import { useUser } from "./Contexts/user.context";
import { LoadingPage } from "./Pages/Loading/LoadingPage";

type ProtectedRouteProps = {
	children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { user, isLoading } = useUser();

	if (isLoading) {
		return <LoadingPage />;
	}

	if (!user) return <Navigate to="/auth/login" replace />;

	return children;
};
