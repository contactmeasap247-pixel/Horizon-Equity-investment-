"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
  Repeat,
  Send,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";

interface WithdrawalItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  wallet_address: string;
  wallet_type: string;
  status: string;
  rejection_reason?: string;
  transaction_hash?: string;
  created_at: string;
  processed_at?: string;
}

interface InvestmentPlanItem {
  id: string;
  name: string;
  min_amount: number;
  max_amount?: number;
  return_percentage: number;
  duration_days: number;
  is_active: boolean;
}

export default function AdminWithdrawalsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [plans, setPlans] = useState<InvestmentPlanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Processing & TXID Modal
  const [completingItem, setCompletingItem] = useState<WithdrawalItem | null>(null);
  const [txHash, setTxHash] = useState("");

  // Rejection Modal
  const [rejectingItem, setRejectingItem] = useState<WithdrawalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Reinvestment Modal (Distinct Phase 6 Action)
  const [reinvestItem, setReinvestItem] = useState<WithdrawalItem | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", limit.toString());
      params.append("offset", (page * limit).toString());

      const res = await api.get(`/admin/withdrawals?${params.toString()}`);
      setWithdrawals(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load withdrawal requests from database.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search, page]);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/admin/investments/plans");
      setPlans(res.data);
      if (res.data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(res.data[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchPlans();
  }, [fetchWithdrawals]);

  const handleSetProcessing = async (item: WithdrawalItem) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/withdrawals/${item.id}/process`, {
        status: "processing",
      });
      setFeedback({ type: "success", msg: "Withdrawal marked as processing." });
      fetchWithdrawals();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWithdrawal = async () => {
    if (!completingItem || !txHash.trim()) {
      setFeedback({ type: "error", msg: "Valid blockchain transaction hash (TXID) is required." });
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/withdrawals/${completingItem.id}/process`, {
        status: "completed",
        transaction_hash: txHash.trim(),
      });
      setFeedback({
        type: "success",
        msg: `Withdrawal of ${completingItem.amount} ${completingItem.currency} finalized with TXID.`,
      });
      setCompletingItem(null);
      setTxHash("");
      fetchWithdrawals();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectWithdrawal = async () => {
    if (!rejectingItem || !rejectionReason.trim()) {
      setFeedback({ type: "error", msg: "Please specify a rejection reason." });
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/withdrawals/${rejectingItem.id}/process`, {
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
      });
      setFeedback({
        type: "success",
        msg: `Withdrawal declined and frozen funds returned to user's available balance.`,
      });
      setRejectingItem(null);
      setRejectionReason("");
      fetchWithdrawals();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinvest = async () => {
    if (!reinvestItem || !selectedPlanId) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/admin/withdrawals/${reinvestItem.id}/reinvest`, {
        plan_id: selectedPlanId,
      });
      setFeedback({
        type: "success",
        msg: res.data.message || `Successfully reinvested funds into the selected portfolio.`,
      });
      setReinvestItem(null);
      fetchWithdrawals();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Reinvestment failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const chosenPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#F59E0B]">
              Custody Outflows & Settlements
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Withdrawal Requests</h1>
          <p className="text-xs text-[#7D8998]">
            Authorize outbound blockchain transactions, record TXIDs, decline invalid requests, or execute reinvestments.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWithdrawals}
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by user email, address, or TXID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-[#7D8998] shrink-0" />
          {["all", "pending", "processing", "completed", "rejected", "reinvested"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`px-2.5 py-1.5 text-xs rounded-lg capitalize font-medium transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-[#4388F5] text-white"
                  : "bg-[#0B0F14] text-[#7D8998] border border-white/10 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-[#7D8998] text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
            <span>Querying withdrawal records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No withdrawal requests found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">Investor</th>
                  <th className="p-3.5 font-medium">Amount</th>
                  <th className="p-3.5 font-medium">Destination Address</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium">Request Date</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#F5F7FA]">{w.user_name}</div>
                      <div className="text-[11px] text-[#7D8998] font-mono">{w.user_email}</div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-sm font-bold text-[#F59E0B]">
                        -{w.amount} {w.currency}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] max-w-xs">
                      <div className="text-[#E2E8F0] truncate" title={w.wallet_address}>
                        {w.wallet_address}
                      </div>
                      {w.transaction_hash && (
                        <div className="text-[#4388F5] truncate mt-0.5" title={w.transaction_hash}>
                          TXID: {w.transaction_hash}
                        </div>
                      )}
                      {w.rejection_reason && (
                        <div className="text-[#F06464] truncate mt-0.5" title={w.rejection_reason}>
                          Note: {w.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          w.status === "completed"
                            ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30"
                            : w.status === "rejected"
                            ? "bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30"
                            : w.status === "reinvested"
                            ? "bg-[#4388F5]/10 text-[#4388F5] border border-[#4388F5]/30"
                            : w.status === "processing"
                            ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 animate-pulse"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(w.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {w.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSetProcessing(w)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-medium text-[11px] hover:bg-[#38BDF8] hover:text-black transition-all"
                            title="Approve for Processing"
                          >
                            Process
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompletingItem(w)}
                            className="px-2.5 py-1 rounded bg-[#27C58B] text-black font-semibold text-[11px] hover:bg-[#27C58B]/90 transition-all"
                            title="Complete with Blockchain Hash"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => setReinvestItem(w)}
                            className="px-2.5 py-1 rounded bg-[#4388F5]/10 text-[#4388F5] border border-[#4388F5]/30 font-medium text-[11px] hover:bg-[#4388F5] hover:text-white transition-all"
                            title="Distinct Reinvest Workflow"
                          >
                            Reinvest
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingItem(w)}
                            className="px-2.5 py-1 rounded bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30 text-[11px] hover:bg-[#F06464] hover:text-white transition-all"
                            title="Decline and Refund Balance"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {w.status === "processing" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCompletingItem(w)}
                            className="px-2.5 py-1 rounded bg-[#27C58B] text-black font-semibold text-[11px] hover:bg-[#27C58B]/90 transition-all"
                            title="Enter TXID to Complete"
                          >
                            Dispatch (TXID)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingItem(w)}
                            className="px-2.5 py-1 rounded bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30 text-[11px] hover:bg-[#F06464] hover:text-white transition-all"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {w.status === "completed" && (
                        <span className="text-[11px] text-[#27C58B] font-mono">Dispatched</span>
                      )}
                      {w.status === "rejected" && (
                        <span className="text-[11px] text-[#F06464] font-mono">Declined</span>
                      )}
                      {w.status === "reinvested" && (
                        <span className="text-[11px] text-[#4388F5] font-mono">Reinvested</span>
                      )}
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
            Showing {withdrawals.length} of {total} withdrawal requests
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

      {/* COMPLETION MODAL WITH MANDATORY TXID */}
      {completingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#27C58B]" />
                <h3 className="text-sm font-bold text-white">Finalize Outbound Withdrawal</h3>
              </div>
              <button type="button" onClick={() => setCompletingItem(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-[#7D8998]">
                <span>Recipient:</span>
                <span className="text-white">{completingItem.user_name}</span>
              </div>
              <div className="flex justify-between text-[#7D8998]">
                <span>Amount:</span>
                <span className="text-[#27C58B] font-bold">
                  {completingItem.amount} {completingItem.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#7D8998]">
                <span>Destination Address:</span>
                <span className="text-white truncate max-w-[200px]" title={completingItem.wallet_address}>
                  {completingItem.wallet_address}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[#7D8998] block">Blockchain Transaction Hash (TXID) *Required:</label>
              <input
                type="text"
                placeholder="e.g. 0x4f8a9e... or 5KzL9p..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#27C58B]"
                required
              />
              <p className="text-[11px] text-[#7D8998]">
                Completing will deduct the frozen funds, create a completed withdrawal ledger entry, and notify the user.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteWithdrawal}
                disabled={actionLoading || !txHash.trim()}
                className="px-4 py-2 rounded-lg bg-[#27C58B] text-black font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Blockchain Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / DECLINE MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-[#F06464]" />
                <h3 className="text-sm font-bold text-white">Decline Withdrawal Request</h3>
              </div>
              <button type="button" onClick={() => setRejectingItem(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#7D8998]">
              Declining this request will atomically unfreeze and refund{" "}
              <span className="text-white font-semibold">
                {rejectingItem.amount} {rejectingItem.currency}
              </span>{" "}
              back into the investor&apos;s available wallet balance.
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-[#7D8998] block">Reason for Rejection *Required:</label>
              <textarea
                placeholder="Specify compliance rationale, incorrect address format, etc..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F06464] h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectWithdrawal}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-[#F06464] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Decline & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISTINCT REINVESTMENT WORKFLOW MODAL (PHASE 6) */}
      {reinvestItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-white/10 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#4388F5]/10 text-[#4388F5]">
                  <Repeat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reinvest Withdrawal Capital</h3>
                  <p className="text-xs text-[#7D8998]">Allocate pending withdrawal into an active investment tier</p>
                </div>
              </div>
              <button type="button" onClick={() => setReinvestItem(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F14] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-[#7D8998]">
                <span>Investor:</span>
                <span className="text-white font-semibold">{reinvestItem.user_name}</span>
              </div>
              <div className="flex justify-between text-[#7D8998]">
                <span>Reinvestment Capital:</span>
                <span className="text-[#27C58B] font-mono font-bold text-sm">
                  {reinvestItem.amount} {reinvestItem.currency}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-[#7D8998] block">Select Destination Investment Plan:</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#4388F5]"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.return_percentage}% Return ({p.duration_days} Days) [Min: {p.min_amount}]
                  </option>
                ))}
              </select>

              {/* Integrity & Return Preview */}
              {chosenPlan && (
                <div className="p-4 rounded-xl bg-[#151F2B] border border-[#4388F5]/30 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#7D8998]">
                    <span>Portfolio Plan:</span>
                    <span className="text-white font-bold">{chosenPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-[#7D8998]">
                    <span>Contract Duration:</span>
                    <span className="text-white">{chosenPlan.duration_days} Days</span>
                  </div>
                  <div className="flex justify-between text-[#7D8998]">
                    <span>Expected ROI:</span>
                    <span className="text-[#27C58B]">+{chosenPlan.return_percentage}%</span>
                  </div>
                  <div className="flex justify-between text-[#7D8998] pt-2 border-t border-white/10">
                    <span>Estimated Matured Return:</span>
                    <span className="text-[#4388F5] font-bold text-sm">
                      {(reinvestItem.amount * (1 + chosenPlan.return_percentage / 100)).toFixed(6)}{" "}
                      {reinvestItem.currency}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-[#7D8998] leading-relaxed">
                By executing reinvestment, the withdrawal request status will be updated to{" "}
                <span className="text-white font-mono">&quot;reinvested&quot;</span>, the frozen balance will be converted
                into an active investment contract, and an auditable ledger record will be generated.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setReinvestItem(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReinvest}
                disabled={actionLoading || !selectedPlanId}
                className="px-4 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Reinvestment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
