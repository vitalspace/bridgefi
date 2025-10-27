import axios, { type AxiosInstance } from 'axios';

const axiosInstace: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
});

export default axiosInstace;
