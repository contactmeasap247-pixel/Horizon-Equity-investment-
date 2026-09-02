"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized, initialize } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please populate all fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Incorrect credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-white flex flex-col justify-center items-center px-6 relative selection:bg-gold-300 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] pointer-events-none -z-10">
        <div className="absolute inset-0 rounded-full bg-gold-500/5 blur-[100px]" />
      </div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[440px] flex flex-col gap-8 stagger-1 animate-slide-up">
        {/* Brand logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-16 w-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0">
            <Image src="/logo.jpg" alt="Horizon Equity Logo" width={56} height={56} className="object-contain" priority />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-3">Welcome Back</h2>
          <p className="text-sm text-text-secondary">Sign in to manage your cryptographical equity portfolios</p>
        </div>

        {/* Login Form card */}
        <div className="card bg-[#0A2540]/85 border-white/10 p-8 shadow-2xl flex flex-col gap-6">
          {errorMsg && (
            <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="input-label">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center text-xs text-text-secondary mt-2">
            New to Horizon Equity?{" "}
            <Link href="/register" className="font-semibold text-gold-300 hover:text-gold-200 transition-colors">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
