"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";

interface AdminAddress {
  id: string;
  currency: string;
  wallet_address: string;
  network?: string;
  label?: string;
  is_primary?: boolean;
}

const SUPPORTED_ASSETS = [
  { code: "USDT", name: "Tether USD", network: "Tron (TRC-20) / ERC-20" },
  { code: "BTC", name: "Bitcoin", network: "Bitcoin Native Mainnet" },
  { code: "ETH", name: "Ethereum", network: "Ethereum (ERC-20)" },
  { code: "SOL", name: "Solana", network: "Solana Native (SPL)" },
];

export default function InitiateDepositPage() {
  const [adminAddresses, setAdminAddresses] = useState<AdminAddress[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [senderAddress, setSenderAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallets/addresses");
      setAdminAddresses(res.data || []);
    } catch (e) {
      console.error("Error fetching deposit addresses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const activeDepositWallet = adminAddresses.find(
    (addr) => addr.currency.toUpperCase() === selectedCurrency.toUpperCase()
  );

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const numAmount = parseFloat(depositAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid positive deposit amount.");
      return;
    }

    if (!txHash.trim()) {
      setFormError("Please provide the blockchain transaction hash / TXID.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/wallets/deposit", {
        amount: numAmount,
        currency: selectedCurrency.toUpperCase(),
        transaction_hash: txHash.trim(),
        sender_address: senderAddress.trim() || undefined,
      });

      setFormSuccess(
        `Deposit verification request for ${depositAmount} ${selectedCurrency} submitted successfully! Your funds will be credited following on-chain confirmation.`
      );
      setDepositAmount("");
      setTxHash("");
      setSenderAddress("");
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to submit deposit verification request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading platform deposit custody addresses...</p>
      </div>
    );
  }

  const selectedAssetMeta = SUPPORTED_ASSETS.find((a) => a.code === selectedCurrency);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ArrowDownLeft className="h-6 w-6 text-[#27C58B]" />
            Initiate Capital Deposit
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Transfer cryptocurrency to Horizon Equity custody reserves. Transfers are automatically credited upon blockchain verification.
          </p>
        </div>

        <Link
          href="/dashboard/my-deposits"
          className="btn btn-secondary btn-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Layers className="h-4 w-4 text-[#4388F5]" />
          <span>View My Deposits</span>
        </Link>
      </div>

      {formSuccess && (
        <div className="p-4 rounded-lg bg-[#27C58B]/10 border border-[#27C58B]/30 flex items-start justify-between gap-3 text-xs text-[#27C58B]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{formSuccess}</span>
          </div>
          <Link href="/dashboard/my-deposits" className="underline font-bold shrink-0">
            View History →
          </Link>
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-lg bg-[#F06464]/10 border border-[#F06464]/30 flex items-center gap-2.5 text-xs text-[#F06464]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Asset Selection Tabs */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#7D8998] block mb-2">
          Select Deposit Asset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUPPORTED_ASSETS.map((asset) => {
            const isSelected = selectedCurrency === asset.code;
            return (
              <button
                key={asset.code}
                type="button"
                onClick={() => setSelectedCurrency(asset.code)}
                className={`panel p-3.5 flex flex-col items-start justify-between transition text-left cursor-pointer ${
                  isSelected
                    ? "border-[#4388F5] bg-[#4388F5]/10 shadow-md"
                    : "hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-white">{asset.code}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-[#4388F5]" />
                  )}
                </div>
                <span className="text-[11px] text-[#A6B0BE] mt-1">{asset.name}</span>
                <span className="text-[10px] text-[#7D8998] mt-0.5 truncate w-full">
                  {asset.network}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Receiving Address Card */}
        <div className="lg:col-span-6 panel p-6 flex flex-col justify-between gap-5 bg-[#111821] border-white/10">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4388F5]">
                Step 1: Send Funds
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#A6B0BE]">
                {selectedAssetMeta?.network}
              </span>
            </div>

            <p className="text-xs text-[#A6B0BE] leading-relaxed mb-4">
              Transfer your desired {selectedCurrency} amount from your private wallet or exchange to the official Horizon Equity custody address below:
            </p>

            {activeDepositWallet ? (
              <div className="p-3.5 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-[#7D8998] tracking-wider">
                  Official {selectedCurrency} Receiving Address
                </span>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-[#E2E8F0] break-all">
                  <span>{activeDepositWallet.wallet_address}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeDepositWallet.wallet_address)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white shrink-0 transition"
                    title="Copy Address"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#27C58B]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#F3B94F]/10 border border-[#F3B94F]/30 text-xs text-[#F3B94F]">
                No active custody address is currently configured for {selectedCurrency}. Please contact support.
              </div>
            )}
          </div>

          <div className="p-3.5 rounded bg-[#151F2B]/60 border border-white/5 text-[11px] text-[#A6B0BE] flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#4388F5] shrink-0 mt-0.5" />
            <p>
              Please send only <strong>{selectedCurrency}</strong> to this specific address. Sending any other digital asset or choosing an incompatible network may result in permanent loss.
            </p>
          </div>
        </div>

        {/* Step 2: Proof Submission Form */}
        <div className="lg:col-span-6 panel p-6 flex flex-col gap-5 bg-[#111821] border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#27C58B]">
              Step 2: Submit Proof
            </span>
            <span className="text-[11px] text-[#7D8998]">Instant Ledger Queue</span>
          </div>

          <form onSubmit={handleSubmitDeposit} className="flex flex-col gap-4">
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                Transferred Amount ({selectedCurrency}) *
              </label>
              <input
                type="number"
                step="any"
                min="0.00000001"
                placeholder="e.g. 250.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                required
              />
            </div>

            {/* Blockchain TXID */}
            <div>
              <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                Transaction Hash / TXID *
              </label>
              <input
                type="text"
                placeholder="Paste blockchain transaction hash..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-mono"
                required
              />
            </div>

            {/* Sender Address */}
            <div>
              <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                Sender Wallet Address (Optional)
              </label>
              <input
                type="text"
                placeholder="Your originating wallet address..."
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !activeDepositWallet}
              className="btn btn-primary w-full py-2.5 font-semibold text-xs mt-2 flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Verification...</span>
                </>
              ) : (
                <>
                  <span>Submit Deposit for Confirmation</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
