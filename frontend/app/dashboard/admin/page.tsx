"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Wallet,
  CheckCircle,
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
      setUsers(usersRes.data);
      setDeposits(depositsRes.data);
      setWithdrawals(withdrawalsRes.data);
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
      setFeedbackError("Please populate both Target User and Amount fields.");
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
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
      </div>
    );
  }

  const kycPendingUsers = users.filter((u) => u.kyc_status === "pending");

  return (
    <div className="flex flex-col gap-8 stagger-1 animate-slide-up">
      {/* Platform Analytics metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card flex flex-col gap-2">
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Users className="h-4 w-4" /> Total Users
            </span>
            <span className="text-2xl font-extrabold mt-1 text-white">{stats.total_users}</span>
            <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
              {stats.suspended_users} Suspended Account{stats.suspended_users !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="stat-card flex flex-col gap-2">
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <FileText className="h-4 w-4 text-gold-300" /> KYC Approvals
            </span>
            <span className={`text-2xl font-extrabold mt-1 ${stats.kyc_pending > 0 ? "text-gold-300 animate-pulse" : "text-white"}`}>
              {stats.kyc_pending} Pending
            </span>
            <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
              Identity queues awaiting
            </span>
          </div>

          <div className="stat-card flex flex-col gap-2">
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Yield Contracts
            </span>
            <span className="text-2xl font-extrabold mt-1 text-white">{stats.active_investments_count}</span>
            <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
              Active plan purchases
            </span>
          </div>

          <div className="stat-card flex flex-col gap-2">
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Pending Approvals
            </span>
            <span className="text-2xl font-extrabold mt-1 text-white">
              {stats.pending_deposits_count + stats.pending_withdrawals_count}
            </span>
            <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
              {stats.pending_deposits_count} Dep / {stats.pending_withdrawals_count} Wdr
            </span>
          </div>
        </div>
      )}

      {/* Action Tabs Controls */}
      <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-6">
        <div className="flex border-b border-white/5 pb-1 overflow-x-auto gap-2">
          <button
            onClick={() => { setActiveTab("kyc"); setFeedbackError(null); setFeedbackSuccess(null); }}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === "kyc" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            KYC Verifications ({kycPendingUsers.length})
          </button>
          <button
            onClick={() => { setActiveTab("deposits"); setFeedbackError(null); setFeedbackSuccess(null); }}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === "deposits" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Verify Deposits ({deposits.length})
          </button>
          <button
            onClick={() => { setActiveTab("withdrawals"); setFeedbackError(null); setFeedbackSuccess(null); }}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === "withdrawals" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Verify Withdrawals ({withdrawals.length})
          </button>
          <button
            onClick={() => { setActiveTab("adjust"); setFeedbackError(null); setFeedbackSuccess(null); }}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === "adjust" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Manual Adjustments
          </button>
          <button
            onClick={() => { setActiveTab("suspensions"); setFeedbackError(null); setFeedbackSuccess(null); }}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === "suspensions" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Account Suspensions
          </button>
        </div>

        {/* Global Feedback banners */}
        {feedbackError && (
          <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* --- KYC List tab --- */}
        {activeTab === "kyc" && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Signup Date</th>
                  <th>Doc Submission Status</th>
                  <th className="text-right">Decisions</th>
                </tr>
              </thead>
              <tbody>
                {kycPendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-text-muted">
                      No pending KYC verification requests.
                    </td>
                  </tr>
                ) : (
                  kycPendingUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="flex flex-col">
                        <span className="font-bold text-xs text-white">{u.full_name}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">{u.email}</span>
                      </td>
                      <td className="text-text-secondary text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge badge-warning uppercase text-[8px] py-0.5 px-2">
                          Pending Approval
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleKycDecision(u.id, "verified")}
                            disabled={actionLoading}
                            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-[#00d4aa] rounded border border-green-500/20"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setRejectingItem({ type: "kyc", id: u.id })}
                            disabled={actionLoading}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] rounded border border-red-500/20"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Deposits Approval list --- */}
        {activeTab === "deposits" && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Amount</th>
                  <th>Block Tx Hash</th>
                  <th>Receiver Address</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-text-muted">
                      No pending deposit verification queues.
                    </td>
                  </tr>
                ) : (
                  deposits.map((dep) => {
                    const userObj = users.find((u) => u.id === dep.user_id);
                    return (
                      <tr key={dep.id}>
                        <td className="flex flex-col">
                          <span className="font-bold text-xs text-white">{userObj?.full_name || "Unknown User"}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 truncate max-w-[140px]">{userObj?.email}</span>
                        </td>
                        <td className="font-bold text-white whitespace-nowrap">
                          {dep.amount} <span className="text-gold-300 font-semibold">{dep.currency}</span>
                        </td>
                        <td className="font-mono text-xs text-text-muted max-w-[120px] truncate" title={dep.transaction_hash}>
                          {dep.transaction_hash}
                        </td>
                        <td className="font-mono text-xs text-text-muted max-w-[120px] truncate" title={dep.wallet_address}>
                          {dep.wallet_address}
                        </td>
                        <td>
                          <span className="badge badge-warning uppercase text-[8px] py-0.5 px-2">
                            {dep.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleVerifyDeposit(dep.id, "verified")}
                              disabled={actionLoading}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-[#00d4aa] rounded border border-green-500/20"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejectingItem({ type: "deposit", id: dep.id })}
                              disabled={actionLoading}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] rounded border border-red-500/20"
                            >
                              <XCircle className="h-4 w-4" />
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
        )}

        {/* --- Withdrawals Approval list --- */}
        {activeTab === "withdrawals" && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Amount</th>
                  <th>Destination Address</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-text-muted">
                      No pending withdrawal processing queues.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const userObj = users.find((u) => u.id === w.user_id);
                    return (
                      <tr key={w.id}>
                        <td className="flex flex-col">
                          <span className="font-bold text-xs text-white">{userObj?.full_name || "Unknown User"}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 truncate max-w-[140px]">{userObj?.email}</span>
                        </td>
                        <td className="font-bold text-white whitespace-nowrap">
                          {w.amount} <span className="text-gold-300 font-semibold">{w.currency}</span>
                        </td>
                        <td className="font-mono text-xs text-text-muted max-w-[150px] truncate" title={w.wallet_address}>
                          {w.wallet_address}
                        </td>
                        <td>
                          <span className="badge badge-warning uppercase text-[8px] py-0.5 px-2">
                            {w.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setCompletingWithdrawal(w.id)}
                              disabled={actionLoading}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-[#00d4aa] rounded border border-green-500/20"
                              title="Process & Provide TXID"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejectingItem({ type: "withdrawal", id: w.id })}
                              disabled={actionLoading}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] rounded border border-red-500/20"
                            >
                              <XCircle className="h-4 w-4" />
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
        )}

        {/* --- Balance Adjustment Form --- */}
        {activeTab === "adjust" && (
          <form onSubmit={handleManualAdjustmentSubmit} className="flex flex-col gap-4 max-w-xl mx-auto w-full pt-4">
            <h4 className="font-extrabold text-sm text-white border-b border-white/5 pb-2">Manual Ledger adjustment</h4>

            {/* Target User */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Select User Account</label>
              <select
                value={adjUserId}
                onChange={(e) => setAdjUserId(e.target.value)}
                className="input bg-[#0D2D4A] border-white/5"
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

            {/* Currency selector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Asset Currency</label>
                <select
                  value={adjCurrency}
                  onChange={(e) => setAdjCurrency(e.target.value)}
                  className="input bg-[#0D2D4A] border-white/5"
                  disabled={actionLoading}
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="input-label">Adjustment Direction</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="input bg-[#0D2D4A] border-white/5"
                  disabled={actionLoading}
                >
                  <option value="credit">Credit Balance (+)</option>
                  <option value="debit">Debit Balance (-)</option>
                </select>
              </div>
            </div>

            {/* Amount input */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Adjustment Amount</label>
              <input
                type="number"
                step="any"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                placeholder="0.05"
                className="input font-semibold"
                required
                disabled={actionLoading}
              />
            </div>

            {/* Description reason */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Reason / Memo</label>
              <textarea
                value={adjDescription}
                onChange={(e) => setAdjDescription(e.target.value)}
                placeholder="Details of this ledger adjustment..."
                className="input min-h-[80px]"
                disabled={actionLoading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-3 disabled:opacity-50"
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Adjustment"}
            </button>
          </form>
        )}

        {/* --- Account Suspensions grid --- */}
        {activeTab === "suspensions" && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>KYC status</th>
                  <th>Account Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="flex flex-col">
                      <span className="font-bold text-xs text-white">{u.full_name}</span>
                      <span className="text-[10px] text-text-muted mt-0.5">{u.email}</span>
                    </td>
                    <td>
                      <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                        u.kyc_status === "verified" ? "badge-success" : u.kyc_status === "pending" ? "badge-warning" : "badge-danger"
                      }`}>
                        {u.kyc_status || "unverified"}
                      </span>
                    </td>
                    <td>
                      {u.is_suspended ? (
                        <span className="badge badge-danger uppercase text-[8px] py-0.5 px-2">
                          Suspended
                        </span>
                      ) : (
                        <span className="badge badge-success uppercase text-[8px] py-0.5 px-2">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {u.is_suspended ? (
                        <button
                          onClick={() => handleUnunsuspend(u.id, u.full_name)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-[#00d4aa] rounded text-xs font-semibold border border-green-500/20 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="h-4 w-4" /> Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendingUser({ id: u.id, name: u.full_name })}
                          disabled={actionLoading || u.id === (useAuthStore.getState().user?.id)} // Prevent self-lockout
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] rounded text-xs font-semibold border border-red-500/20 inline-flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
                        >
                          <UserX className="h-4 w-4" /> Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal Reason Form */}
      {rejectingItem && (
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-6 border-white/10 max-w-[420px]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">Provide Rejection Reason</h3>
              <button onClick={() => setRejectingItem(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejecting this request..."
                className="input min-h-[90px]"
                required
              />

              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 hover:bg-white/5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (rejectingItem.type === "deposit") handleVerifyDeposit(rejectingItem.id, "rejected", rejectionReason);
                    else if (rejectingItem.type === "withdrawal") handleProcessWithdrawal(rejectingItem.id, "rejected", undefined, rejectionReason);
                    else if (rejectingItem.type === "kyc") handleKycDecision(rejectingItem.id, "rejected", rejectionReason);
                  }}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-semibold"
                  disabled={!rejectionReason.trim() || actionLoading}
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
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-6 border-white/10 max-w-[420px]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">Enter Settlement TXID</h3>
              <button onClick={() => setCompletingWithdrawal(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="input-label">Blockchain transaction ID</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste transaction TXID hash"
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setCompletingWithdrawal(null)}
                  className="px-4 py-2 hover:bg-white/5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessWithdrawal(completingWithdrawal, "completed", txHash)}
                  className="px-4 py-2 bg-green-500 text-black hover:bg-green-600 rounded-lg font-semibold"
                  disabled={!txHash.trim() || actionLoading}
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend user confirmation modal */}
      {suspendingUser && (
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-6 border-white/10 max-w-[420px]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">Suspend Account</h3>
              <button onClick={() => setSuspendingUser(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleToggleSuspension} className="flex flex-col gap-4">
              <div className="p-3 bg-danger/10 border border-danger/20 text-[#ff6b6b] rounded-lg text-xs leading-relaxed">
                Warning: Suspending <strong>{suspendingUser.name}</strong> will lock them out of their profile and terminate all active JWT login sessions immediately.
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="input-label">Reason for Suspension</label>
                <input
                  type="text"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Fraudulent activities detected"
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="px-4 py-2 hover:bg-white/5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-semibold"
                  disabled={actionLoading || !suspensionReason.trim()}
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

  // Helper method for unsuspend action in mapping
  function handleUnunsuspend(userId: string, name: string) {
    handleUnsuspend(userId, name);
  }
}
