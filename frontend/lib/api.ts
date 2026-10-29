// ============================================
// HORIZON EQUITY - API CLIENT (AXIOS)
// ============================================

import axios from "axios";

const getApiUrl = (): string => {
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim();

  const isBrowser = typeof window !== "undefined";
  const isHttps = isBrowser && window.location.protocol === "https:";
  const isRemoteBrowser = isBrowser && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
  const isProduction = process.env.NODE_ENV === "production";

  // If unconfigured, or in production / remote browser pointing to localhost, fallback to secure production backend
  if (!url || ((isRemoteBrowser || isProduction) && (url.includes("localhost") || url.includes("127.0.0.1")))) {
    url = "https://horizon-equity-backend.onrender.com/api/v1";
  }

  // Prevent mixed content: ensure protocol is HTTPS if page is served over HTTPS or for any remote endpoint
  if (url.startsWith("http://")) {
    const isLocalEndpoint = url.includes("localhost") || url.includes("127.0.0.1");
    if (!isLocalEndpoint || isHttps || isProduction) {
      url = "https://" + url.slice(7);
    }
  } else if (url.startsWith("//")) {
    url = "https:" + url;
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
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Asynchronous background pre-warming for the Render backend.
 * Non-blocking, fails silently without interfering with user operations.
 * Starts waking up the sleeping free-tier instance as soon as users view the site.
 */
export const warmUpBackend = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  try {
    let rootUrl = API_URL.replace(/\/api\/v1\/?$/, "");
    if (window.location.protocol === "https:" && rootUrl.startsWith("http://")) {
      rootUrl = "https://" + rootUrl.slice(7);
    }
    const res = await fetch(`${rootUrl}/health`, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
};

// Interceptor to inject JWT access tokens and guard against mixed content
api.interceptors.request.use(
  (config) => {
    // Mixed Content Guard: Ensure outgoing API requests strictly use HTTPS when on an HTTPS origin
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      if (config.baseURL && config.baseURL.startsWith("http://") && !config.baseURL.includes("localhost")) {
        config.baseURL = "https://" + config.baseURL.slice(7);
      }
      if (config.url && config.url.startsWith("http://") && !config.url.includes("localhost")) {
        config.url = "https://" + config.url.slice(7);
      }
    }

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

    // Check if error is 401 (Unauthorized) and not a retry.
    // Never attempt token rotation on auth flows (login, register, refresh).
    const reqUrl = originalRequest?.url || "";
    const isAuthRequest = reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register") || reqUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
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
          if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }

      try {
        let refreshUrl = `${API_URL}/auth/refresh`;
        if (typeof window !== "undefined" && window.location.protocol === "https:" && refreshUrl.startsWith("http://") && !refreshUrl.includes("localhost")) {
          refreshUrl = "https://" + refreshUrl.slice(7);
        }
        // Request token refresh
        const response = await axios.post(refreshUrl, {
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
