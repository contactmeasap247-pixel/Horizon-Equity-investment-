"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { t } = useLanguage();
  const { isAuthenticated, fetchProfile, user } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token provided."
  );
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    api
      .post("/auth/verify-email", { token: token.trim() })
      .then(async () => {
        if (!isMounted) return;
        setStatus("success");
        if (isAuthenticated) {
          try {
            await fetchProfile();
          } catch {
            // ignore
          }
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setStatus("error");
        const msg =
          err instanceof Error
            ? err.message
            : "The verification link is invalid, expired, or has already been used.";
        setErrorMessage(msg);
      });

    return () => {
      isMounted = false;
    };
  }, [token, isAuthenticated, fetchProfile]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resendEmail.trim() || user?.email || "";
    if (!targetEmail) return;

    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: targetEmail });
      setResendSuccess(true);
    } catch {
      // Still show success to prevent enumeration
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] panel p-7 sm:p-8 bg-[#111821] border-white/10 shadow-2xl flex flex-col gap-6 animate-rise text-center">
      {/* Brand Header */}
      <div className="flex flex-col items-center">
        <BrandLogo size="md" href="/" withSubtitle={false} />
        <h1 className="text-xl font-bold tracking-tight text-white mt-4">{t("auth_verify_title")}</h1>
        <p className="text-xs text-[#7D8998] mt-1">{t("auth_verify_sub")}</p>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center py-6 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4388F5]" />
          <p className="text-xs text-[#A6B0BE]">{t("Validating verification token with security gateway...")}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center py-4 gap-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">{t("Email Successfully Verified")}</h2>
            <p className="text-xs text-[#A6B0BE] leading-relaxed max-w-[340px]">
              {t("auth_verify_success")}
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="btn btn-primary btn-block py-2.5 text-xs font-semibold mt-2"
          >
            {isAuthenticated ? t("auth_verify_proceed") : t("Sign In to Account")}
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center py-2 gap-4 animate-fadeIn text-left">
          <div className="alert alert-danger w-full" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="alert-content text-xs">
              {t(errorMessage || "auth_verify_failed")}
            </div>
          </div>

          <div className="w-full bg-[#17202A] border border-white/5 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-white">
              {t("Need a new verification link?")}
            </h3>
            {resendSuccess ? (
              <p className="text-xs text-[#10B981]">
                {t("A fresh verification link has been dispatched to your email address.")}
              </p>
            ) : (
              <form onSubmit={handleResend} className="flex flex-col gap-2.5">
                <div className="field">
                  <div className="control">
                    <span className="control-icon" aria-hidden="true">
                      <Mail />
                    </span>
                    <input
                      type="email"
                      value={resendEmail || user?.email || ""}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="name@institution.com"
                      className="input has-icon text-xs"
                      required
                      disabled={resendLoading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="btn btn-outline btn-block py-2 text-xs font-semibold"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>{t("Dispatching...")}</span>
                    </>
                  ) : (
                    t("auth_verify_resend")
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="w-full flex justify-between items-center text-xs text-[#7D8998] pt-2">
            <Link href="/" className="hover:text-white transition-colors">
              ← {t("Back to Homepage")}
            </Link>
            <Link href="/login" className="text-[#4388F5] hover:text-[#5A9AFF] transition-colors font-medium">
              {t("Sign In")} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t, dir } = useLanguage();

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#4388F5]/30"
    >
      <div className="w-full max-w-[440px] mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6B0BE] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("Back to Homepage")}</span>
        </Link>
        <LanguageSelector compact />
      </div>

      <Suspense fallback={<div className="panel p-8 text-xs text-[#7D8998]">{t("Loading...")}</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
