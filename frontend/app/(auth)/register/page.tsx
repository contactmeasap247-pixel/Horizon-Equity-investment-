"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import { useAuthStore } from "@/lib/auth-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isInitialized, initialize } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

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
    if (!fullName || !email || !password) {
      setErrorMsg("Please populate all required fields.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("You must accept the terms of service to open an account.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await register(fullName.trim(), email.trim(), password, referralCode.trim() || undefined);
      setSuccessMsg("Account initialized successfully! Redirecting you to sign in...");

      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 1800);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please check input parameters.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] panel p-7 sm:p-8 bg-[#111821] border-white/10 shadow-2xl flex flex-col gap-6 animate-rise">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="md" href="/" withSubtitle={false} />
        <h1 className="text-xl font-bold tracking-tight text-white mt-4">Open Protected Account</h1>
        <p className="text-xs text-[#7D8998] mt-1">
          Access automated compounding yields and multi-currency wallets
        </p>
      </div>

      {/* Error / Success Alerts */}
      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="alert-content text-xs">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="alert-content text-xs">{successMsg}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="field">
          <label htmlFor="reg-name" className="field-label">
            <span>Full Legal Name *</span>
          </label>
          <div className="control">
            <span className="control-icon" aria-hidden="true">
              <User />
            </span>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Marcus Sterling"
              className="input has-icon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="field">
          <label htmlFor="reg-email" className="field-label">
            <span>Email Address *</span>
          </label>
          <div className="control">
            <span className="control-icon" aria-hidden="true">
              <Mail />
            </span>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.com"
              className="input has-icon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="field">
          <label htmlFor="reg-password" className="field-label">
            <span>Password (min. 6 characters) *</span>
          </label>
          <div className="control">
            <span className="control-icon" aria-hidden="true">
              <Lock />
            </span>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
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

        {/* Referral Code (Optional) */}
        <div className="field">
          <div className="field-label">
            <label htmlFor="reg-ref">Referral Code</label>
            <span className="field-optional">Optional</span>
          </div>
          <input
            id="reg-ref"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="e.g. HE-USER1"
            className="input uppercase font-mono text-xs"
            disabled={isLoading}
          />
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="checkbox mt-0.5"
            required
            disabled={isLoading}
          />
          <label htmlFor="agree-terms" className="text-xs text-[#A6B0BE] leading-relaxed cursor-pointer select-none">
            I acknowledge the platform{" "}
            <span className="text-[#4388F5]">Terms of Service</span> and confirm that capital investments adhere to sovereign regulatory standards.
          </label>
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
              <span>Creating Client Account...</span>
            </>
          ) : (
            "Complete Account Registration"
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="pt-4 border-t border-white/5 text-center text-xs text-[#7D8998]">
        Already registered with Horizon Equity?{" "}
        <Link href="/login" className="font-semibold text-[#4388F5] hover:text-[#5A9AFF] transition-colors">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#4388F5]/30">
      <div className="w-full max-w-[440px] mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6B0BE] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      <Suspense fallback={<div className="panel p-8 text-xs text-[#7D8998]">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
