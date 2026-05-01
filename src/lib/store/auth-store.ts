import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, name: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: () => boolean;
}

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@gmk3d.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_USER: User = {
  id: "admin-001",
  email: ADMIN_EMAIL,
  name: "GMK Admin",
  role: "admin",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: [],

      login: (email: string, password: string) => {
        // Check admin credentials
        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          set({ user: ADMIN_USER, isAuthenticated: true });
          return { success: true };
        }

        // Check registered users
        const registeredUser = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (registeredUser) {
          const { password: _, ...userWithoutPassword } = registeredUser;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return { success: true };
        }

        return { success: false, error: "Invalid email or password" };
      },

      register: (email: string, password: string, name: string) => {
        const { registeredUsers } = get();

        // Check if admin email
        if (email.toLowerCase() === ADMIN_EMAIL) {
          return { success: false, error: "This email is already registered" };
        }

        // Check if user already exists
        if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: "An account with this email already exists" };
        }

        // Validate
        if (password.length < 6) {
          return { success: false, error: "Password must be at least 6 characters" };
        }

        if (!name.trim()) {
          return { success: false, error: "Name is required" };
        }

        const newUser: RegisteredUser = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          name: name.trim(),
          password,
          role: "user",
        };

        const { password: _, ...userWithoutPassword } = newUser;

        set({
          registeredUsers: [...registeredUsers, newUser],
          user: userWithoutPassword,
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      isAdmin: () => {
        return get().user?.role === "admin";
      },
    }),
    {
      name: "gmk-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
