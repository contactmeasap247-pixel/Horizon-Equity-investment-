"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Coins,
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

const SUPPORTED_CURRENCIES = [
  { code: "BTC", name: "Bitcoin", network: "Native Mainnet" },
  { code: "ETH", name: "Ethereum", network: "ERC-20" },
  { code: "USDT", name: "Tether USD", network: "TRC-20 / ERC-20" },
  { code: "SOL", name: "Solana", network: "SPL Native" },
];

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

      setWallets(walletsRes.data || []);
      setAdminAddresses(addressesRes.data || []);
      setDeposits(depositsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (e) {
      console.error("Error loading wallet details:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const activeAdminAddress =
    adminAddresses.find(
      (addr) => addr.currency.toUpperCase() === selectedCurrency.toUpperCase()
    )?.wallet_address || "No deposit address configured.";

  const selectedCurrencyMeta = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency);
  const currentWallet = wallets.find((w) => w.currency.toUpperCase() === selectedCurrency.toUpperCase());
  const currentAvailable = currentWallet ? currentWallet.balance : 0;

  const handleCopyAddress = () => {
    if (activeAdminAddress.startsWith("No")) return;
    navigator.clipboard.writeText(activeAdminAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !txHash) {
      setFormError("Please populate both the transferred amount and the blockchain transaction hash.");
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
      setFormSuccess(`Deposit proof for ${depositAmount} ${selectedCurrency} submitted for multi-signature verification.`);
      setDepositAmount("");
      setTxHash("");
      fetchWalletData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Submission failed. Please verify your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !withdrawDest) {
      setFormError("Please provide both destination wallet address and withdrawal amount.");
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid withdrawal amount greater than zero.");
      return;
    }

    if (amt > currentAvailable) {
      setFormError(`Insufficient available balance. You currently have ${currentAvailable.toFixed(6)} ${selectedCurrency} available.`);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.post("/wallets/withdraw", {
        amount: amt,
        currency: selectedCurrency,
        wallet_address: withdrawDest.trim(),
        wallet_type: "Native",
      });
      setFormSuccess(`Withdrawal request for ${withdrawAmount} ${selectedCurrency} submitted to security queue.`);
      setWithdrawAmount("");
      setWithdrawDest("");
      fetchWalletData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Withdrawal failed. Ensure you have adequate available balance.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading vault accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Custody</span>
              <span className="text-xs text-text-faint font-mono">MPC WALLETS</span>
            </div>
            <h1 className="t-page">Wallets & Capital Custody</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Manage multi-currency ledger balances, initiate verified on-chain deposits, and dispatch cold-storage withdrawal requests.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-success flex items-center gap-1.5 py-1 px-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              Vault Health: Operational
            </span>
          </div>
        </div>
      </div>

      {/* Currency Balance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="t-title flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent" />
            Asset Balances
          </h2>
          <span className="text-xs text-text-muted">Multi-Asset Ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const w = wallets.find((item) => item.currency.toUpperCase() === curr.code);
            const balance = w ? w.balance : 0;
            const frozen = w ? w.frozen_balance : 0;
            const isSelected = selectedCurrency === curr.code;

            return (
              <div
                key={curr.code}
                onClick={() => setSelectedCurrency(curr.code)}
                className={`panel p-5 cursor-pointer transition-all border ${
                  isSelected
                    ? "border-accent shadow-sm"
                    : "border-border hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center font-bold text-xs text-text">
                      {curr.code.slice(0, 3)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-text leading-tight">{curr.code}</div>
                      <div className="text-[11px] text-text-faint">{curr.name}</div>
                    </div>
                  </div>
                  <span className="badge font-mono text-[10px]">{curr.network}</span>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-text-muted mb-0.5">Available Balance</div>
                  <div className="text-2xl font-bold text-text num font-mono">
                    {balance.toFixed(6)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                  <span>Locked in Yield:</span>
                  <span className="font-mono text-text num font-medium">
                    {frozen.toFixed(6)} {curr.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit & Withdraw Workflow Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Actions Terminal */}
        <div className="lg:col-span-5 panel p-6 space-y-6">
          {/* Operation Tab Switcher */}
          <div>
            <div className="tabs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("deposit");
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`tab flex items-center gap-2 ${activeTab === "deposit" ? "tab-active" : ""}`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Deposit Assets
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("withdraw");
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`tab flex items-center gap-2 ${activeTab === "withdraw" ? "tab-active" : ""}`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw Assets
              </button>
            </div>
          </div>

          {/* Feedback banners */}
          {formError && (
            <div className="alert alert-danger text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          {formSuccess && (
            <div className="alert alert-success text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
              <div className="leading-relaxed">{formSuccess}</div>
            </div>
          )}

          {/* Currency Selector Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Select Working Asset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUPPORTED_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all text-center ${
                    selectedCurrency === curr.code
                      ? "bg-accent/15 border-accent text-accent font-bold"
                      : "bg-surface-raised border-border text-text-muted hover:text-text hover:border-border-hover"
                  }`}
                >
                  {curr.code}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-faint">
              Network: {selectedCurrencyMeta?.network}
            </p>
          </div>

          {/* DEPOSIT FORM */}
          {activeTab === "deposit" && (
            <form onSubmit={handleDepositSubmit} className="space-y-5">
              <div className="inset p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">
                    Institutional Deposit Address ({selectedCurrency})
                  </span>
                  <span className="badge badge-accent text-[10px]">VERIFIED CUSTODY</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeAdminAddress}
                    className="input text-xs font-mono select-all bg-canvas py-2"
                  />
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    disabled={activeAdminAddress.startsWith("No")}
                    className="btn btn-secondary px-3 py-2 flex items-center justify-center flex-shrink-0"
                    title="Copy Address"
                  >
                    {copiedAddress ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-text-faint leading-relaxed">
                  Notice: Transfer only <strong className="text-text">{selectedCurrency}</strong> to this specific custodial address. Cross-chain transfers without bridge support cannot be routed.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted flex justify-between">
                  <span>Transferred Amount ({selectedCurrency})</span>
                  <span className="text-text-faint font-normal">Min: 0.001 {selectedCurrency}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.05"
                  className="input font-mono"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Blockchain Transaction Hash (TXID)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste on-chain transaction hash or hex string"
                  className="input font-mono text-xs"
                  required
                  disabled={submitting}
                />
                <p className="text-[11px] text-text-faint">
                  Transactions require network confirmations before balance settles into available capital.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full justify-center py-2.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying Proof...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Submit Deposit Proof
                  </>
                )}
              </button>
            </form>
          )}

          {/* WITHDRAW FORM */}
          {activeTab === "withdraw" && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              <div className="inset p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Available for Withdrawal:</span>
                  <span className="font-mono text-text font-bold num">
                    {currentAvailable.toFixed(6)} {selectedCurrency}
                  </span>
                </div>
                <div className="text-[11px] text-text-faint">
                  Cold-storage settlement requests execute under automated risk checks within standard clearing windows.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Destination External Wallet Address
                </label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  placeholder={`Enter destination ${selectedCurrency} address`}
                  className="input font-mono text-xs"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-muted">
                    Withdrawal Amount ({selectedCurrency})
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(currentAvailable.toString())}
                    className="text-[11px] text-accent hover:underline"
                  >
                    Use Max Available
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.01"
                  className="input font-mono"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || currentAvailable <= 0}
                className="btn btn-primary w-full justify-center py-2.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Dispatching Transfer...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Dispatch Withdrawal Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Col: Transaction History Ledgers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Deposits Panel */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="t-title flex items-center gap-2">
                <History className="w-4 h-4 text-accent" />
                Deposit Settlement Ledger
              </h3>
              <span className="badge font-mono text-[10px]">
                {deposits.length} Records
              </span>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Asset</th>
                    <th>Amount</th>
                    <th>TX Hash</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-text-muted text-xs">
                        No deposit settlements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    deposits.map((dep) => (
                      <tr key={dep.id}>
                        <td className="text-text-muted text-xs font-mono">
                          {new Date(dep.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="font-semibold text-text text-xs">
                            {dep.currency}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold text-text num">
                          {dep.amount}
                        </td>
                        <td className="font-mono text-xs text-text-faint">
                          {dep.transaction_hash ? (
                            <span title={dep.transaction_hash}>
                              {dep.transaction_hash.slice(0, 10)}...{dep.transaction_hash.slice(-6)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge text-[10px] ${
                              dep.status === "verified"
                                ? "badge-success"
                                : dep.status === "pending"
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                          >
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

          {/* Recent Withdrawals Panel */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="t-title flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-accent" />
                Withdrawal Clearing Ledger
              </h3>
              <span className="badge font-mono text-[10px]">
                {withdrawals.length} Records
              </span>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Asset</th>
                    <th>Amount</th>
                    <th>Destination</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-text-muted text-xs">
                        No withdrawal transfers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="text-text-muted text-xs font-mono">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="font-semibold text-text text-xs">
                            {w.currency}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold text-text num">
                          {w.amount}
                        </td>
                        <td className="font-mono text-xs text-text-faint">
                          {w.wallet_address ? (
                            <span title={w.wallet_address}>
                              {w.wallet_address.slice(0, 8)}...{w.wallet_address.slice(-6)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge text-[10px] ${
                              w.status === "completed"
                                ? "badge-success"
                                : w.status === "pending"
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                          >
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
