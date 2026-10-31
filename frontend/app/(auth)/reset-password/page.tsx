"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      setErrorMsg(t("Missing password reset token. Please request a new link."));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t("Password must be at least 6 characters long."));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t("auth_passwords_must_match"));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.post("/auth/reset-password", {
        token: token.trim(),
        new_password: password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password. The link may have expired.";
      setErrorMsg(t(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] panel p-7 sm:p-8 bg-[#111821] border-white/10 shadow-2xl flex flex-col gap-6 animate-rise">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="md" href="/" withSubtitle={false} />
        <h1 className="text-xl font-bold tracking-tight text-white mt-4">{t("auth_reset_title")}</h1>
        <p className="text-xs text-[#7D8998] mt-1">{t("auth_reset_sub")}</p>
      </div>

      {!token && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="alert-content text-xs">
            {t("Invalid or missing password reset token.")}{" "}
            <Link href="/forgot-password" className="underline font-semibold ml-1">
              {t("Request a new link")}
            </Link>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="alert-content text-xs">{errorMsg}</div>
        </div>
      )}

      {isSuccess ? (
        <div className="flex flex-col items-center text-center py-4 gap-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              {t("Password Updated Successfully")}
            </h2>
            <p className="text-xs text-[#A6B0BE] leading-relaxed">
              {t("Your password has been changed. Redirecting you to sign in...")}
            </p>
          </div>
          <Link
            href="/login"
            className="btn btn-primary btn-block py-2.5 text-xs font-semibold mt-2"
          >
            {t("Sign In Now")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Password */}
          <div className="field">
            <label htmlFor="reset-new-password" className="field-label">
              <span>{t("auth_new_password")}</span>
            </label>
            <div className="control">
              <span className="control-icon" aria-hidden="true">
                <Lock />
              </span>
              <input
                id="reset-new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input has-icon has-trailing font-mono"
                required
                disabled={isLoading || !token}
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

          {/* Confirm Password */}
          <div className="field">
            <label htmlFor="reset-confirm-password" className="field-label">
              <span>{t("auth_confirm_password")}</span>
            </label>
            <div className="control">
              <span className="control-icon" aria-hidden="true">
                <Lock />
              </span>
              <input
                id="reset-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input has-icon font-mono"
                required
                disabled={isLoading || !token}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-block py-2.5 text-xs font-semibold shadow-sm mt-2"
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>{t("auth_updating_password")}</span>
              </>
            ) : (
              t("auth_reset_btn")
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
  );
}

export default function ResetPasswordPage() {
  const { t, dir } = useLanguage();

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#4388F5]/30"
    >
      <div className="w-full max-w-[420px] mb-6 flex justify-between items-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6B0BE] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("Back to Sign In")}</span>
        </Link>
        <LanguageSelector compact />
      </div>

      <Suspense fallback={<div className="panel p-8 text-xs text-[#7D8998]">{t("Loading...")}</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

