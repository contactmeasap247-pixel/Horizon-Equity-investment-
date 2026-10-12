"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  PlusCircle,
  MinusCircle,
  X,
  Shield,
  Wallet,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  History,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";

interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  kyc_status: string;
  created_at: string;
  last_login?: string;
  balances: Record<string, number>;
  referral_count: number;
  referral_earnings: number;
}

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  btc_wallet?: string;
  usdt_wallet?: string;
  eth_wallet?: string;
  sol_wallet?: string;
  email_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  kyc_status: string;
  kyc_documents?: Record<string, unknown>;
  created_at: string;
  last_login?: string;
  login_ip?: string;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  wallets: Array<{
    id: string;
    currency: string;
    balance: number;
    frozen_balance: number;
    total_deposited: number;
    total_withdrawn: number;
  }>;
  active_investments: Array<{
    id: string;
    plan_name: string;
    amount: number;
    currency: string;
    expected_return: number;
    status: string;
    start_date: string;
    maturity_date: string;
    remaining_seconds: number;
  }>;
  deposit_history: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    transaction_hash?: string;
    created_at: string;
  }>;
  withdrawal_history: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    rejection_reason?: string;
    created_at: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    reference: string;
    description?: string;
    created_at: string;
  }>;
  audit_events: Array<{
    id: string;
    action: string;
    entity_type?: string;
    ip_address?: string;
    created_at: string;
  }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Selected User Drilldown
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modals & Action States
  const [editUserModal, setEditUserModal] = useState<UserDetail | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    country: "",
    city: "",
    address: "",
  });

  const [suspensionModal, setSuspendingModal] = useState<UserSummary | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const [adjustmentModal, setAdjustmentModal] = useState<{
    user: UserSummary | UserDetail;
    currency: string;
    amount: string;
    type: "credit" | "debit";
    description: string;
  } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("account_status", statusFilter);
      if (kycFilter !== "all") params.append("kyc_status", kycFilter);
      params.append("limit", limit.toString());
      params.append("offset", (page * limit).toString());

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load user directory.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, kycFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loadUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setIsLoadingDetail(true);
    try {
      const res = await api.get(`/admin/users/${userId}/detail`);
      setSelectedUserDetail(res.data);
    } catch {
      setFeedback({ type: "error", msg: "Failed to load full user drilldown details." });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${editUserModal.id}`, editFormData);
      setFeedback({ type: "success", msg: "User profile updated successfully." });
      setEditUserModal(null);
      fetchUsers();
      if (selectedUserId === editUserModal.id) {
        loadUserDetail(editUserModal.id);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to update profile." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    if (!suspensionModal) return;
    setActionLoading(true);
    try {
      const targetState = !suspensionModal.is_suspended;
      await api.post(`/admin/users/${suspensionModal.id}/suspend`, {
        is_suspended: targetState,
        suspension_reason: targetState ? suspensionReason : undefined,
      });
      setFeedback({
        type: "success",
        msg: targetState ? "Account suspended successfully." : "Account restored successfully.",
      });
      setSuspendingModal(null);
      setSuspensionReason("");
      fetchUsers();
      if (selectedUserId === suspensionModal.id) {
        loadUserDetail(suspensionModal.id);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteAdjustment = async () => {
    if (!adjustmentModal) return;
    const numAmt = parseFloat(adjustmentModal.amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setFeedback({ type: "error", msg: "Amount must be a positive number." });
      return;
    }
    if (!adjustmentModal.description.trim()) {
      setFeedback({ type: "error", msg: "Please enter a valid administrative reason." });
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/users/${adjustmentModal.user.id}/adjust-balance`, {
        currency: adjustmentModal.currency,
        amount: numAmt,
        adjustment_type: adjustmentModal.type,
        description: adjustmentModal.description.trim(),
      });
      setFeedback({
        type: "success",
        msg: `Successfully ${adjustmentModal.type === "credit" ? "credited" : "debited"} ${numAmt} ${adjustmentModal.currency}.`,
      });
      setAdjustmentModal(null);
      fetchUsers();
      if (selectedUserId === adjustmentModal.user.id) {
        loadUserDetail(adjustmentModal.user.id);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Adjustment failed." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Custody Directory
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">User Management</h1>
          <p className="text-xs text-[#7D8998]">
            Manage platform registered investors, verify identities, execute balance adjustments, and audit profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === "success"
              ? "bg-[#27C58B]/10 border-[#27C58B]/20 text-[#27C58B]"
              : "bg-[#F06464]/10 border-[#F06464]/20 text-[#F06464]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="p-1 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by full name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7D8998]">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4388F5]"
            >
              <option value="all">All Accounts</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* KYC Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7D8998]">
            <span>KYC:</span>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setPage(0);
              }}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4388F5]"
            >
              <option value="all">All KYC</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-[#7D8998] text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
            <span>Loading user records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No user records found matching the active search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">User / Email</th>
                  <th className="p-3.5 font-medium">Account Status</th>
                  <th className="p-3.5 font-medium">KYC Tier</th>
                  <th className="p-3.5 font-medium">Balances</th>
                  <th className="p-3.5 font-medium">Referrals</th>
                  <th className="p-3.5 font-medium">Registered</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#F5F7FA]">{u.full_name}</div>
                      <div className="text-[11px] text-[#7D8998] font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      {u.is_suspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          u.kyc_status === "verified"
                            ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/20"
                            : u.kyc_status === "rejected"
                            ? "bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/20"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                        }`}
                      >
                        {u.kyc_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-[#27C58B]">{u.balances?.USDT || 0} USDT</div>
                      <div className="text-[#7D8998]">{u.balances?.BTC || 0} BTC</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#7D8998]">
                      <div>{u.referral_count} users</div>
                      <div>{u.referral_earnings} USDT</div>
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* View Drilldown */}
                      <button
                        type="button"
                        onClick={() => loadUserDetail(u.id)}
                        className="px-2.5 py-1 rounded bg-[#151F2B] hover:bg-[#4388F5] hover:text-white text-[#4388F5] transition-all font-medium text-[11px]"
                        title="View Full User Dossier"
                      >
                        Details
                      </button>

                      {/* Adjust Funds */}
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustmentModal({
                            user: u,
                            currency: "USDT",
                            amount: "",
                            type: "credit",
                            description: "",
                          })
                        }
                        className="px-2.5 py-1 rounded bg-[#151F2B] hover:bg-[#27C58B] hover:text-white text-[#27C58B] transition-all font-medium text-[11px]"
                        title="Add or Deduct Funds"
                      >
                        Adjust
                      </button>

                      {/* Suspend / Restore */}
                      <button
                        type="button"
                        onClick={() => setSuspendingModal(u)}
                        className={`px-2 py-1 rounded transition-all font-medium text-[11px] ${
                          u.is_suspended
                            ? "bg-[#27C58B]/10 text-[#27C58B] hover:bg-[#27C58B] hover:text-white"
                            : "bg-[#F06464]/10 text-[#F06464] hover:bg-[#F06464] hover:text-white"
                        }`}
                        title={u.is_suspended ? "Restore Account" : "Suspend Account"}
                      >
                        {u.is_suspended ? "Restore" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-white/10 bg-[#0B0F14]/30 flex items-center justify-between text-xs text-[#7D8998]">
          <span>
            Showing {users.length} of {total} registered users
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1 rounded bg-[#151F2B] text-[#F5F7FA] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-white">Page {page + 1}</span>
            <button
              type="button"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-[#151F2B] text-[#F5F7FA] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* USER DRILLDOWN SLIDEOVER / MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#111821] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6">
            {/* Slideover Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#151F2B] border border-white/10 flex items-center justify-center font-bold text-sm text-[#4388F5]">
                  {selectedUserDetail?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F5F7FA]">
                    {selectedUserDetail?.full_name || "User Details"}
                  </h2>
                  <p className="text-xs text-[#7D8998] font-mono">{selectedUserDetail?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserDetail(null);
                }}
                className="p-1.5 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isLoadingDetail || !selectedUserDetail ? (
              <div className="p-16 flex flex-col items-center justify-center gap-2 text-xs text-[#7D8998]">
                <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
                <span>Loading complete user record...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Information & Actions */}
                <div className="bg-[#0B0F14] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                      Account Profile
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditUserModal(selectedUserDetail);
                        setEditFormData({
                          full_name: selectedUserDetail.full_name || "",
                          phone: selectedUserDetail.phone || "",
                          country: selectedUserDetail.country || "",
                          city: selectedUserDetail.city || "",
                          address: selectedUserDetail.address || "",
                        });
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[#151F2B] hover:bg-[#4388F5] text-white transition-all"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#7D8998]">Full Name:</span>
                      <p className="font-semibold text-white">{selectedUserDetail.full_name}</p>
                    </div>
                    <div>
                      <span className="text-[#7D8998]">Email Address:</span>
                      <p className="font-semibold text-white font-mono">{selectedUserDetail.email}</p>
                    </div>
                    <div>
                      <span className="text-[#7D8998]">Phone:</span>
                      <p className="text-white">{selectedUserDetail.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-[#7D8998]">Country / City:</span>
                      <p className="text-white">
                        {selectedUserDetail.country || "Not provided"} {selectedUserDetail.city ? `(${selectedUserDetail.city})` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#7D8998]">Registered:</span>
                      <p className="text-white font-mono">
                        {new Date(selectedUserDetail.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#7D8998]">Last Login / IP:</span>
                      <p className="text-white font-mono">
                        {selectedUserDetail.last_login
                          ? new Date(selectedUserDetail.last_login).toLocaleString()
                          : "Never"}{" "}
                        {selectedUserDetail.login_ip ? `(${selectedUserDetail.login_ip})` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallets & Balances */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                      Wallets & Custody Balances
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustmentModal({
                          user: selectedUserDetail,
                          currency: "USDT",
                          amount: "",
                          type: "credit",
                          description: "",
                        })
                      }
                      className="flex items-center gap-1 text-xs text-[#27C58B] hover:underline"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Perform Adjustment</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedUserDetail.wallets.map((w) => (
                      <div key={w.id} className="p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-white">{w.currency}</span>
                          <span className="text-[#27C58B] font-mono">{w.balance}</span>
                        </div>
                        <div className="text-[10px] text-[#7D8998] mt-1 space-y-0.5">
                          <p>Frozen: {w.frozen_balance}</p>
                          <p>Total Deposited: {w.total_deposited}</p>
                          <p>Total Withdrawn: {w.total_withdrawn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Investments */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                    Investment Portfolios ({selectedUserDetail.active_investments.length})
                  </h3>
                  {selectedUserDetail.active_investments.length === 0 ? (
                    <p className="text-xs text-[#7D8998]">No active investment contracts.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserDetail.active_investments.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{inv.plan_name}</div>
                            <div className="text-[10px] text-[#7D8998]">
                              Principal: {inv.amount} {inv.currency} | Return: {inv.expected_return} {inv.currency}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#27C58B]/10 text-[#27C58B]">
                            {inv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Deposits & Withdrawals */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#F5F7FA]">Deposits ({selectedUserDetail.deposit_history.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px]">
                      {selectedUserDetail.deposit_history.map((d) => (
                        <div key={d.id} className="p-2 rounded bg-[#0B0F14] border border-white/5 flex justify-between">
                          <span>{d.amount} {d.currency}</span>
                          <span className="text-[#27C58B]">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#F5F7FA]">Withdrawals ({selectedUserDetail.withdrawal_history.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px]">
                      {selectedUserDetail.withdrawal_history.map((w) => (
                        <div key={w.id} className="p-2 rounded bg-[#0B0F14] border border-white/5 flex justify-between">
                          <span>{w.amount} {w.currency}</span>
                          <span className={w.status === "completed" ? "text-[#27C58B]" : "text-[#F59E0B]"}>{w.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit & Security Log History */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                    Security & Administrative Audits
                  </h3>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-[11px]">
                    {selectedUserDetail.audit_events.map((a) => (
                      <div key={a.id} className="p-2 rounded bg-[#0B0F14] border border-white/5 flex justify-between text-[#7D8998]">
                        <span className="text-[#F5F7FA]">{a.action}</span>
                        <span className="font-mono">{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Edit User Profile</h3>
              <button type="button" onClick={() => setEditUserModal(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-[#7D8998] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                  required
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#7D8998] block mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[#7D8998] block mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {suspensionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  suspensionModal.is_suspended ? "bg-[#27C58B]/10 text-[#27C58B]" : "bg-[#F06464]/10 text-[#F06464]"
                }`}
              >
                {suspensionModal.is_suspended ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {suspensionModal.is_suspended ? "Restore User Account" : "Suspend User Account"}
                </h3>
                <p className="text-xs text-[#7D8998]">{suspensionModal.full_name} ({suspensionModal.email})</p>
              </div>
            </div>

            {!suspensionModal.is_suspended ? (
              <div className="space-y-2 text-xs">
                <p className="text-[#7D8998]">
                  Suspending this user will immediately revoke all active session tokens and restrict access to the client portal.
                </p>
                <label className="text-[#7D8998] block">Suspension Reason (Required):</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Specify violation or compliance rationale..."
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F06464] h-20"
                />
              </div>
            ) : (
              <p className="text-xs text-[#7D8998]">
                Restoring this account will permit the user to sign back in and resume transactions.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSuspendingModal(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleSuspension}
                disabled={actionLoading || (!suspensionModal.is_suspended && !suspensionReason.trim())}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 text-white disabled:opacity-50 ${
                  suspensionModal.is_suspended ? "bg-[#27C58B]" : "bg-[#F06464]"
                }`}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {suspensionModal.is_suspended ? "Confirm Restore" : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: ADD FUNDS / DEDUCT FUNDS MODAL WITH FINANCIAL INTEGRITY CONFIRMATION */}
      {adjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">Manual Balance Adjustment</h3>
              </div>
              <button type="button" onClick={() => setAdjustmentModal(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-[#7D8998]">
              Target Investor: <span className="text-white font-semibold">{adjustmentModal.user.full_name}</span> (
              <span className="font-mono text-[#4388F5]">{adjustmentModal.user.email}</span>)
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#7D8998] block mb-1">Operation Type</label>
                  <select
                    value={adjustmentModal.type}
                    onChange={(e) =>
                      setAdjustmentModal({ ...adjustmentModal, type: e.target.value as "credit" | "debit" })
                    }
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                  >
                    <option value="credit">Credit (Add Funds)</option>
                    <option value="debit">Debit (Deduct Funds)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#7D8998] block mb-1">Asset Currency</label>
                  <select
                    value={adjustmentModal.currency}
                    onChange={(e) => setAdjustmentModal({ ...adjustmentModal, currency: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                  >
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="SOL">SOL (Solana)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Adjustment Amount</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={adjustmentModal.amount}
                  onChange={(e) => setAdjustmentModal({ ...adjustmentModal, amount: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5] font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Administrative Reason (Required)</label>
                <textarea
                  placeholder="Reason for adjustment, internal reference, or settlement note..."
                  value={adjustmentModal.description}
                  onChange={(e) => setAdjustmentModal({ ...adjustmentModal, description: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5] h-16"
                />
              </div>

              {/* Pre-Confirmation Integrity Summary Box */}
              {adjustmentModal.amount && !isNaN(parseFloat(adjustmentModal.amount)) && (
                <div className="p-3 rounded-lg bg-[#0B0F14] border border-[#4388F5]/30 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[#7D8998]">
                    <span>Current Wallet Balance:</span>
                    <span className="text-white">
                      {("balances" in adjustmentModal.user
                        ? adjustmentModal.user.balances?.[adjustmentModal.currency]
                        : adjustmentModal.user.wallets?.find((w) => w.currency === adjustmentModal.currency)?.balance) || 0}{" "}
                      {adjustmentModal.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#7D8998]">
                    <span>Adjustment:</span>
                    <span className={adjustmentModal.type === "credit" ? "text-[#27C58B]" : "text-[#F06464]"}>
                      {adjustmentModal.type === "credit" ? "+" : "-"}
                      {parseFloat(adjustmentModal.amount)} {adjustmentModal.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                    <span>Resulting Balance:</span>
                    <span className="text-[#4388F5]">
                      {(
                        (("balances" in adjustmentModal.user
                          ? adjustmentModal.user.balances?.[adjustmentModal.currency]
                          : adjustmentModal.user.wallets?.find((w) => w.currency === adjustmentModal.currency)?.balance) || 0) +
                        (adjustmentModal.type === "credit" ? 1 : -1) * parseFloat(adjustmentModal.amount)
                      ).toFixed(6)}{" "}
                      {adjustmentModal.currency}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setAdjustmentModal(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAdjustment}
                disabled={actionLoading || !adjustmentModal.amount || !adjustmentModal.description.trim()}
                className="px-4 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Balance Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
