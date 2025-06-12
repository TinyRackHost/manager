import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Contexts/user.hooks";
import { ApiRoutes } from "../../Enums/ApiRoutes.enum";
import type { User } from "../../Interfaces/User";
import { Api } from "../../Libs/axios";

interface LoginResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

export const LoginPage = () => {
	const { login } = useUser();
	const navigate = useNavigate();

	const handleLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const email = (form.elements[0] as HTMLInputElement).value;
		const password = (form.elements[1] as HTMLInputElement).value;

		try {
			const response = await Api.post<LoginResponse>(
				ApiRoutes.AUTH.LOGIN,
				{
					email,
					password,
				},
			);

			if (
				response.data &&
				response.data.user &&
				response.data.accessToken
			) {
				login(response.data.user, response.data.accessToken);
				navigate("/");
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				console.error(
					"Login failed:",
					error.response?.data || error.message,
				);
			} else if (error instanceof Error) {
				console.error("An unexpected error occurred:", error.message);
			} else {
				console.error("An unknown error occurred:", error);
			}
		}
	};

	return (
		<div>
			<h1>Login Page</h1>
			<p>Please enter your credentials to log in.</p>
			<form onSubmit={handleLogin} className="flex gap-2">
				<input
					type="email"
					placeholder="Email"
					className="border p-2 rounded-sm"
				/>
				<input
					type="password"
					placeholder="Password"
					className="border p-2 rounded-sm"
				/>

				<button type="submit" className="bg-blue-500 text-white p-2">
					Login
				</button>
			</form>
		</div>
	);
};
