import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, handleAPIError } from "../services/api.js";

// Custom hook for handling authentication
export const useAuth = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);
	const navigate = useNavigate();

	// Check if user is authenticated on app load
	const checkAuthStatus = async () => {
		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setLoading(false);
				return;
			}

			// Verify token with backend
			const response = await authAPI.verifyToken();

			if (response.ok) {
				const data = await handleAPIError(response);
				setUser(data.user);
				setAuthenticated(true);

				// Update local storage with fresh user data
				localStorage.setItem("user", JSON.stringify(data.user));

				// Check for new token in response headers
				const newToken = response.headers.get("X-New-Token");
				if (newToken) {
					localStorage.setItem("token", newToken);
				}
			} else {
				// Token is invalid or expired
				logout();
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuthStatus();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const login = (userData, token) => {
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(userData));
		setUser(userData);
		setAuthenticated(true);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setAuthenticated(false);
		navigate("/login");
	};

	const updateUser = (userData) => {
		localStorage.setItem("user", JSON.stringify(userData));
		setUser(userData);
	};

	// Protected route wrapper
	const requireAuth = (component) => {
		if (loading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-white text-lg">Loading...</div>
				</div>
			);
		}

		if (!authenticated) {
			navigate("/login");
			return null;
		}

		return component;
	};

	return {
		user,
		authenticated,
		loading,
		login,
		logout,
		updateUser,
		checkAuthStatus,
		requireAuth,
	};
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent) => {
	return function AuthenticatedComponent(props) {
		const { requireAuth } = useAuth();
		return requireAuth(<WrappedComponent {...props} />);
	};
};
