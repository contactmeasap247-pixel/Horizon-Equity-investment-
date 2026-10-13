// ============================================
// HORIZON EQUITY - API CLIENT (AXIOS)
// ============================================

import axios from "axios";

const getApiUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || (typeof window !== "undefined" && window.location.hostname !== "localhost" && url.includes("localhost"))) {
    url = "https://horizon-equity-backend.onrender.com/api/v1";
  }
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api/v1")) {
    if (url.endsWith("/api")) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }
  return url;
};

export const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT access tokens
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("he_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens and automatic rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and not a retry
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/login") && !originalRequest.url.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("he_refresh_token") : null;

      if (!refreshToken) {
        isRefreshing = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("he_access_token");
          localStorage.removeItem("he_refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Request token refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        if (typeof window !== "undefined") {
          localStorage.setItem("he_access_token", access_token);
          localStorage.setItem("he_refresh_token", refresh_token);
        }

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        if (typeof window !== "undefined") {
          localStorage.removeItem("he_access_token");
          localStorage.removeItem("he_refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
