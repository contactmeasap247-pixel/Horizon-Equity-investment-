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
  is_admin: boolean;
  kyc_status: string;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("he_access_token", access_token);
        localStorage.setItem("he_refresh_token", refresh_token);
      }

      await get().fetchProfile();
    } catch (error: unknown) {
      const detail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Authentication failed. Please verify credentials.";
      throw new Error(detail);
    }
  },

  register: async (fullName, email, password, referralCode) => {
    try {
      await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
        referred_by_code: referralCode || undefined,
      });
    } catch (error: unknown) {
      const detail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please check input parameters.";
      throw new Error(detail);
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
