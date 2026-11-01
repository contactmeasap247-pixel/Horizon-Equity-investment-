"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Building2,
  UserCheck,
  FileCheck2,
  Lock,
} from "lucide-react";
import BrandLogo from "@/app/components/BrandLogo";

export interface ReceiptBreakdownItem {
  label: string;
  value: string;
  badge?: string | null;
}

export interface ReceiptData {
  receipt_number: string;
  transaction_id: string;
  reference: string;
  type: string;
  subtype?: string | null;
  status: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  description?: string | null;
  created_at: string;
  approved_at?: string | null;
  user_id: string;
  user_name: string;
  user_email: string;
  user_country?: string | null;
  issuer_name?: string;
  issuer_address?: string;
  issuer_license?: string;
  verification_hash: string;
  verification_url: string;
  security_seal_text?: string;
  category_title: string;
  category_subtitle: string;
  breakdown: ReceiptBreakdownItem[];
  metadata?: Record<string, unknown> | null;
}

interface ReceiptDocumentProps {
  receipt: ReceiptData;
  id?: string;
}

export default function ReceiptDocument({ receipt, id = "receipt-document" }: ReceiptDocumentProps) {
  const isCompleted = receipt.status.toLowerCase() === "completed";
  const isPending = receipt.status.toLowerCase() === "pending" || receipt.status.toLowerCase() === "processing";
  const isFailed = receipt.status.toLowerCase() === "failed" || receipt.status.toLowerCase() === "cancelled" || receipt.status.toLowerCase() === "rejected";

  const numAmount = Number(receipt.amount) || 0;
  const isCredit = numAmount >= 0;
  const formattedAmount = Math.abs(numAmount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: receipt.currency === "BTC" || receipt.currency === "ETH" ? 6 : 2,
  });

  const formattedFee = (Number(receipt.fee) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: receipt.currency === "BTC" || receipt.currency === "ETH" ? 6 : 2,
  });

  const formattedNet = Math.abs(Number(receipt.net_amount) || numAmount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: receipt.currency === "BTC" || receipt.currency === "ETH" ? 6 : 2,
  });

  const formattedDate = new Date(receipt.created_at).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const formattedSettledDate = receipt.approved_at
    ? new Date(receipt.approved_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div
      id={id}
      className="receipt-document-card w-full max-w-3xl mx-auto bg-white text-[#0B1528] rounded-xl shadow-2xl border border-[#CBD5E1] p-6 sm:p-10 font-sans relative overflow-hidden select-text"
      style={{
        boxShadow: "0 25px 50px -12px rgba(11, 21, 40, 0.25)",
      }}
    >
      {/* Decorative Gold & Navy Watermark Ribbon on top edge */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B1528] via-[#C5A059] to-[#0B1528]" />

      {/* Background Watermark Crest */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none">
        <ShieldCheck className="w-96 h-96 text-[#0B1528]" />
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E2E8F0] relative">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BrandLogo size="md" />
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#0B1528] text-[#C5A059] font-bold">
              INSTITUTIONAL CLEARING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1528] tracking-tight">
            TRANSACTION RECEIPT
          </h1>
          <p className="text-xs text-[#64748B] font-medium tracking-wide">
            OFFICIAL FINANCIAL AUDIT RECORD &bull; HORIZON EQUITY CUSTODY
          </p>
        </div>

        {/* Receipt Number & Date Block */}
        <div className="sm:text-right space-y-1 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            Receipt Identifier
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-[#0B1528] tracking-tight">
            {receipt.receipt_number}
          </div>
          <div className="text-[11px] font-mono text-[#475569]">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className="my-6 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border transition-colors bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          {isCompleted && (
            <div className="p-2 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#16A34A]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {isPending && (
            <div className="p-2 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20">
              <Clock className="w-5 h-5" />
            </div>
          )}
          {isFailed && (
            <div className="p-2 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
              <XCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B1528] uppercase tracking-wider">
                Clearance Status:
              </span>
              <span
                className={`text-xs font-black uppercase font-mono px-2 py-0.5 rounded ${
                  isCompleted
                    ? "bg-[#16A34A] text-white"
                    : isPending
                    ? "bg-[#D97706] text-white"
                    : "bg-[#DC2626] text-white"
                }`}
              >
                {isCompleted ? "VERIFIED & SETTLED" : isPending ? "PENDING CLEARANCE" : "VOID / REJECTED"}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {isCompleted
                ? `Cryptographically validated and finalized on the institutional ledger.`
                : isPending
                ? "Awaiting final confirmation from network clearance desk."
                : "This transaction was not executed or has been revoked."}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right font-mono text-xs text-[#475569]">
          <span className="text-[#64748B]">Reference: </span>
          <span className="font-bold text-[#0B1528]">{receipt.reference}</span>
        </div>
      </div>

      {/* PARTIES INVOLVED SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#E2E8F0] text-xs">
        {/* Custodial Issuer */}
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Custodial Clearing Issuer</span>
          </div>
          <div className="font-bold text-sm text-[#0B1528]">
            {receipt.issuer_name || "Horizon Equity Custody & Clearing Ltd"}
          </div>
          <div className="text-[#64748B] leading-relaxed">
            One Canada Square, Canary Wharf
            <br />
            London E14 5AA, United Kingdom
          </div>
          <div className="text-[10px] text-[#475569] font-mono pt-1">
            Regulated Multi-Asset Custody Depository
          </div>
        </div>

        {/* Client / Investor */}
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0B1528]">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Beneficiary Account</span>
          </div>
          <div className="font-bold text-sm text-[#0B1528] truncate">
            {receipt.user_name}
          </div>
          <div className="text-[#64748B] truncate font-mono">
            {receipt.user_email}
          </div>
          <div className="text-[10px] text-[#475569] flex justify-between pt-1 font-mono">
            <span>Jurisdiction: {receipt.user_country || "Global Tier-1"}</span>
            <span>ID: {receipt.user_id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* PRIMARY FINANCIAL CALLOUT */}
      <div className="my-6 p-6 rounded-xl bg-gradient-to-br from-[#0B1528] via-[#111A26] to-[#0B1528] text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
              {receipt.category_subtitle || "Financial Operation Summary"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {receipt.category_title || "Transaction Settlement"}
            </h2>
          </div>
          <span className="badge font-mono text-xs uppercase px-3 py-1 bg-white/10 text-white border border-white/20 self-start sm:self-auto">
            {receipt.type.replace("_", " ")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Settled Principal Amount
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl sm:text-4xl font-black font-mono tracking-tight ${
                  isCredit ? "text-[#34D399]" : "text-[#F87171]"
                }`}
              >
                {isCredit ? "+" : "-"}
                {formattedAmount}
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-[#C5A059]">
                {receipt.currency}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs font-mono text-right sm:border-l sm:border-white/10 sm:pl-6">
            <div className="flex justify-between sm:justify-end gap-4 text-[#94A3B8]">
              <span>Assessed Fee:</span>
              <span className="text-white font-semibold">{formattedFee} {receipt.currency}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4 text-[#94A3B8]">
              <span>Net Settled:</span>
              <span className="text-[#34D399] font-bold">{formattedNet} {receipt.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMIZED BREAKDOWN TABLE */}
      <div className="space-y-3 pb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
          <h3 className="text-xs font-bold text-[#0B1528] uppercase tracking-wider">
            Ledger &amp; Clearing Breakdown
          </h3>
        </div>

        <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-lg overflow-hidden text-xs">
          {receipt.breakdown && receipt.breakdown.length > 0 ? (
            receipt.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white hover:bg-[#F8FAFC] transition-colors gap-1 sm:gap-4"
              >
                <span className="font-medium text-[#475569]">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#0B1528] text-right break-all">
                    {item.value}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B1528] text-[#C5A059] font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-[#64748B]">
              Standard double-entry platform settlement record.
            </div>
          )}

          {receipt.description && (
            <div className="p-3 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <span className="font-medium text-[#475569] shrink-0">Audit Narrative</span>
              <span className="text-right text-[#0B1528] font-mono text-[11px] leading-relaxed">
                {receipt.description}
              </span>
            </div>
          )}

          {formattedSettledDate && (
            <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-[#475569]">Settlement Timestamp</span>
              <span className="font-mono text-[#0B1528]">{formattedSettledDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* CRYPTOGRAPHIC VERIFICATION & SEAL FOOTER */}
      <div className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
          {/* QR / Icon block */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#CBD5E1] text-[#0B1528] shadow-sm">
              <QrCode className="w-8 h-8 text-[#0B1528]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                Public Audit
              </div>
              <div className="text-xs font-bold text-[#0B1528]">
                Cryptographic Seal
              </div>
              <div className="text-[10px] text-[#C5A059] font-bold font-mono">
                HMAC SHA-256
              </div>
            </div>
          </div>

          {/* Verification Code */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                Verification Checksum
              </span>
              <span className="text-[9px] font-mono text-[#16A34A] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> LEDGER SECURED
              </span>
            </div>
            <div className="p-2 rounded bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0B1528] tracking-widest break-all">
              {receipt.verification_hash}
            </div>
            <div className="text-[10px] text-[#64748B] flex items-center justify-between">
              <span>Independent verification:</span>
              <span className="font-mono text-[#0B1528] font-medium">horizon-equity.net/verify-receipt</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[9px] text-[#94A3B8] text-center leading-normal max-w-xl mx-auto">
          This document is generated directly from the immutable double-entry ledger of Horizon Equity Custody &amp; Clearing Ltd.
          Tampering, unauthorized alteration, or fraudulent duplication of this cryptographic receipt is strictly prohibited under institutional clearing regulations.
        </p>
      </div>
    </div>
  );
}

