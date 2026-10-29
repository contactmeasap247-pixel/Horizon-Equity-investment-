// ============================================
// HORIZON EQUITY - AUTHENTICATION STATE STORE
// ============================================

import { create } from "zustand";
import { api, warmUpBackend } from "./api";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  referral_code: string;
  referred_by?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  is_admin: boolean;
  kyc_status: string;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: UserProfile | null) => void;
  login: (email: string, password: string, onStatus?: (status: string) => void) => Promise<void>;
  register: (fullName: string, email: string, password: string, referralCode?: string, onStatus?: (status: string) => void) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

function extractErrorMessage(error: unknown, defaultFallback: string): string {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        detail?: unknown;
        message?: string;
      };
    };
    code?: string;
    message?: string;
  };

  const status = err.response?.status;

  // Specific client & authentication errors (NEVER cold start)
  if (status === 401) {
    return "Incorrect email or password. Please verify your credentials.";
  }

  if (status === 403) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    return "Account access restricted. Please contact institutional support.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment before trying again.";
  }

  // Handle FastAPI validation error arrays
  const detail = err.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(". ");
  }

  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (status === 400) {
    return "Invalid request. Please verify your submitted information.";
  }

  // Gateway errors when instance is spinning up
  if (status === 502 || status === 503 || status === 504) {
    return "Backend server is warming up. Please try again in a few moments.";
  }

  // Connection aborts or network timeouts
  if (
    err.code === "ECONNABORTED" ||
    err.message?.includes("Network Error") ||
    err.message?.includes("timeout") ||
    !err.response
  ) {
    return "Connection timed out. The server may be waking up from idle sleep. Please try again.";
  }

  return defaultFallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ user }),

  login: async (email, password, onStatus) => {
    const cleanEmail = email.trim().toLowerCase();
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          onStatus?.(`Connecting to secure server... Attempt ${attempt}/${maxAttempts}`);
        }
        const response = await api.post("/auth/login", { email: cleanEmail, password });
        const { access_token, refresh_token } = response.data;

        if (typeof window !== "undefined") {
          localStorage.setItem("he_access_token", access_token);
          localStorage.setItem("he_refresh_token", refresh_token);
        }

        await get().fetchProfile();
        return; // Login succeeded
      } catch (error: unknown) {
        lastError = error;
        const err = error as {
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        const status = err.response?.status;

        // Immediate rejection for invalid credentials or client errors — DO NOT retry
        if (status === 401 || status === 400 || status === 403 || status === 422) {
          throw new Error(extractErrorMessage(error, "Authentication failed. Please verify credentials."));
        }

        // Check if error is caused by Render cold start / timeout
        const isWakeUpError =
          err.code === "ECONNABORTED" ||
          !err.response ||
          status === 502 ||
          status === 503 ||
          status === 504 ||
          Boolean(err.message?.includes("Network Error"));

        if (!isWakeUpError || attempt === maxAttempts) {
          throw new Error(extractErrorMessage(error, "Authentication failed. Please verify credentials."));
        }

        // Give the Render container time to boot (3.5s delay before next attempt)
        onStatus?.(`Server waking up from sleep... Reconnecting (attempt ${attempt + 1}/${maxAttempts})...`);
        warmUpBackend().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 3500));
      }
    }

    throw new Error(extractErrorMessage(lastError, "Authentication failed. Please verify credentials."));
  },

  register: async (fullName, email, password, referralCode, onStatus) => {
    const cleanEmail = email.trim().toLowerCase();
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          onStatus?.(`Connecting to server... Attempt ${attempt}/${maxAttempts}`);
        }
        await api.post("/auth/register", {
          email: cleanEmail,
          password,
          full_name: fullName.trim(),
          referred_by_code: referralCode?.trim() || undefined,
        });
        return;
      } catch (error: unknown) {
        lastError = error;
        const err = error as {
          response?: { status?: number };
          code?: string;
          message?: string;
        };

        const status = err.response?.status;

        // Do not retry validation errors or duplicate account errors
        if (status === 400 || status === 422 || status === 409) {
          throw new Error(extractErrorMessage(error, "Registration failed. Please check input parameters."));
        }

        const isWakeUpError =
          err.code === "ECONNABORTED" ||
          !err.response ||
          status === 502 ||
          status === 503 ||
          status === 504 ||
          Boolean(err.message?.includes("Network Error"));

        if (!isWakeUpError || attempt === maxAttempts) {
          throw new Error(extractErrorMessage(error, "Registration failed. Please check input parameters."));
        }

        onStatus?.(`Server waking up from sleep... Retrying registration (attempt ${attempt + 1}/${maxAttempts})...`);
        warmUpBackend().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 3500));
      }
    }

    throw new Error(extractErrorMessage(lastError, "Registration failed. Please check input parameters."));
  },

  logout: async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("he_refresh_token") : null;
      if (refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      }
    } catch (e) {
      console.warn("Logout endpoint error:", e);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("he_access_token");
        localStorage.removeItem("he_refresh_token");
      }
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      set({
        user: response.data,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("he_access_token");
          localStorage.removeItem("he_refresh_token");
        }
      }
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;

    const accessToken = typeof window !== "undefined" ? localStorage.getItem("he_access_token") : null;
    if (accessToken) {
      await get().fetchProfile();
    }
    set({ isInitialized: true });
  },
}));
