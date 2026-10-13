// ============================================
// HORIZON EQUITY - AUTHENTICATION STATE STORE
// ============================================

import { create } from "zustand";
import { api } from "./api";

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
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, referralCode?: string) => Promise<void>;
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

  // If server is cold starting, timed out, or sleeping
  if (
    err.code === "ECONNABORTED" ||
    err.message?.includes("Network Error") ||
    err.message?.includes("timeout") ||
    !err.response
  ) {
    return "Server is currently waking up from sleep. Please wait 10 seconds and try again.";
  }

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

  if (err.response?.status === 401) {
    return "Incorrect email or password. Please verify your credentials.";
  }

  if (err.response?.status === 400) {
    return "Invalid request. Please verify your submitted information.";
  }

  if (err.response?.status === 502 || err.response?.status === 504) {
    return "Server is starting up. Please retry in a few seconds.";
  }

  return defaultFallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const response = await api.post("/auth/login", { email: cleanEmail, password });
      const { access_token, refresh_token } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("he_access_token", access_token);
        localStorage.setItem("he_refresh_token", refresh_token);
      }

      await get().fetchProfile();
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Authentication failed. Please verify credentials."));
    }
  },

  register: async (fullName, email, password, referralCode) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await api.post("/auth/register", {
        email: cleanEmail,
        password,
        full_name: fullName.trim(),
        referred_by_code: referralCode?.trim() || undefined,
      });
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Registration failed. Please check input parameters."));
    }
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
    } catch {
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
      try {
        await get().fetchProfile();
      } catch {
        console.warn("Session restore failed, cleaning tokens.");
        if (typeof window !== "undefined") {
          localStorage.removeItem("he_access_token");
          localStorage.removeItem("he_refresh_token");
        }
      }
    }
    set({ isInitialized: true });
  },
}));
