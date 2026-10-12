"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Coins,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  UserX,
  UserCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface Stats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  kyc_pending: number;
  wallet_balances: Record<string, number>;
  total_deposits_count: number;
  total_withdrawals_count: number;
  pending_deposits_count: number;
  pending_withdrawals_count: number;
  active_investments_count: number;
  total_invested_amount: Record<string, number>;
  total_referral_commissions: Record<string, number>;
}

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  kyc_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
}

interface DepositItem {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  wallet_address: string;
  transaction_hash: string;
  status: string;
  created_at: string;
}

interface WithdrawalItem {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  wallet_address: string;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"kyc" | "deposits" | "withdrawals" | "adjust" | "suspensions">("kyc");
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection/TX Hash Modal states
  const [rejectingItem, setRejectingItem] = useState<{ type: "deposit" | "withdrawal" | "kyc"; id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [completingWithdrawal, setCompletingWithdrawal] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");

  const [suspendingUser, setSuspendingUser] = useState<{ id: string; name: string } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  // Manual adjustment form states
  const [adjUserId, setAdjUserId] = useState("");
  const [adjCurrency, setAdjCurrency] = useState("BTC");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState("credit"); // credit, debit
  const [adjDescription, setAdjDescription] = useState("");

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/deposits?status=pending"),
        api.get("/admin/withdrawals?status=pending"),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setDeposits(depositsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (e) {
      console.error("Error loading admin stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- KYC Handlers ---
  const handleKycDecision = async (userId: string, decision: "verified" | "rejected", reason?: string) => {
    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      await api.post(`/admin/users/${userId}/kyc`, {
        status: decision,
        rejection_reason: reason || undefined,
      });
      setFeedbackSuccess(`KYC application updated successfully to ${decision}.`);
      setRejectingItem(null);
      setRejectionReason("");
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Deposit Handlers ---
  const handleVerifyDeposit = async (depositId: string, decision: "verified" | "rejected", reason?: string) => {
    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      await api.post(`/admin/deposits/${depositId}/verify`, {
        status: decision,
        rejection_reason: reason || undefined,
      });
      setFeedbackSuccess(`Deposit status updated successfully to ${decision}.`);
      setRejectingItem(null);
      setRejectionReason("");
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Withdrawal Handlers ---
  const handleProcessWithdrawal = async (withdrawalId: string, decision: "completed" | "rejected", txId?: string, reason?: string) => {
    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      await api.post(`/admin/withdrawals/${withdrawalId}/process`, {
        status: decision,
        transaction_hash: txId || undefined,
        rejection_reason: reason || undefined,
      });
      setFeedbackSuccess(`Withdrawal status updated successfully to ${decision}.`);
      setRejectingItem(null);
      setRejectionReason("");
      setCompletingWithdrawal(null);
      setTxHash("");
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- User Suspension Toggle ---
  const handleToggleSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;

    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      await api.post(`/admin/users/${suspendingUser.id}/suspend`, {
        is_suspended: true,
        suspension_reason: suspensionReason.trim() || undefined,
      });
      setFeedbackSuccess(`Account for ${suspendingUser.name} suspended.`);
      setSuspendingUser(null);
      setSuspensionReason("");
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (userId: string, name: string) => {
    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      await api.post(`/admin/users/${userId}/suspend`, {
        is_suspended: false,
      });
      setFeedbackSuccess(`Account for ${name} unsuspended.`);
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Manual Balance Adjustment ---
  const handleManualAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjUserId || !adjAmount) {
      setFeedbackError("Please select both target user and adjustment amount.");
      return;
    }

    setActionLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      await api.post(`/admin/users/${adjUserId}/adjust-balance`, {
        currency: adjCurrency,
        amount: parseFloat(adjAmount),
        adjustment_type: adjType,
        description: adjDescription.trim() || undefined,
      });

      setFeedbackSuccess(`Balance successfully adjusted (${adjType} of ${adjAmount} ${adjCurrency}).`);
      setAdjAmount("");
      setAdjDescription("");
      fetchAdminData();
    } catch (error: any) {
      setFeedbackError(error.response?.data?.detail || "Balance adjustment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading administrative terminal...</p>
      </div>
    );
  }

  const kycPendingUsers = users.filter((u) => u.kyc_status === "pending");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Admin Console</span>
              <span className="text-xs text-text-faint font-mono">SUPERUSER CLEARING</span>
            </div>
            <h1 className="t-page">Administrative Clearing Terminal</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Execute multi-signature settlement approvals, review compliance KYC submissions, configure vault addresses, and manage account risk states.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin/wallets"
              className="btn btn-secondary px-3.5 py-2 text-xs flex items-center gap-2"
            >
              <Wallet className="w-4 h-4 text-accent" />
              <span>Custodial Vault Addresses</span>
              <ExternalLink className="w-3.5 h-3.5 text-text-faint" />
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Analytics Metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Total Users
              </span>
              <Users className="w-4 h-4 text-text-faint" />
            </div>
            <div className="text-3xl font-extrabold text-text num font-mono mt-3">
              {stats.total_users}
            </div>
            <div className="mt-3 pt-2 border-t border-border-subtle text-[11px] text-text-faint">
              {stats.suspended_users} Suspended Account{stats.suspended_users !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                KYC Verifications
              </span>
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <div
              className={`text-3xl font-extrabold num font-mono mt-3 ${
                stats.kyc_pending > 0 ? "text-accent" : "text-text"
              }`}
            >
              {stats.kyc_pending} Pending
            </div>
            <div className="mt-3 pt-2 border-t border-border-subtle text-[11px] text-text-faint">
              Identity queues awaiting review
            </div>
          </div>

          <div className="panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Yield Deployments
              </span>
              <TrendingUp className="w-4 h-4 text-text-faint" />
            </div>
            <div className="text-3xl font-extrabold text-text num font-mono mt-3">
              {stats.active_investments_count}
            </div>
            <div className="mt-3 pt-2 border-t border-border-subtle text-[11px] text-text-faint">
              Active plan purchases
            </div>
          </div>

          <div className="panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Settlement Queue
              </span>
              <AlertCircle className="w-4 h-4 text-warning" />
            </div>
            <div className="text-3xl font-extrabold text-text num font-mono mt-3">
              {stats.pending_deposits_count + stats.pending_withdrawals_count}
            </div>
            <div className="mt-3 pt-2 border-t border-border-subtle text-[11px] text-text-faint">
              {stats.pending_deposits_count} Deposits / {stats.pending_withdrawals_count} Withdrawals
            </div>
          </div>
        </div>
      )}

      {/* Main Clearing Terminal Panel */}
      <div className="panel p-6 space-y-6">
        {/* Tabs Control */}
        <div className="border-b border-border pb-1 overflow-x-auto">
          <div className="tabs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("kyc");
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === "kyc" ? "tab-active" : ""
              }`}
            >
              <FileText className="w-4 h-4" />
              KYC Verifications ({kycPendingUsers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("deposits");
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === "deposits" ? "tab-active" : ""
              }`}
            >
              <Coins className="w-4 h-4" />
              Verify Deposits ({deposits.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("withdrawals");
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === "withdrawals" ? "tab-active" : ""
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Verify Withdrawals ({withdrawals.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("adjust");
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === "adjust" ? "tab-active" : ""
              }`}
            >
              <Wallet className="w-4 h-4" />
              Manual Adjustments
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("suspensions");
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === "suspensions" ? "tab-active" : ""
              }`}
            >
              <Shield className="w-4 h-4" />
              Account Risk &amp; Suspensions
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {feedbackError && (
          <div className="alert alert-danger text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
            <div className="leading-relaxed">{feedbackError}</div>
          </div>
        )}
        {feedbackSuccess && (
          <div className="alert alert-success text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
            <div className="leading-relaxed">{feedbackSuccess}</div>
          </div>
        )}

        {/* --- KYC List Tab --- */}
        {activeTab === "kyc" && (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Signup Date</th>
                    <th>Document Status</th>
                    <th className="text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycPendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-text-muted text-xs">
                        No pending KYC verification requests in the queue.
                      </td>
                    </tr>
                  ) : (
                    kycPendingUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="font-semibold text-text text-xs">{u.full_name}</div>
                          <div className="text-[10px] text-text-faint font-mono">{u.email}</div>
                        </td>
                        <td className="text-text-muted text-xs font-mono">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge badge-warning text-[10px] uppercase font-mono">
                            Pending Review
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleKycDecision(u.id, "verified")}
                              disabled={actionLoading}
                              className="btn btn-secondary btn-sm text-success hover:bg-success/15 px-2.5 py-1"
                              title="Approve KYC"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingItem({ type: "kyc", id: u.id })}
                              disabled={actionLoading}
                              className="btn btn-secondary btn-sm text-danger hover:bg-danger/15 px-2.5 py-1"
                              title="Reject KYC"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Deposits Approval List Tab --- */}
        {activeTab === "deposits" && (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Account</th>
                    <th>Amount</th>
                    <th>TX Hash</th>
                    <th>Custodial Address</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-text-muted text-xs">
                        No pending deposit verification queues awaiting review.
                      </td>
                    </tr>
                  ) : (
                    deposits.map((dep) => {
                      const userObj = users.find((u) => u.id === dep.user_id);
                      return (
                        <tr key={dep.id}>
                          <td>
                            <div className="font-semibold text-text text-xs">
                              {userObj?.full_name || "Unknown User"}
                            </div>
                            <div className="text-[10px] text-text-faint font-mono truncate max-w-[140px]">
                              {userObj?.email}
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-xs font-bold text-text num">
                              {dep.amount}
                            </span>{" "}
                            <span className="text-accent font-semibold text-xs">
                              {dep.currency}
                            </span>
                          </td>
                          <td className="font-mono text-xs text-text-faint max-w-[120px] truncate" title={dep.transaction_hash}>
                            {dep.transaction_hash || "—"}
                          </td>
                          <td className="font-mono text-xs text-text-faint max-w-[120px] truncate" title={dep.wallet_address}>
                            {dep.wallet_address || "—"}
                          </td>
                          <td>
                            <span className="badge badge-warning text-[10px] uppercase font-mono">
                              {dep.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleVerifyDeposit(dep.id, "verified")}
                                disabled={actionLoading}
                                className="btn btn-secondary btn-sm text-success hover:bg-success/15 px-2.5 py-1"
                                title="Approve & Credit Balance"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingItem({ type: "deposit", id: dep.id })}
                                disabled={actionLoading}
                                className="btn btn-secondary btn-sm text-danger hover:bg-danger/15 px-2.5 py-1"
                                title="Reject Deposit"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Withdrawals Approval List Tab --- */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Account</th>
                    <th>Amount</th>
                    <th>Destination Wallet</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-text-muted text-xs">
                        No pending withdrawal requests in the clearing queue.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => {
                      const userObj = users.find((u) => u.id === w.user_id);
                      return (
                        <tr key={w.id}>
                          <td>
                            <div className="font-semibold text-text text-xs">
                              {userObj?.full_name || "Unknown User"}
                            </div>
                            <div className="text-[10px] text-text-faint font-mono truncate max-w-[140px]">
                              {userObj?.email}
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-xs font-bold text-text num">
                              {w.amount}
                            </span>{" "}
                            <span className="text-accent font-semibold text-xs">
                              {w.currency}
                            </span>
                          </td>
                          <td className="font-mono text-xs text-text-faint max-w-[150px] truncate" title={w.wallet_address}>
                            {w.wallet_address || "—"}
                          </td>
                          <td>
                            <span className="badge badge-warning text-[10px] uppercase font-mono">
                              {w.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => setCompletingWithdrawal(w.id)}
                                disabled={actionLoading}
                                className="btn btn-secondary btn-sm text-success hover:bg-success/15 px-2.5 py-1"
                                title="Process Settlement & Input TXID"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingItem({ type: "withdrawal", id: w.id })}
                                disabled={actionLoading}
                                className="btn btn-secondary btn-sm text-danger hover:bg-danger/15 px-2.5 py-1"
                                title="Reject Withdrawal"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Balance Adjustment Form --- */}
        {activeTab === "adjust" && (
          <form onSubmit={handleManualAdjustmentSubmit} className="max-w-xl mx-auto space-y-4 pt-2">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-text">Direct Manual Balance Ledger Adjustment</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Apply audited manual credits or debits directly to an account custodial wallet balance.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Target User Account *</label>
              <select
                value={adjUserId}
                onChange={(e) => setAdjUserId(e.target.value)}
                className="select"
                required
                disabled={actionLoading}
              >
                <option value="">-- Choose Account --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Asset Currency</label>
                <select
                  value={adjCurrency}
                  onChange={(e) => setAdjCurrency(e.target.value)}
                  className="select"
                  disabled={actionLoading}
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="select"
                  disabled={actionLoading}
                >
                  <option value="credit">Credit Balance (+)</option>
                  <option value="debit">Debit Balance (-)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Adjustment Amount *</label>
              <input
                type="number"
                step="any"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                placeholder="0.05"
                className="input font-mono font-semibold"
                required
                disabled={actionLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Audit Memo / Description</label>
              <textarea
                value={adjDescription}
                onChange={(e) => setAdjDescription(e.target.value)}
                placeholder="Document reason for ledger adjustment (e.g. manual wire clearance, bonus grant)..."
                className="textarea min-h-[90px]"
                disabled={actionLoading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="btn btn-primary w-full justify-center py-2.5 text-xs font-bold"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Executing Ledger Transaction...
                  </>
                ) : (
                  "Execute Balance Adjustment"
                )}
              </button>
            </div>
          </form>
        )}

        {/* --- Account Suspensions Grid --- */}
        {activeTab === "suspensions" && (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>KYC Status</th>
                    <th>Account Status</th>
                    <th className="text-right">Risk Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-semibold text-text text-xs">{u.full_name}</div>
                        <div className="text-[10px] text-text-faint font-mono">{u.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge text-[10px] uppercase font-mono ${
                            u.kyc_status === "verified"
                              ? "badge-success"
                              : u.kyc_status === "pending"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {u.kyc_status || "unverified"}
                        </span>
                      </td>
                      <td>
                        {u.is_suspended ? (
                          <span className="badge badge-danger text-[10px] uppercase font-mono">
                            Suspended
                          </span>
                        ) : (
                          <span className="badge badge-success text-[10px] uppercase font-mono">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        {u.is_suspended ? (
                          <button
                            type="button"
                            onClick={() => handleUnsuspend(u.id, u.full_name)}
                            disabled={actionLoading}
                            className="btn btn-secondary btn-sm text-success hover:bg-success/15 px-2.5 py-1 text-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            <span>Activate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSuspendingUser({ id: u.id, name: u.full_name })}
                            disabled={actionLoading || u.id === useAuthStore.getState().user?.id}
                            className="btn btn-secondary btn-sm text-danger hover:bg-danger/15 px-2.5 py-1 text-xs disabled:opacity-30"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal Reason Form */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="panel p-6 max-w-md w-full space-y-5 border border-border shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text">Provide Rejection Reason</h3>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="btn btn-ghost p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Reason for rejection (sent to applicant)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify clear compliance or technical reason for this rejection..."
                  className="textarea min-h-[100px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="btn btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (rejectingItem.type === "deposit")
                      handleVerifyDeposit(rejectingItem.id, "rejected", rejectionReason);
                    else if (rejectingItem.type === "withdrawal")
                      handleProcessWithdrawal(rejectingItem.id, "rejected", undefined, rejectionReason);
                    else if (rejectingItem.type === "kyc")
                      handleKycDecision(rejectingItem.id, "rejected", rejectionReason);
                  }}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="btn btn-primary bg-danger hover:bg-danger/90 border-danger text-xs px-4 py-2"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Withdrawal with TXID Modal */}
      {completingWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="panel p-6 max-w-md w-full space-y-5 border border-border shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text">Enter Settlement TXID</h3>
              <button
                type="button"
                onClick={() => setCompletingWithdrawal(null)}
                className="btn btn-ghost p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Blockchain Transaction ID (TXID)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste on-chain transaction hash"
                  className="input font-mono text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingWithdrawal(null)}
                  className="btn btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleProcessWithdrawal(completingWithdrawal, "completed", txHash)
                  }
                  disabled={!txHash.trim() || actionLoading}
                  className="btn btn-primary text-xs px-4 py-2"
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Confirmation Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="panel p-6 max-w-md w-full space-y-5 border border-border shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text">Suspend Account</h3>
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="btn btn-ghost p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleToggleSuspension} className="space-y-4">
              <div className="alert alert-danger text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-danger" />
                <div>
                  Warning: Suspending <strong>{suspendingUser.name}</strong> will terminate all active JWT login sessions and freeze contract execution immediately.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Reason for Suspension *
                </label>
                <input
                  type="text"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Compliance audit flag, risk threshold breached"
                  className="input"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="btn btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !suspensionReason.trim()}
                  className="btn btn-primary bg-danger hover:bg-danger/90 border-danger text-xs px-4 py-2"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
