"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  History,
  Info,
  ArrowRight,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toNum, formatCrypto } from "@/lib/format";

interface WalletBalance {
  currency: string;
  balance: number | string;
  frozen_balance: number | string;
}

interface SavedWallet {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string;
  is_default: boolean;
}

interface BonusData {
  amount: number;
  currency: string;
  status: string;
  is_withdrawable: boolean;
}

export default function InitiateWithdrawalPage() {
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [bonusData, setBonusData] = useState<BonusData | null>(null);

  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customNetwork, setCustomNetwork] = useState("Tron (TRC-20)");
  const [amount, setAmount] = useState("");
  const [confirmedDetails, setConfirmedDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [wRes, savedRes, bonusRes] = await Promise.all([
        api.get("/wallets"),
        api.get("/wallets/saved"),
        api.get("/users/bonus").catch(() => ({ data: null })),
      ]);
      setWallets(wRes.data || []);
      const saved = savedRes.data || [];
      setSavedWallets(saved);
      setBonusData(bonusRes.data);

      // Default to user's default saved wallet for USDT if available
      const def = saved.find((w: SavedWallet) => w.asset === "USDT" && w.is_default);
      if (def) {
        setSelectedWalletId(def.id);
      } else if (saved.length > 0) {
        const first = saved.find((w: SavedWallet) => w.asset === "USDT");
        if (first) setSelectedWalletId(first.id);
      }
    } catch (e) {
      console.error("Failed to load withdrawal data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected wallet when currency changes
  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    const match = savedWallets.find((w) => w.asset === curr && w.is_default) ||
                  savedWallets.find((w) => w.asset === curr);
    if (match) {
      setSelectedWalletId(match.id);
    } else {
      setSelectedWalletId("custom");
    }
  };

  const currentWallet = wallets.find((w) => w.currency.toUpperCase() === selectedCurrency.toUpperCase());
  const rawBalance = currentWallet ? toNum(currentWallet.balance) : 0;

  // Calculate withdrawable balance deducting locked promotional bonus
  let lockedBonusAmt = 0;
  if (selectedCurrency === "USDT" && bonusData && bonusData.status === "locked") {
    lockedBonusAmt = bonusData.amount;
  }
  const maxWithdrawable = Math.max(0, rawBalance - lockedBonusAmt);

  const isKycVerified = user?.kyc_status === "verified" || user?.kyc_status === "approved";

  // Destination wallet info
  const activeSavedWallet = savedWallets.find((w) => w.id === selectedWalletId);
  const destinationAddress = activeSavedWallet ? activeSavedWallet.address : customAddress;
  const destinationNetwork = activeSavedWallet ? activeSavedWallet.network : customNetwork;

  const handleMaxAmount = () => {
    setAmount(maxWithdrawable.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!isKycVerified) {
      setFormError("Identity verification (KYC) must be approved before withdrawals can be processed. Please complete verification first.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid positive withdrawal amount.");
      return;
    }

    if (numAmount > maxWithdrawable) {
      setFormError(
        lockedBonusAmt > 0
          ? `Withdrawal exceeds available withdrawable balance of ${maxWithdrawable} USDT (Your $${lockedBonusAmt} welcome bonus is locked until completing a qualifying investment).`
          : `Withdrawal amount exceeds available balance of ${formatCrypto(rawBalance)} ${selectedCurrency}.`
      );
      return;
    }

    if (!destinationAddress.trim()) {
      setFormError("Please specify a valid destination wallet address.");
      return;
    }

    if (!confirmedDetails) {
      setFormError("You must verify and confirm the destination address and network.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/wallets/withdraw", {
        amount: numAmount,
        currency: selectedCurrency.toUpperCase(),
        wallet_address: destinationAddress.trim(),
        wallet_type: destinationNetwork.trim(),
      });

      setFormSuccess(
        `Withdrawal request for ${numAmount} ${selectedCurrency} submitted successfully! Funds have been reserved pending administrative dispatch.`
      );
      setAmount("");
      setConfirmedDetails(false);
      loadData(); // Reload balances
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading withdrawal telemetry and wallet reserves...</p>
      </div>
    );
  }

  const numAmount = parseFloat(amount) || 0;
  const fee = 0.0; // Zero platform fee policy
  const netPayout = Math.max(0, numAmount - fee);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6 text-[#F3B94F]" />
            Request Capital Withdrawal
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Dispatch liquid asset reserves directly to your authenticated external cryptocurrency wallets.
          </p>
        </div>

        <Link
          href="/dashboard/withdrawal-history"
          className="btn btn-secondary btn-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <History className="h-4 w-4 text-[#F3B94F]" />
          <span>View Withdrawal History</span>
        </Link>
      </div>

      {/* KYC Enforcement Banner */}
      {!isKycVerified && (
        <div className="panel p-5 border-[#F06464]/40 bg-[#F06464]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-[#F06464] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Identity Verification Required</h3>
              <p className="text-xs text-[#A6B0BE] mt-0.5 leading-relaxed">
                Platform regulatory policy requires approved KYC compliance before cryptocurrency withdrawals can be dispatched. Your current status is: <strong className="text-[#F3B94F] uppercase">{user?.kyc_status || "Pending"}</strong>.
              </p>
            </div>
          </div>
          <Link href="/dashboard/verification" className="btn btn-primary btn-sm shrink-0">
            <span>Complete Verification →</span>
          </Link>
        </div>
      )}

      {/* $5 Locked Bonus Notice */}
      {lockedBonusAmt > 0 && selectedCurrency === "USDT" && (
        <div className="panel p-4 border-[#4388F5]/30 bg-[#4388F5]/5 flex items-start gap-3">
          <Lock className="h-5 w-5 text-[#4388F5] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A6B0BE] leading-relaxed">
            <span className="font-bold text-white block">Promotional Bonus Policy ($5.00 USDT Locked)</span>
            Your $5.00 promotional registration bonus is currently locked until you complete a qualifying investment (e.g. Silver Plan). It cannot be withdrawn directly and has been deducted from your maximum withdrawable balance.
          </div>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-lg bg-[#27C58B]/10 border border-[#27C58B]/30 flex items-start justify-between gap-3 text-xs text-[#27C58B]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{formSuccess}</span>
          </div>
          <Link href="/dashboard/withdrawal-history" className="underline font-bold shrink-0">
            View in History →
          </Link>
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-lg bg-[#F06464]/10 border border-[#F06464]/30 flex items-center gap-2.5 text-xs text-[#F06464]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Withdrawal Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 panel p-6 flex flex-col gap-5 bg-[#111821] border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Asset Selection */}
            <div>
              <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                Select Asset to Withdraw *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["USDT", "BTC", "ETH", "SOL"].map((curr) => {
                  const isSel = selectedCurrency === curr;
                  const w = wallets.find((item) => item.currency?.toUpperCase() === curr);
                  const bal = w ? toNum(w.balance) : 0;

                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => handleCurrencyChange(curr)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        isSel
                          ? "border-[#4388F5] bg-[#4388F5]/10 text-white font-bold"
                          : "border-white/10 bg-[#0B0F14] text-[#7D8998] hover:text-white"
                      }`}
                    >
                      <span className="block text-xs">{curr}</span>
                      <span className="block text-[10px] text-[#A6B0BE] truncate mt-0.5">
                        {formatCrypto(bal)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination Wallet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#A6B0BE]">
                  Destination Wallet *
                </label>
                <Link
                  href="/dashboard/wallets"
                  className="text-[11px] text-[#4388F5] hover:underline"
                >
                  + Manage Saved Wallets
                </Link>
              </div>

              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 mb-2"
              >
                {savedWallets
                  .filter((w) => w.asset === selectedCurrency)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} ({w.network}) - {w.address.slice(0, 10)}...{w.address.slice(-6)} {w.is_default ? "[Default]" : ""}
                    </option>
                  ))}
                <option value="custom">+ Enter New / Custom Destination Address</option>
              </select>

              {selectedWalletId === "custom" && (
                <div className="p-3.5 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col gap-3 mt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#7D8998] block mb-1">
                      Custom Receiving Address
                    </label>
                    <input
                      type="text"
                      placeholder="Paste destination wallet address..."
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="input w-full bg-[#111821] border-white/10 text-white text-xs h-9 font-mono"
                      required={selectedWalletId === "custom"}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#7D8998] block mb-1">
                      Destination Blockchain Network
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tron (TRC-20) / ERC-20 / Native"
                      value={customNetwork}
                      onChange={(e) => setCustomNetwork(e.target.value)}
                      className="input w-full bg-[#111821] border-white/10 text-white text-xs h-9"
                      required={selectedWalletId === "custom"}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Withdrawal Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#A6B0BE]">
                  Withdrawal Amount ({selectedCurrency}) *
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#7D8998]">Withdrawable:</span>
                  <span className="font-bold text-white">
                    {formatCrypto(maxWithdrawable)} {selectedCurrency}
                  </span>
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4388F5]/20 text-[#4388F5] ml-1 hover:bg-[#4388F5]/30"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <input
                type="number"
                step="any"
                min="0.00000001"
                max={maxWithdrawable}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-bold"
                required
              />
            </div>

            {/* Confirmation Checkbox */}
            <div className="p-3.5 rounded bg-[#0B0F14] border border-white/10">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedDetails}
                  onChange={(e) => setConfirmedDetails(e.target.checked)}
                  className="rounded border-white/20 bg-[#111821] text-[#4388F5] mt-0.5"
                />
                <span className="text-xs text-[#A6B0BE] leading-relaxed">
                  I confirm that the destination wallet address and blockchain network are correct. I understand blockchain transfers are irreversible.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !isKycVerified || maxWithdrawable <= 0}
              className="btn btn-primary w-full py-2.5 font-semibold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Withdrawal Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Withdrawal Request</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transaction Summary Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="panel p-5 bg-[#111821] border-white/10 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D8998] border-b border-white/10 pb-2.5">
              Withdrawal Order Summary
            </h4>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center text-[#A6B0BE]">
                <span>Requested Amount</span>
                <span className="font-bold text-white">
                  {formatCrypto(numAmount)} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#A6B0BE]">
                <span>Platform Processing Fee</span>
                <span className="font-bold text-[#27C58B]">0.00 {selectedCurrency} (Waived)</span>
              </div>
              <div className="flex justify-between items-center text-[#A6B0BE]">
                <span>Destination Network</span>
                <span className="font-medium text-white">{destinationNetwork || "N/A"}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm text-white">
                <span>Estimated Net Payout</span>
                <span className="text-[#27C58B]">
                  {formatCrypto(netPayout)} {selectedCurrency}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#0B0F14] border border-white/5 text-[11px] text-[#7D8998] flex items-start gap-2">
              <Info className="h-4 w-4 text-[#4388F5] shrink-0 mt-0.5" />
              <p>
                Funds will be frozen from your available balance immediately upon submission and broadcast following administrative authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
