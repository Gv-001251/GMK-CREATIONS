"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, signInWithGoogle } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const result = await signInWithGoogle(redirectTo);
    if (!result.success) {
      setError(result.error || "Google Sign-In failed to initialize");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(email, password, name);
    if (result.success) {
      router.push(redirectTo.startsWith("/admin") ? "/" : redirectTo);
    } else {
      setError(result.error || "Registration failed");
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
              Create account
            </h1>
            <p className="text-on-surface-variant mt-2">
              Register to start shopping
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
              {/* Name */}
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
                    id="signup-name"
                  />
                </div>
              </div>

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
                    id="signup-email"
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
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    id="signup-password"
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
                id="signup-submit"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Create Account
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

            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-full bg-surface-container border border-outline-variant hover:bg-surface-container-high hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-sm text-on-surface hover:shadow-md cursor-pointer mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
              id="google-signup-btn"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-on-surface-variant mb-0">
              Already have an account?{" "}
              <Link
                href={redirectTo !== "/" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                className="text-primary font-semibold hover:underline"
                id="switch-to-login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
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
      <SignupForm />
    </Suspense>
  );
}
