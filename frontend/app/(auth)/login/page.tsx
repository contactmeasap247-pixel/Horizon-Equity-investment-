"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized, initialize } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Incorrect credentials. Please verify your email and password.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#4388F5]/30">
      {/* Top Bar / Back Button */}
      <div className="w-full max-w-[420px] mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6B0BE] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-[420px] panel p-7 sm:p-8 bg-[#111821] border-white/10 shadow-2xl flex flex-col gap-6 animate-rise">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="md" href="/" withSubtitle={false} />
          <h1 className="text-xl font-bold tracking-tight text-white mt-4">Client Sign In</h1>
          <p className="text-xs text-[#7D8998] mt-1">
            Access your multi-asset portfolio and institutional accounts
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="alert-content text-xs">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Address */}
          <div className="field">
            <label htmlFor="login-email" className="field-label">
              <span>Email Address</span>
            </label>
            <div className="control">
              <span className="control-icon" aria-hidden="true">
                <Mail />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@institution.com"
                className="input has-icon"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <div className="field-label">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="control">
              <span className="control-icon" aria-hidden="true">
                <Lock />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input has-icon has-trailing font-mono"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="control-trailing p-2 text-[#7D8998] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-block py-2.5 text-xs font-semibold shadow-sm mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              "Sign In to Account"
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="pt-4 border-t border-white/5 text-center text-xs text-[#7D8998]">
          Don't have an institutional account yet?{" "}
          <Link href="/register" className="font-semibold text-[#4388F5] hover:text-[#5A9AFF] transition-colors">
            Open Account
          </Link>
        </div>
      </div>
    </div>
  );
}
