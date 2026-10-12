"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Loader2,
  Coins,
  Layers,
  History,
  X,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { toNum, formatCrypto } from "@/lib/format";

interface WalletBalance {
  currency: string;
  balance: number | string;
  frozen_balance: number | string;
  total_deposited: number | string;
  total_withdrawn: number | string;
}

interface SavedWallet {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string;
  is_default: boolean;
  created_at: string;
}

const NETWORK_OPTIONS: Record<string, string[]> = {
  BTC: ["Bitcoin Mainnet"],
  ETH: ["Ethereum (ERC-20)"],
  USDT: [
    "Tron (TRC-20)",
    "Ethereum (ERC-20)",
    "BNB Smart Chain (BEP-20)",
    "Solana (SPL)",
  ],
  SOL: ["Solana Mainnet"],
};

export default function WalletsPage() {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("Tron (TRC-20)");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [balRes, savedRes] = await Promise.all([
        api.get("/wallets"),
        api.get("/wallets/saved"),
      ]);
      setBalances(balRes.data || []);
      setSavedWallets(savedRes.data || []);
    } catch (e) {
      console.error("Failed to load wallets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update default network when asset changes
  const handleAssetChange = (newAsset: string) => {
    setAsset(newAsset);
    const available = NETWORK_OPTIONS[newAsset] || [];
    if (available.length > 0) {
      setNetwork(available[0]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!address.trim() || !label.trim()) {
      setModalError("Please provide both a wallet label and a valid receiving address.");
      return;
    }

    if (!confirmedRisk) {
      setModalError("You must verify and confirm the blockchain network before saving.");
      return;
    }

    try {
      setModalSubmitting(true);
      const res = await api.post("/wallets/saved", {
        asset,
        network,
        address: address.trim(),
        label: label.trim(),
        is_default: isDefault,
      });

      setSavedWallets((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setAddress("");
      setLabel("");
      setConfirmedRisk(false);
      setSuccessMsg(`Successfully saved ${label} destination wallet.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Failed to validate or save wallet address.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteWallet = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the saved wallet "${name}"?`)) return;
    try {
      await api.delete(`/wallets/saved/${id}`);
      setSavedWallets((prev) => prev.filter((w) => w.id !== id));
      setSuccessMsg("Destination wallet removed successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to remove wallet.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/wallets/saved/${id}`, { is_default: true });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update default status.");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading cryptocurrency wallets and security telemetry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Cryptocurrency Wallets & Custody
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Manage your liquid portfolio balances and authorized destination addresses across supported blockchains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/deposits" className="btn btn-secondary btn-sm font-semibold">
            <ArrowDownLeft className="h-3.5 w-3.5 mr-1 text-[#27C58B]" />
            <span>Initiate Deposit</span>
          </Link>
          <Link href="/dashboard/withdrawals" className="btn btn-primary btn-sm font-semibold shadow-sm">
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
            <span>Request Withdrawal</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 4 Asset Balance Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7D8998] mb-3">
          Liquid Reserves & Available Balances
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
            const w = balances.find((item) => item.currency?.toUpperCase() === curr);
            const balance = w ? toNum(w.balance) : 0;
            const frozen = w ? toNum(w.frozen_balance) : 0;

            return (
              <div key={curr} className="panel p-4 flex flex-col justify-between min-h-[130px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{curr}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#7D8998]">
                    {curr === "USDT" ? "Multi-Net" : "Mainnet"}
                  </span>
                </div>

                <div className="my-2">
                  <span className="num text-xl sm:text-2xl font-bold text-white block truncate">
                    {formatCrypto(balance)}
                  </span>
                  <span className="text-[10px] text-[#7D8998] block">
                    {curr} Liquid Reserve
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A6B0BE]">
                  <span>Frozen:</span>
                  <span className="font-medium text-white">{formatCrypto(frozen)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/dashboard/deposits"
          className="panel p-4 flex items-center justify-between hover:border-[#4388F5]/40 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#4388F5]/10 border border-[#4388F5]/20 flex items-center justify-center text-[#4388F5]">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-[#4388F5] transition">
                Deposit Funds
              </span>
              <span className="text-[11px] text-[#7D8998]">Generate address & TXID proof</span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#7D8998] group-hover:text-white transition" />
        </Link>

        <Link
          href="/dashboard/my-deposits"
          className="panel p-4 flex items-center justify-between hover:border-[#4388F5]/40 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#27C58B]/10 border border-[#27C58B]/20 flex items-center justify-center text-[#27C58B]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-[#27C58B] transition">
                My Deposits
              </span>
              <span className="text-[11px] text-[#7D8998]">Audit past deposit records</span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#7D8998] group-hover:text-white transition" />
        </Link>

        <Link
          href="/dashboard/withdrawals"
          className="panel p-4 flex items-center justify-between hover:border-[#4388F5]/40 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#F3B94F]/10 border border-[#F3B94F]/20 flex items-center justify-center text-[#F3B94F]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-[#F3B94F] transition">
                Withdrawals
              </span>
              <span className="text-[11px] text-[#7D8998]">Dispatch to saved wallets</span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#7D8998] group-hover:text-white transition" />
        </Link>

        <Link
          href="/dashboard/withdrawal-history"
          className="panel p-4 flex items-center justify-between hover:border-[#4388F5]/40 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#7D8998]/10 border border-[#7D8998]/20 flex items-center justify-center text-[#7D8998]">
              <History className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-white transition">
                Withdrawal History
              </span>
              <span className="text-[11px] text-[#7D8998]">Track payout status & TXIDs</span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#7D8998] group-hover:text-white transition" />
        </Link>
      </div>

      {/* Prominent Risk Warning Banner (Phase 5 Requirement) */}
      <div className="panel p-4 sm:p-5 border-[#F3B94F]/40 bg-[#F3B94F]/5 flex items-start gap-3.5">
        <AlertTriangle className="h-5 w-5 text-[#F3B94F] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-[#F3B94F] uppercase tracking-wider">
            Critical Blockchain Safety Notice
          </h4>
          <p className="text-xs text-[#F5F7FA] mt-1 leading-relaxed">
            IMPORTANT: Always verify your wallet address and blockchain network before saving. The selected network must match the receiving wallet. Transfers sent to an incompatible address or network may be irreversible and could result in permanent loss of funds.
          </p>
        </div>
      </div>

      {/* Saved Destination Wallets Section */}
      <div className="panel p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#4388F5]" />
              Saved Destination Wallets
            </h3>
            <p className="text-xs text-[#7D8998] mt-0.5">
              Authorized personal addresses used for expedited withdrawals and yield distributions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Destination Wallet</span>
          </button>
        </div>

        {savedWallets.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No Destination Wallets Saved</p>
              <p className="text-xs text-[#7D8998] mt-0.5 max-w-sm">
                Add your verified external Bitcoin, Ethereum, USDT, or Solana addresses to simplify future withdrawals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-secondary btn-sm mt-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Your First Wallet</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedWallets.map((sw) => (
              <div
                key={sw.id}
                className="p-4 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col justify-between gap-3 hover:border-white/20 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30">
                      {sw.asset}
                    </span>
                    <span className="text-[11px] font-medium text-[#A6B0BE]">
                      {sw.network}
                    </span>
                    {sw.is_default && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30">
                        <Star className="h-3 w-3 fill-[#27C58B]" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!sw.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(sw.id)}
                        title="Set as Default Wallet"
                        className="p-1 rounded text-[#7D8998] hover:text-[#27C58B] transition"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteWallet(sw.id, sw.label)}
                      title="Remove Wallet"
                      className="p-1 rounded text-[#7D8998] hover:text-[#F06464] transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-white block">{sw.label}</span>
                  <div className="mt-1 flex items-center justify-between gap-2 p-2 rounded bg-[#111821] border border-white/5 font-mono text-[11px] text-[#E2E8F0] break-all">
                    <span>{sw.address}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(sw.address, sw.id)}
                      className="p-1 text-[#7D8998] hover:text-white shrink-0"
                      title="Copy Address"
                    >
                      {copiedId === sw.id ? (
                        <Check className="h-3.5 w-3.5 text-[#27C58B]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-[#7D8998] flex items-center justify-between pt-1">
                  <span>Added {new Date(sw.created_at).toLocaleDateString()}</span>
                  <span className="text-[#27C58B]">Address Validated</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel w-full max-w-lg p-6 bg-[#111821] border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#4388F5]" />
                Add Destination Wallet
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#7D8998] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddWallet} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Asset */}
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Asset *
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  >
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="SOL">SOL (Solana)</option>
                  </select>
                </div>

                {/* Network */}
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Blockchain Network *
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  >
                    {(NETWORK_OPTIONS[asset] || []).map((net) => (
                      <option key={net} value={net}>
                        {net}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Wallet Label */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Wallet Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ledger Cold Storage / Binance Account"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              {/* Destination Address */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Receiving Wallet Address *
                </label>
                <input
                  type="text"
                  placeholder={
                    asset === "BTC"
                      ? "1..., 3..., or bc1..."
                      : asset === "ETH"
                      ? "0x..."
                      : asset === "SOL"
                      ? "Base58 address (e.g. 7EcP...)"
                      : network.includes("TRC")
                      ? "T... (Tron 34 characters)"
                      : "0x... (ERC-20 / BEP-20)"
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-mono"
                  required
                />
              </div>

              {/* Default Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultToggle"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-white/20 bg-[#0B0F14] text-[#4388F5]"
                />
                <label htmlFor="defaultToggle" className="text-xs text-[#A6B0BE] cursor-pointer">
                  Set as default destination wallet for {asset}
                </label>
              </div>

              {/* Network Confirmation Attestation */}
              <div className="p-3 rounded bg-[#F3B94F]/10 border border-[#F3B94F]/30 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="riskConfirm"
                  checked={confirmedRisk}
                  onChange={(e) => setConfirmedRisk(e.target.checked)}
                  className="rounded border-white/20 bg-[#0B0F14] text-[#4388F5] mt-0.5"
                  required
                />
                <label htmlFor="riskConfirm" className="text-[11px] text-[#F5F7FA] leading-tight cursor-pointer">
                  I confirm that the receiving address above matches the selected <strong>{network}</strong> network. I acknowledge that transfers sent via incorrect networks cannot be reversed.
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Save Destination Wallet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
