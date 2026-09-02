"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Coins,
  History,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";

interface WalletItem {
  currency: string;
  balance: number;
  frozen_balance: number;
}

interface AdminAddress {
  id: string;
  currency: string;
  wallet_address: string;
}

interface RequestItem {
  id: string;
  amount: number;
  currency: string;
  wallet_address?: string;
  transaction_hash?: string;
  status: string;
  created_at: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [adminAddresses, setAdminAddresses] = useState<AdminAddress[]>([]);
  const [deposits, setDeposits] = useState<RequestItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<RequestItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Form states
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDest, setWithdrawDest] = useState("");
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchWalletData = async () => {
    try {
      const [walletsRes, addressesRes, depositsRes, withdrawalsRes] = await Promise.all([
        api.get("/wallets"),
        api.get("/wallets/addresses"),
        api.get("/wallets/history/deposits"),
        api.get("/wallets/history/withdrawals"),
      ]);

      setWallets(walletsRes.data);
      setAdminAddresses(addressesRes.data);
      setDeposits(depositsRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (e) {
      console.error("Error loading wallet details:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const activeAdminAddress = adminAddresses.find(
    (addr) => addr.currency.toUpperCase() === selectedCurrency.toUpperCase()
  )?.wallet_address || "No deposit address configured.";

  const handleCopyAddress = () => {
    if (activeAdminAddress.startsWith("No")) return;
    navigator.clipboard.writeText(activeAdminAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !txHash) {
      setFormError("Please populate both Amount and Transaction Hash fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.post("/wallets/deposit", {
        amount: parseFloat(depositAmount),
        currency: selectedCurrency,
        transaction_hash: txHash.trim(),
      });
      setFormSuccess(`Deposit request of ${depositAmount} ${selectedCurrency} submitted for verification.`);
      setDepositAmount("");
      setTxHash("");
      fetchWalletData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Submission failed. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !withdrawDest) {
      setFormError("Please populate both Amount and Destination Wallet Address fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.post("/wallets/withdraw", {
        amount: parseFloat(withdrawAmount),
        currency: selectedCurrency,
        wallet_address: withdrawDest.trim(),
        wallet_type: "Native",
      });
      setFormSuccess(`Withdrawal request of ${withdrawAmount} ${selectedCurrency} submitted successfully.`);
      setWithdrawAmount("");
      setWithdrawDest("");
      fetchWalletData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Submission failed. Ensure you have adequate balance.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 stagger-1 animate-slide-up">
      {/* Wallet balances grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
          const w = wallets.find((item) => item.currency.toUpperCase() === curr);
          const balance = w ? w.balance : 0;
          const frozen = w ? w.frozen_balance : 0;

          let colorClass = "text-white";
          if (curr === "BTC") colorClass = "text-btc";
          else if (curr === "ETH") colorClass = "text-eth";
          else if (curr === "USDT") colorClass = "text-usdt";
          else if (curr === "SOL") colorClass = "text-sol";

          return (
            <div key={curr} className="card p-6 flex flex-col gap-4 bg-[#0D2D4A]/65 border-white/5 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary uppercase font-semibold">{curr} Assets</span>
                <span className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs ${colorClass}`}>
                  {curr}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold">{balance.toFixed(6)}</span>
                <span className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">
                  Available Balance
                </span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between text-xs text-text-secondary">
                <span>Locked/Frozen:</span>
                <span className="font-semibold">{frozen.toFixed(6)} {curr}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Actions & History */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Actions form */}
        <div className="lg:col-span-5 card bg-[#0D2D4A]/85 border-white/10 p-6 flex flex-col gap-6">
          <div className="flex border-b border-white/5 pb-1">
            <button
              onClick={() => { setActiveTab("deposit"); setFormError(null); setFormSuccess(null); }}
              className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
                activeTab === "deposit" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
              }`}
            >
              Deposit Funds
            </button>
            <button
              onClick={() => { setActiveTab("withdraw"); setFormError(null); setFormSuccess(null); }}
              className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
                activeTab === "withdraw" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
              }`}
            >
              Withdraw Funds
            </button>
          </div>

          {/* Feedback messages */}
          {formError && (
            <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Currency selection */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Select Cryptocurrency</label>
            <div className="grid grid-cols-4 gap-2">
              {["BTC", "ETH", "USDT", "SOL"].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`py-2 rounded-lg border font-semibold text-xs transition-all ${
                    selectedCurrency === curr
                      ? "border-gold-300 bg-gold-300/10 text-gold-300"
                      : "border-white/5 bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Form */}
          {activeTab === "deposit" && (
            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4">
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                  Send Your {selectedCurrency} to Address Below:
                </span>
                
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={activeAdminAddress}
                    className="input text-xs font-mono select-all bg-white/[0.02]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="h-10 px-3 bg-gold-300 text-[#0A2540] hover:bg-gold-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Important: Only send {selectedCurrency} to this address. Sending other assets will result in permanent loss.
                </p>
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Sent Amount</label>
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.05"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              {/* TX Hash input */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Blockchain TXID / Hash</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="e.g. 7ad7a6fae9a2d8..."
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Proof"}
              </button>
            </form>
          )}

          {/* Withdraw Form */}
          {activeTab === "withdraw" && (
            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
              {/* Destination address */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Destination Address</label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  placeholder="Paste external wallet address"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Withdrawal Amount</label>
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.01"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Withdrawal"}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Request histories tables */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Deposits queue */}
          <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-gold-300" /> Recent Deposits
            </h3>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Asset</th>
                    <th>Tx Hash</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-text-muted">
                        No deposits found.
                      </td>
                    </tr>
                  ) : (
                    deposits.map((dep) => (
                      <tr key={dep.id}>
                        <td className="text-text-secondary">{new Date(dep.created_at).toLocaleDateString()}</td>
                        <td className="font-bold">{dep.amount}</td>
                        <td className="font-semibold text-gold-300">{dep.currency}</td>
                        <td className="font-mono text-xs text-text-muted">
                          {dep.transaction_hash ? `${dep.transaction_hash.slice(0, 8)}...` : "-"}
                        </td>
                        <td>
                          <span className={`badge ${
                            dep.status === "verified" ? "badge-success" : dep.status === "pending" ? "badge-warning" : "badge-danger"
                          }`}>
                            {dep.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawals queue */}
          <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-gold-300" /> Recent Withdrawals
            </h3>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Asset</th>
                    <th>Dest. Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-text-muted">
                        No withdrawals found.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="text-text-secondary">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="font-bold">{w.amount}</td>
                        <td className="font-semibold text-gold-300">{w.currency}</td>
                        <td className="font-mono text-xs text-text-muted">
                          {w.wallet_address ? `${w.wallet_address.slice(0, 8)}...` : "-"}
                        </td>
                        <td>
                          <span className={`badge ${
                            w.status === "completed" ? "badge-success" : w.status === "pending" ? "badge-warning" : "badge-danger"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
