import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./Pages/Auth/LoginPage";
import { RegisterPage } from "./Pages/Auth/RegisterPage";
import { NotFoundErrorPage } from "./Pages/Error/404";
import { HomePage } from "./Pages/Home/HomePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserProvider } from "./Contexts/user.hooks";

export const AppWrapper = () => {
	return (
		<UserProvider>
			<BrowserRouter>
				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<HomePage />
							</ProtectedRoute>
						}
					/>
					<Route path="/auth/login" element={<LoginPage />} />
					<Route path="/auth/register" element={<RegisterPage />} />
					<Route path="*" element={<NotFoundErrorPage />} />
				</Routes>
			</BrowserRouter>
		</UserProvider>
	);
};
