import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "ACCOUNTANT";
  schoolId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  restoreFromStorage: () => void;
};

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: false,
  error: null,

  setAuth: (user, tokens) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("tokens", JSON.stringify(tokens));
    set({ user, tokens });
  },

  clearAuth: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tokens");
    set({ user: null, tokens: null });
  },

  setUser: (user) => set({ user }),

  setError: (error) => set({ error }),

  setLoading: (isLoading) => set({ isLoading }),

  restoreFromStorage: () => {
    const storedUser = localStorage.getItem("user");
    const storedTokens = localStorage.getItem("tokens");

    if (storedUser && storedTokens) {
      try {
        set({
          user: JSON.parse(storedUser),
          tokens: JSON.parse(storedTokens),
        });
      } catch (err) {
        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
      }
    }
  },
}));

export default useAuthStore;
