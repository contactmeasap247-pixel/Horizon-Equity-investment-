"use client";

import React from "react";
import { ShieldCheck, Hash } from "lucide-react";
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
    timeZoneName: "short",
  });

  const metadata = receipt.metadata || {};
  const blockchainTxid = (
    metadata.tx_hash ||
    metadata.blockchain_txid ||
    metadata.txid ||
    metadata.hash ||
    metadata.transaction_hash
  ) as string | undefined;

  const walletAddress = (
    metadata.wallet_address ||
    metadata.destination_address ||
    metadata.address ||
    metadata.to_address
  ) as string | undefined;

  const network = (metadata.network || metadata.chain) as string | undefined;
  const paymentMethod = (
    metadata.payment_method ||
    (network ? `${receipt.currency} (${network})` : receipt.subtype ? receipt.subtype.replace("_", " ") : receipt.currency)
  ) as string | undefined;

  // Filter breakdown to eliminate redundancy with summary grid
  const filteredBreakdown = (receipt.breakdown || []).filter((item) => {
    const lbl = item.label.toLowerCase();
    return (
      !lbl.includes("reference") &&
      !lbl.includes("timestamp") &&
      !lbl.includes("client full name") &&
      !lbl.includes("account email")
    );
  });

  return (
    <div
      id={id}
      className="receipt-document-card w-full max-w-2xl mx-auto bg-white text-[#0B1528] rounded-xl shadow-xl border border-[#CBD5E1] p-4 sm:p-6 font-sans relative overflow-hidden select-text text-xs leading-normal"
      style={{
        boxShadow: "0 10px 25px -5px rgba(11, 21, 40, 0.15)",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Top Gold & Navy Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B1528] via-[#C5A059] to-[#0B1528]" />

      {/* 1. COMPACT HEADER */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] gap-4">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-[#0B1528] tracking-tight">
                HORIZON EQUITY
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0B1528] text-[#C5A059] font-bold">
                CUSTODY
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
              Official Transaction Financial Receipt
            </p>
          </div>
        </div>

        <div className="text-right space-y-0.5">
          <div className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">
            Receipt #{receipt.receipt_number}
          </div>
          <div className="text-[10px] font-mono text-[#0B1528] font-semibold">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* 2. PRIMARY FINANCIAL HERO BANNER */}
      <div className="my-3.5 p-3.5 rounded-lg bg-[#0B1528] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
              {receipt.category_title || receipt.type.replace("_", " ").toUpperCase()}
            </span>
            <span
              className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                isCompleted
                  ? "bg-[#16A34A] text-white"
                  : isPending
                  ? "bg-[#D97706] text-white"
                  : "bg-[#DC2626] text-white"
              }`}
            >
              {isCompleted ? "COMPLETED" : isPending ? "PENDING" : "FAILED / VOID"}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isCredit ? "text-[#34D399]" : "text-[#F87171]"
              }`}
            >
              {isCredit ? "+" : "-"}
              {formattedAmount}
            </span>
            <span className="text-sm font-bold font-mono text-[#C5A059]">
              {receipt.currency}
            </span>
          </div>
        </div>

        {/* Reference & Net Settled */}
        <div className="sm:text-right space-y-0.5 font-mono text-[11px] sm:border-l sm:border-white/10 sm:pl-4">
          <div className="text-[#94A3B8]">
            Ref: <span className="text-white font-bold">{receipt.reference}</span>
          </div>
          {Number(receipt.fee) > 0 ? (
            <div className="text-[10px] text-[#94A3B8]">
              Fee: <span className="text-white font-medium">{formattedFee} {receipt.currency}</span> &bull; Net: <span className="text-[#34D399] font-bold">{formattedNet} {receipt.currency}</span>
            </div>
          ) : (
            <div className="text-[10px] text-[#94A3B8]">
              Execution Fee: <span className="text-[#34D399] font-bold">0.00 {receipt.currency}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. CORE TRANSACTION DETAILS (2-Column Compact Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 border-b border-[#E2E8F0] text-xs">
        {/* Beneficiary Client */}
        <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Beneficiary Account
          </span>
          <div className="font-bold text-[#0B1528] truncate">{receipt.user_name}</div>
          <div className="text-[#64748B] font-mono text-[11px] truncate">{receipt.user_email}</div>
        </div>

        {/* Payment Channel / Method */}
        <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Channel / Network
          </span>
          <div className="font-bold text-[#0B1528] truncate">
            {paymentMethod || "Institutional Custodial Ledger"}
          </div>
          <div className="text-[#64748B] font-mono text-[11px]">
            {network ? `Network: ${network.toUpperCase()}` : "Internal Secure Clearing"}
          </div>
        </div>

        {/* Blockchain TXID / Hash (if applicable) */}
        {blockchainTxid && (
          <div className="sm:col-span-2 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3 w-3 text-[#4388F5]" />
                Blockchain Transaction Hash (TXID)
              </span>
              <span className="text-[9px] font-mono text-[#16A34A] font-bold">ON-CHAIN VERIFIED</span>
            </div>
            <div className="font-mono text-[11px] text-[#0B1528] font-semibold break-all select-all leading-tight">
              {blockchainTxid}
            </div>
          </div>
        )}

        {/* Custody Wallet / Destination (if applicable) */}
        {walletAddress && (
          <div className="sm:col-span-2 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
              Custody Wallet / Destination Address
            </span>
            <div className="font-mono text-[11px] text-[#0B1528] font-semibold break-all select-all leading-tight">
              {walletAddress}
            </div>
          </div>
        )}
      </div>

      {/* 4. ITEMIZED SETTLEMENT BREAKDOWN (Compact Table) */}
      {filteredBreakdown.length > 0 && (
        <div className="my-3 space-y-1">
          <div className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider">
            Ledger Settlement Breakdown
          </div>
          <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#E2E8F0] overflow-hidden text-xs">
            {filteredBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-3 bg-white hover:bg-[#F8FAFC] gap-2"
              >
                <span className="text-[#64748B] font-medium">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-[#0B1528] text-right break-all">
                    {item.value}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#0B1528] text-[#C5A059] font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {receipt.description && (
              <div className="py-1.5 px-3 bg-[#F8FAFC] flex items-center justify-between gap-2">
                <span className="text-[#64748B] font-medium shrink-0">Settlement Note</span>
                <span className="font-mono text-[#0B1528] text-right text-[11px] truncate">
                  {receipt.description}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. COMPACT AUDIT SEAL & VERIFICATION FOOTER */}
      <div className="pt-2.5 space-y-2 border-t border-[#E2E8F0]">
        <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded border border-[#CBD5E1] text-[#0B1528] shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#64748B]">
                Cryptographic Seal &bull; HMAC SHA-256
              </div>
              <div className="font-mono text-[10px] text-[#0B1528] font-bold break-all">
                {receipt.verification_hash}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[9px] font-mono text-[#64748B] block">Audit Verification URL:</span>
            <span className="text-[10px] font-mono text-[#0B1528] font-bold">
              horizon-equity.net/verify-receipt
            </span>
          </div>
        </div>

        <p className="text-[9px] font-mono text-[#94A3B8] text-center leading-tight">
          Official Horizon Equity Custody Ledger Entry &bull; Cryptographically Sealed &bull; Tampering or unauthorized alteration is strictly prohibited under institutional clearing regulations.
        </p>
      </div>
    </div>
  );
}
