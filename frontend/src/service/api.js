import axios from 'axios';
import { useNavigate } from "react-router-dom";

function useApi() {
    const navigate = useNavigate();

    // Create an instance for authenticated requests
    const authenticatedApi = axios.create({
        baseURL: 'http://localhost:8081',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });

    // Create an instance for unauthenticated requests
    const unauthenticatedApi = axios.create({
        baseURL: 'http://localhost:8081',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // Interceptor for handling 401 errors in authenticated requests
    authenticatedApi.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    const response = await authenticatedApi.post("/auth/refreshToken", JSON.stringify({ refreshToken }), {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 200) {
                        const newToken = response.data;
                        localStorage.setItem('token', newToken["accessToken"]);
                        localStorage.setItem('refreshToken', newToken["refreshToken"]);

                        // Update the Authorization header for the retry
                        authenticatedApi.defaults.headers['Authorization'] = `Bearer ${newToken["accessToken"]}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken["accessToken"]}`;

                        // Retry the original request with the new access token
                        return authenticatedApi(originalRequest);
                    }
                } catch (e) {
                    console.error('Failed to refresh token:', e);
                    alert('Session expired or unauthorized. Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem("refreshToken");
                    navigate('/'); // Redirect the user using React Router
                }
            }

            return Promise.reject(error);
        }
    );

    // Authenticated API requests
    const getAllUsers = () => authenticatedApi.get("/users");
    const createUser = (user) => authenticatedApi.post("/users/save", user);
    const updateUser = (user) => authenticatedApi.put(`/users/edit`, JSON.stringify(user));
    const getUserById = (id) => authenticatedApi.get(`/users/${id}`);
    const deleteUser = (id) => authenticatedApi.delete(`/users/delete/${id}`);
    const findChatMessage = (senderId, recipientId) => authenticatedApi.get(`/messages/${senderId}/${recipientId}`);
    const refreshTokenApi = (refreshToken) => authenticatedApi.post("/auth/refreshToken", JSON.stringify({ refreshToken }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Unauthenticated API requests
    const login = (username, password) => unauthenticatedApi.post("/auth/signin", JSON.stringify({ username, password }));
    const register = (signupRequest) => unauthenticatedApi.post("/auth/signup", JSON.stringify(signupRequest));
    const forgotPassword = (forgotPasswordRequest) => unauthenticatedApi.post("/auth/forgot-password", JSON.stringify(forgotPasswordRequest));
    const resetPassword = (resetPasswordRequest) => unauthenticatedApi.post('/auth/reset-password', JSON.stringify(resetPasswordRequest));

    const parseToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    };

    return {
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
        login,
        register,
        getUserById,
        forgotPassword,
        resetPassword,
        parseToken,
        findChatMessage,
        refreshTokenApi
    };
}

export default useApi;
