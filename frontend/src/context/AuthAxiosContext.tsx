import React, {useContext, ReactNode} from "react";
import axios, {AxiosInstance} from "axios";

interface Props {
	authAxios: AxiosInstance;
}

const AuthAxiosContext = React.createContext<Props>({
	authAxios: axios.create({
        baseURL: `http://${process.env.REACT_APP_SERVER_ADDRESS}:8080`,
        headers: {
            'Content-Type': 'application/json',
        },
    }),
});

interface AuthAxiosProviderProps {
    children: ReactNode;
}

const AuthAxiosProvider: React.FC<AuthAxiosProviderProps> = ({ children }) => {

	const authAxios = axios.create({
        baseURL: `http://${process.env.REACT_APP_SERVER_ADDRESS}:8080`,
        headers: {
            'Content-Type': 'application/json',
        },
    });

	authAxios.interceptors.response.use(
		(response) => response,
		async (error) => {
			console.log('Interceptor OK');
			const originalRequest = error.config;
			if (error.response.status === 401 && !originalRequest._retry) {
				console.log("ICI GROS ZGEG");
				originalRequest._retry = true;
				try
				{
					await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/refresh`, { withCredentials: true });
					return axios.request(originalRequest);
				} catch (refreshError: any) {
					console.error('frontend: error refreshing token:', error);
					throw refreshError;
				}
			} else {
				throw error;
			}
		},
	);

	return (
        <AuthAxiosContext.Provider value={{ authAxios }}>
            {children}
        </AuthAxiosContext.Provider>
    );
};

const useAuthAxios = (): AxiosInstance => {
    const context = useContext(AuthAxiosContext);
    if (!context) {
        throw new Error(
            'useAuthAxios must be used within an AuthAxiosProvider',
        );
    }
    return context.authAxios;
};

export { AuthAxiosProvider, useAuthAxios };