import axios, {  } from 'axios';
import type { AxiosInstance } from 'axios'; 
import { store } from '../redux/store/store';
import { getAccessToken, setAccessToken } from '../utils/tokenUtils';
import { logout } from '../redux/userSlice';

const API_URL = import.meta.env.VITE_API_URL;

const normalizeBaseURL = (url: string) => {
  if (!url) throw new Error("VITE_API_URL is missing");
  const trimmed = url.endsWith("/") ? url.slice(0, -1) : url;
  new URL(trimmed); // validate
  return trimmed;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: normalizeBaseURL(API_URL),
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${normalizeBaseURL(API_URL)}/api/auth/refresh-token`, {
          withCredentials: true,
        });

          const newToken = res.data?.accessToken;
          console.log('this is the newToken response from the backend ;::',newToken)
        if (!newToken) throw new Error("Token refresh failed");

        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
