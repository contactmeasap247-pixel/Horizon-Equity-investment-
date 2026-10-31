"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { t, dir } = useLanguage();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email) {
      setErrorMsg(t("Please provide your email address."));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process password reset request.";
      setErrorMsg(t(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#4388F5]/30"
    >
      {/* Top Bar / Back Button + Language Selector */}
      <div className="w-full max-w-[420px] mb-6 flex justify-between items-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6B0BE] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("auth_remember_password")} {t("auth_sign_in_here")}</span>
        </Link>
        <LanguageSelector compact />
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-[420px] panel p-7 sm:p-8 bg-[#111821] border-white/10 shadow-2xl flex flex-col gap-6 animate-rise">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="md" href="/" withSubtitle={false} />
          <h1 className="text-xl font-bold tracking-tight text-white mt-4">{t("auth_forgot_title")}</h1>
          <p className="text-xs text-[#7D8998] mt-1">{t("auth_forgot_sub")}</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="alert-content text-xs">{errorMsg}</div>
          </div>
        )}

        {submitted ? (
          <div className="flex flex-col items-center text-center py-4 gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">
                {t("Reset Link Dispatched")}
              </h2>
              <p className="text-xs text-[#A6B0BE] leading-relaxed">
                {t(
                  "If an account exists with this email, you will receive password reset instructions shortly. Please check your inbox and spam folder."
                )}
              </p>
            </div>
            <Link
              href="/login"
              className="btn btn-outline btn-block py-2.5 text-xs font-semibold mt-2"
            >
              {t("Return to Sign In")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Address */}
            <div className="field">
              <label htmlFor="reset-email" className="field-label">
                <span>{t("auth_email")}</span>
              </label>
              <div className="control">
                <span className="control-icon" aria-hidden="true">
                  <Mail />
                </span>
                <input
                  id="reset-email"
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

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-block py-2.5 text-xs font-semibold shadow-sm mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span>{t("auth_sending_link")}</span>
                </>
              ) : (
                t("auth_send_reset_link")
              )}
            </button>
          </form>
        )}

        {/* Footer switch */}
        <div className="pt-4 border-t border-white/5 text-center text-xs text-[#7D8998]">
          <Link
            href="/login"
            className="font-semibold text-[#4388F5] hover:text-[#5A9AFF] transition-colors"
          >
            ← {t("Back to Sign In")}
          </Link>
        </div>
      </div>
    </div>
  );
}
