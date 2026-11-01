"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Lock,
  QrCode,
} from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";
import { api } from "@/lib/api";

interface VerificationResult {
  is_valid: boolean;
  receipt_number?: string;
  reference?: string;
  type?: string;
  category_title?: string;
  status?: string;
  amount?: number;
  currency?: string;
  issued_at?: string;
  settled_at?: string;
  masked_investor?: string;
  masked_email?: string;
  verification_hash?: string;
  issuer?: string;
  message?: string;
}

function VerifyReceiptContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [query, setQuery] = useState(initialRef);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = useCallback(async (refToSearch: string) => {
    if (!refToSearch.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(
        `/transactions/receipt/verify/${encodeURIComponent(refToSearch.trim())}`
      );
      setResult(res.data);
    } catch (err) {
      console.error("Verification query error:", err);
      setResult({
        is_valid: false,
        message: "Network or server connection failed while verifying receipt.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRef) {
      handleVerify(initialRef);
    }
  }, [initialRef, handleVerify]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(query);
  };

  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9] flex flex-col selection:bg-accent/30 selection:text-white">
      {/* Top Public Header */}
      <header className="h-16 border-b border-white/10 bg-[#0B0F14]/90 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size="md" />
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#C5A059] uppercase tracking-wider font-bold bg-[#111A26] px-2 py-0.5 rounded border border-[#C5A059]/30">
            Custody Clearing
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/dashboard/transactions"
            className="text-[#A0AEC0] hover:text-white transition-colors"
          >
            Client Ledger
          </Link>
          <Link
            href="/auth/login"
            className="btn btn-secondary btn-sm px-3 py-1.5 text-xs font-semibold"
          >
            Account Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center my-6 space-y-8">
        {/* Title Block */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A26] border border-white/10 text-xs text-[#C5A059] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>CRYPTOGRAPHIC LEDGER VERIFICATION</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Verify Transaction Receipt
          </h1>
          <p className="text-xs sm:text-sm text-[#A0AEC0] max-w-xl mx-auto leading-relaxed">
            Validate the cryptographic integrity, authenticity, and settlement status of any institutional receipt issued by Horizon Equity.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 bg-[#111A26] border border-white/10 rounded-2xl shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#718096]" />
              <input
                type="text"
                placeholder="Enter Receipt ID (e.g. HE-RCP-...) or Reference (TX-...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#080C12] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#718096] focus:outline-none focus:border-[#4C8DFF] font-mono tracking-wide"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn btn-primary px-6 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Record</span>
                </>
              )}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#718096] pt-1">
            <span>Supports canonical receipt numbers, transaction references, or UUIDs.</span>
            <span className="font-mono text-[#C5A059]">Double-Entry Ledger v2.4</span>
          </div>
        </div>

        {/* Verification Result Card */}
        {isLoading && (
          <div className="p-12 text-center space-y-3 bg-[#111A26]/50 rounded-2xl border border-white/5">
            <Loader2 className="w-8 h-8 text-[#4C8DFF] animate-spin mx-auto" />
            <p className="text-xs text-[#A0AEC0] font-mono">
              Querying distributed clearing ledger &amp; cryptographic checksums...
            </p>
          </div>
        )}

        {!isLoading && hasSearched && result && (
          <div className="animate-fade">
            {result.is_valid ? (
              /* Valid Receipt Certificate */
              <div className="bg-white text-[#0B1528] rounded-2xl border-2 border-[#16A34A]/30 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#16A34A] via-[#C5A059] to-[#16A34A]" />

                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#16A34A]/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A34A]">
                          AUTHENTIC &amp; CONFIRMED
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1528] text-[#C5A059] font-bold">
                          {result.status?.toUpperCase() || "SETTLED"}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0B1528] mt-0.5">
                        {result.category_title || "Platform Transaction"}
                      </h2>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono text-xs">
                    <span className="text-[#64748B]">Receipt: </span>
                    <span className="font-bold text-[#0B1528]">{result.receipt_number}</span>
                  </div>
                </div>

                {/* Primary Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <span className="text-[#64748B] font-mono text-[10px] uppercase">
                      Settled Value
                    </span>
                    <div className="font-mono text-base font-black text-[#0B1528]">
                      {result.amount !== undefined
                        ? `${result.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${result.currency}`
                        : "—"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <span className="text-[#64748B] font-mono text-[10px] uppercase">
                      Beneficiary Account (Masked)
                    </span>
                    <div className="font-semibold text-xs text-[#0B1528] truncate">
                      {result.masked_investor}
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono truncate">
                      {result.masked_email}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 sm:col-span-2 md:col-span-1">
                    <span className="text-[#64748B] font-mono text-[10px] uppercase">
                      Ledger Reference
                    </span>
                    <div className="font-mono font-bold text-xs text-[#0B1528] truncate">
                      {result.reference}
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono">
                      {result.issued_at ? new Date(result.issued_at).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Checksum Bar */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B1528] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Cryptographic Verification Code</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#16A34A] font-bold">
                      MATCH CONFIRMED
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0B1528] tracking-widest break-all">
                    {result.verification_hash}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-[#64748B]">
                    <span>Issuer: {result.issuer || "Horizon Equity Custody & Clearing Ltd"}</span>
                    <span>Status: Immutable ledger entry</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid or Not Found Result */
              <div className="p-8 sm:p-10 bg-[#111A26] border border-[#DC2626]/40 rounded-2xl text-center space-y-4">
                <div className="p-3 rounded-full bg-[#FEF2F2]/10 text-[#DC2626] w-fit mx-auto border border-[#DC2626]/20">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Receipt Not Found on Ledger
                  </h3>
                  <p className="text-xs text-[#A0AEC0] max-w-md mx-auto leading-relaxed">
                    {result.message ||
                      "No authentic transaction record was located matching the supplied reference. Please check your reference code and try again."}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="btn btn-secondary btn-sm text-xs px-4"
                  >
                    Clear &amp; Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Educational / Explanatory Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
          <div className="p-4 rounded-xl bg-[#111A26]/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-[#C5A059] font-bold text-[11px] uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>Immutable Ledger</span>
            </div>
            <p className="text-[#A0AEC0] leading-relaxed">
              Every financial settlement is immutably timestamped across Horizon Equity&apos;s segregated double-entry ledger architecture.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111A26]/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-[#4C8DFF] font-bold text-[11px] uppercase">
              <QrCode className="w-3.5 h-3.5" />
              <span>Public Traceability</span>
            </div>
            <p className="text-[#A0AEC0] leading-relaxed">
              Clients and counterparties can share receipt references to independently verify deposits, payouts, and yield distributions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111A26]/60 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-[#31C48D] font-bold text-[11px] uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>Custodial Depository</span>
            </div>
            <p className="text-[#A0AEC0] leading-relaxed">
              All transactions comply with Class-A asset segregation and institutional multi-asset custody clearing standards.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080C12] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#4C8DFF] animate-spin" />
        </div>
      }
    >
      <VerifyReceiptContent />
    </Suspense>
  );
}

