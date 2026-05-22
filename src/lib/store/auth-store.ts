import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  initialize: () => Promise<void>;
}

// Any account registered with this email is automatically given the admin role.
const ADMIN_EMAIL = "admin@gmk3d.com";

function toUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? "",
    name: su.user_metadata?.name ?? su.email?.split("@")[0] ?? "User",
    role: su.email?.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      set({ user: toUser(user), isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }

    // Keep state in sync with Supabase auth changes (e.g. token refresh, sign-out in another tab)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: toUser(session.user), isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
  },

  login: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      set({ user: toUser(data.user), isAuthenticated: true });
    }
    return { success: true };
  },

  register: async (email: string, password: string, name: string) => {
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    if (!name.trim()) {
      return { success: false, error: "Name is required" };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { success: false, error: error.message };

    // If a session exists the user is immediately authenticated
    if (data.session && data.user) {
      set({ user: toUser(data.user), isAuthenticated: true });
      return { success: true };
    }

    // Email confirmation may be required — inform the user
    return {
      success: false,
      error: "Account created — check your email to confirm, then sign in.",
    };
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  isAdmin: () => get().user?.role === "admin",
}));
