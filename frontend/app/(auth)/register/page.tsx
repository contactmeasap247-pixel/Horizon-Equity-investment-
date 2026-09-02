"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Loader2, ArrowLeft, ShieldAlert, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isInitialized, initialize } = useAuthStore();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Automatically read and populate referral code from URL query parameter ?ref=CODE
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

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await register(fullName, email, password, referralCode || undefined);
      setSuccessMsg("Account registered successfully! Redirecting you to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please double check details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-8 stagger-1 animate-slide-up">
      {/* Brand logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-16 w-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0">
          <Image src="/logo.jpg" alt="Horizon Equity Logo" width={56} height={56} className="object-contain" priority />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mt-3">Create Your Account</h2>
        <p className="text-sm text-text-secondary">Join Horizon Equity to grow your diversified portfolios</p>
      </div>

      {/* Registration card */}
      <div className="card bg-[#0A2540]/85 border-white/10 p-8 shadow-2xl flex flex-col gap-6">
        {errorMsg && (
          <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Full Name *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="input pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Email Address *</label>
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
            <label className="input-label">Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min 6 characters)"
                className="input pl-10"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="input-label flex items-center gap-1">
                Referral Code <span className="text-[10px] text-text-muted">(Optional)</span>
              </label>
              {referralCode && (
                <span className="text-[10px] text-gold-300 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Referral Applied
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Sparkles className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="HE-XXXXXXXX"
                className="input pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
            disabled={isLoading || successMsg !== null}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary mt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold-300 hover:text-gold-200 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
          <p className="text-sm text-text-secondary">Loading registration forms...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
