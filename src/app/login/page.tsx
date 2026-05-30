"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";

function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const result = await login(email, password);
      if (result.success) {
        // Retrieve the authenticated user from state to check the role
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === "admin") {
          router.push(redirectTo === "/" ? "/admin" : redirectTo);
        } else {
          router.push(redirectTo.startsWith("/admin") ? "/" : redirectTo);
        }
      } else {
        setError(result.error || "Login failed");
      }
    } else {
      const result = await register(email, password, name);
      if (result.success) {
        router.push(redirectTo.startsWith("/admin") ? "/" : redirectTo);
      } else {
        setError(result.error || "Registration failed");
      }
    }

    setLoading(false);
  };

  return (
    <main>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-28 pb-12 bg-background relative overflow-hidden">
        {/* Floating Premium Ambient Neon Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[15%] left-[-10%] w-[380px] h-[380px] rounded-full bg-primary/8 blur-[110px] animate-pulse duration-5000" />
          <div className="absolute bottom-[15%] right-[-10%] w-[420px] h-[420px] rounded-full bg-tertiary/10 blur-[130px] animate-pulse duration-7000" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 hover:scale-105 active:scale-95 transition-all duration-300">
              <span className="font-heading text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-primary to-tertiary">
                GMK - 3D CREATIONS
              </span>
            </Link>
            <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-on-surface-variant mt-2">
              {mode === "login"
                ? "Sign in to continue to your account"
                : "Register to start shopping"}
            </p>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-surface-container-lowest/70 rounded-3xl p-8 shadow-ambient border border-outline-variant transition-all duration-300">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive mb-6 animate-slide-down">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (register only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all"
                      placeholder="John Doe"
                      required
                      id="register-name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all"
                    placeholder="you@example.com"
                    required
                    id="login-email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all"
                    placeholder={mode === "register" ? "Min 6 characters" : "Enter your password"}
                    required
                    minLength={mode === "register" ? 6 : undefined}
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                id="login-submit"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-on-surface-variant">or</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-on-surface-variant mb-6">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className="text-primary font-semibold hover:underline"
                    id="switch-to-register"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="text-primary font-semibold hover:underline"
                    id="switch-to-login"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Quick Demo Login */}
            {mode === "login" && (
              <div className="pt-5 border-t border-outline-variant/60">
                <p className="text-xs font-semibold text-center text-on-surface-variant uppercase tracking-wider mb-3">
                  Quick Testing Accounts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      setError("");
                      setLoading(true);
                      const result = await login("admin@gmk3d.com", "Admin@123");
                      if (result.success) {
                        if (redirectTo === "/") {
                          router.push("/admin");
                        } else {
                          router.push(redirectTo);
                        }
                      } else {
                        setError(result.error || "Admin login failed. Make sure to run the seed API.");
                      }
                      setLoading(false);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-primary/8 border border-primary/25 text-primary hover:bg-primary/12 hover:scale-[1.03] active:scale-[0.97] hover:shadow-md hover:shadow-primary/5 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="text-xs font-bold font-heading">Admin Account</span>
                    <span className="text-[10px] text-primary/70 mt-0.5">admin@gmk3d.com</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      setError("");
                      setLoading(true);
                      const result = await login("user@gmk3d.com", "User@123");
                      if (result.success) {
                        const currentUser = useAuthStore.getState().user;
                        if (currentUser?.role === "admin") {
                          router.push(redirectTo === "/" ? "/admin" : redirectTo);
                        } else {
                          router.push(redirectTo.startsWith("/admin") ? "/" : redirectTo);
                        }
                      } else {
                        setError(result.error || "User login failed. Make sure to run the seed API.");
                      }
                      setLoading(false);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant hover:bg-surface-container hover:scale-[1.03] active:scale-[0.97] hover:shadow-md transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="text-xs font-bold font-heading">User Account</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">user@gmk3d.com</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main>
          <Navbar />
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
