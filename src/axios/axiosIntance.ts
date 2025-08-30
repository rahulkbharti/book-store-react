import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { login, logout, type LoginData } from "../store/slice/authSlice";

// --- Configuration ---
const AUTH_URL = "https://book-store-fastapi.onrender.com/";

const axiosInstance = axios.create({
  baseURL: AUTH_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (req: InternalAxiosRequestConfig) => {
    const login_data: LoginData = store.getState()?.auth?.login_data;

    try {
      if (!login_data?.access_token) return req;

      const currentTime = Date.now();
      const isExpired =
        login_data?.exp && currentTime > new Date(login_data.exp).getTime();

      if (isExpired) {
        const response = await axios.post(`${AUTH_URL}/auth/refresh-token`, {
          refresh_token: login_data.refresh_token,
        });

        const refreshed = {
          ...login_data,
          access_token: response.data.access_token,
          exp: response.data.exp,
        };

        store.dispatch(login(refreshed));

        req.headers.Authorization = `Bearer ${refreshed.access_token}`;
        return req;
      }

      if (login_data.access_token) {
        req.headers.Authorization = `Bearer ${login_data.access_token}`;
      }

      return req;
    } catch (error) {
      console.error("Token refresh failed:", error);
      store.dispatch(logout());
      return req;
    }
  },
  (error: AxiosError) => Promise.reject(error)
);

export { axiosInstance };
