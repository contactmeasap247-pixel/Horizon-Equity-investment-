// ============================================
// HORIZON EQUITY - API CLIENT (AXIOS)
// ============================================

import axios, { InternalAxiosRequestConfig } from "axios";

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _wakeupRetries?: number;
}

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

let activeWarmupPromise: Promise<boolean> | null = null;

/**
 * Asynchronous background pre-warming for the Render backend and database pool.
 * Deduplicated so concurrent calls share the same wake-up probe.
 * Non-blocking, fails silently without interfering with user operations.
 */
export const warmUpBackend = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  if (activeWarmupPromise) return activeWarmupPromise;

  activeWarmupPromise = (async () => {
    try {
      let rootUrl = API_URL.replace(/\/api\/v1\/?$/, "");
      if (window.location.protocol === "https:" && rootUrl.startsWith("http://")) {
        rootUrl = "https://" + rootUrl.slice(7);
      }

      // Trigger local Next.js keep-alive proxy (warms both container & DB pool) in parallel with direct ping
      fetch("/api/keepalive", { method: "GET", cache: "no-store" }).catch(() => {});

      const res = await fetch(`${rootUrl}/health`, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      activeWarmupPromise = null;
    }
  })();

  return activeWarmupPromise;
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

const MAX_WAKEUP_RETRIES = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isMaintenance = Boolean(error.response?.data?.maintenance);

    // 1. Automatic resilience against Render server idle sleep / cold-start gateway errors
    const isColdStartOrNetworkError =
      !isMaintenance &&
      (error.code === "ECONNABORTED" ||
        !error.response ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        Boolean(error.message?.includes("Network Error")) ||
        Boolean(error.message?.includes("timeout")));

    const reqUrl = originalRequest.url || "";
    const isAuthRequest =
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/register") ||
      reqUrl.includes("/auth/refresh");

    // Auth store handles its own status-reporting retry loop for login/register;
    // all other API requests automatically retry here when waking the backend.
    if (isColdStartOrNetworkError && !isAuthRequest) {
      const retryCount = originalRequest._wakeupRetries ?? 0;
      if (retryCount < MAX_WAKEUP_RETRIES) {
        originalRequest._wakeupRetries = retryCount + 1;
        await warmUpBackend();
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return api(originalRequest);
      }
    }

    // 2. Check if error is 401 (Unauthorized) and not a retry.
    // Never attempt token rotation on auth flows (login, register, refresh).
    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
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

        const refreshStatus = (refreshError as { response?: { status?: number } })?.response?.status;
        // Only wipe tokens if the refresh token was genuinely rejected (401/403),
        // not if the backend was temporarily waking from idle sleep.
        if (typeof window !== "undefined" && (refreshStatus === 401 || refreshStatus === 403)) {
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
