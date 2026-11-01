"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Printer,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import ReceiptDocument, { ReceiptData } from "@/app/components/ReceiptDocument";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";

export default function StandaloneReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params?.id as string;

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadReceipt() {
      if (!transactionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/transactions/${transactionId}/receipt`);
        setReceipt(res.data);
      } catch (err: unknown) {
        console.error("Failed to load receipt:", err);
        const e = err as { response?: { data?: { detail?: string } } };
        setError(
          e.response?.data?.detail ||
            "Unable to retrieve this transaction receipt. It may not exist or you lack permission to view it."
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadReceipt();
  }, [transactionId]);

  const handleDownloadPdf = async () => {
    if (!receipt) return;
    setIsDownloading(true);
    try {
      const filename = `HorizonEquity-Receipt-${receipt.receipt_number}.pdf`;
      await downloadReceiptPdf("fullpage-receipt-document", filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!receipt) return;
    const url =
      receipt.verification_url ||
      `${window.location.origin}/verify-receipt?ref=${receipt.reference}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions Bar (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/transactions"
            className="btn btn-secondary btn-sm px-2.5 py-1.5 flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Ledger</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>Official Transaction Document</span>
            </h1>
          </div>
        </div>

        {receipt && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-secondary btn-sm text-xs px-2.5 py-1.5 flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-positive" />
                  <span className="text-positive text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Share Reference</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm text-xs px-2.5 py-1.5 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px]">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="btn btn-primary btn-sm text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex justify-center">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-mono">Retrieving receipt records from database...</p>
          </div>
        ) : error ? (
          <div className="panel p-8 max-w-md mx-auto text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <h2 className="text-sm font-bold text-white">Receipt Not Accessible</h2>
            <p className="text-xs text-text-muted">{error}</p>
            <Link
              href="/dashboard/transactions"
              className="btn btn-secondary btn-sm text-xs mt-3 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Return to Transactions</span>
            </Link>
          </div>
        ) : receipt ? (
          <div className="w-full">
            <ReceiptDocument receipt={receipt} id="fullpage-receipt-document" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

