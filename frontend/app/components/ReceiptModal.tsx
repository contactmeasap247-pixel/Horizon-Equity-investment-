"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import ReceiptDocument, { ReceiptData } from "./ReceiptDocument";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";

interface ReceiptModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewStandalone?: (id: string) => void;
}

export default function ReceiptModal({
  transactionId,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchReceipt = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/transactions/${id}/receipt`);
      setReceipt(res.data);
    } catch (err: unknown) {
      console.error("Failed to load receipt:", err);
      const e = err as { response?: { data?: { detail?: string } } };
      setError(
        e.response?.data?.detail ||
          "Could not retrieve authenticated transaction receipt. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchReceipt(transactionId);
    } else {
      setReceipt(null);
      setError(null);
    }
  }, [isOpen, transactionId, fetchReceipt]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!receipt) return;
    setIsDownloading(true);
    try {
      const filename = `HorizonEquity-Receipt-${receipt.receipt_number}.pdf`;
      await downloadReceiptPdf("active-receipt-document", filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerificationLink = () => {
    if (!receipt) return;
    const link =
      receipt.verification_url ||
      `${window.location.origin}/verify-receipt?ref=${receipt.reference}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#080C12] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Control Toolbar (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 bg-[#111A26] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A059]" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Official Transaction Receipt</span>
                {receipt && (
                  <span className="font-mono text-[10px] text-[#A0AEC0] bg-white/5 px-1.5 py-0.5 rounded">
                    {receipt.receipt_number}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#718096]">
                Cryptographically signed double-entry audit certificate
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {receipt && (
              <>
                {/* Copy Verification Link */}
                <button
                  type="button"
                  onClick={handleCopyVerificationLink}
                  title="Copy Public Verification Link"
                  className="btn btn-secondary btn-sm px-2.5 py-1.5 text-xs flex items-center gap-1.5 text-[#A0AEC0] hover:text-white"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-positive" />
                      <span className="text-positive text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Verification Link</span>
                    </>
                  )}
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print Receipt (A4 Format)"
                  className="btn btn-secondary btn-sm px-2.5 py-1.5 text-xs flex items-center gap-1.5 text-[#A0AEC0] hover:text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Print</span>
                </button>

                {/* Download PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="btn btn-primary btn-sm px-3 py-1.5 text-xs flex items-center gap-1.5 font-bold"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A0AEC0] hover:text-white transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0B0F14]/70">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#A0AEC0]">
              <Loader2 className="w-8 h-8 text-[#4C8DFF] animate-spin" />
              <p className="text-xs font-mono">Retrieving institutional ledger verification...</p>
            </div>
          ) : error ? (
            <div className="py-16 px-4 max-w-md mx-auto text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-negative mx-auto" />
              <h3 className="text-sm font-bold text-white">Receipt Retrieval Failed</h3>
              <p className="text-xs text-[#A0AEC0]">{error}</p>
              <button
                type="button"
                onClick={() => transactionId && fetchReceipt(transactionId)}
                className="btn btn-secondary btn-sm text-xs mt-2"
              >
                Retry
              </button>
            </div>
          ) : receipt ? (
            <ReceiptDocument receipt={receipt} id="active-receipt-document" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

