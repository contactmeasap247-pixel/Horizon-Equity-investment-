"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
  Copy,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";

interface DepositItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  wallet_address: string;
  transaction_hash: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  verified_at?: string;
}

export default function AdminDepositsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Verification / Rejection Modal
  const [reviewItem, setReviewItem] = useState<{
    item: DepositItem;
    action: "verified" | "rejected";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", limit.toString());
      params.append("offset", (page * limit).toString());

      const res = await api.get(`/admin/deposits?${params.toString()}`);
      setDeposits(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load deposit requests from database.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleProcessDeposit = async () => {
    if (!reviewItem) return;
    if (reviewItem.action === "rejected" && !rejectionReason.trim()) {
      setFeedback({ type: "error", msg: "Please provide a valid rejection reason." });
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/deposits/${reviewItem.item.id}/verify`, {
        status: reviewItem.action,
        rejection_reason: reviewItem.action === "rejected" ? rejectionReason.trim() : undefined,
      });

      setFeedback({
        type: "success",
        msg:
          reviewItem.action === "verified"
            ? `Deposit of ${reviewItem.item.amount} ${reviewItem.item.currency} verified and credited to user wallet.`
            : `Deposit marked as rejected.`,
      });
      setReviewItem(null);
      setRejectionReason("");
      fetchDeposits();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Action failed." });
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
            <ArrowDownLeft className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Custody Inflows
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Deposits Management</h1>
          <p className="text-xs text-[#7D8998]">
            Review incoming cryptocurrency deposit requests, verify on-chain hashes, and credit verified capital.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDeposits}
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
            placeholder="Search by user email, TXID, or address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-[#7D8998]" />
          <span className="text-xs text-[#7D8998]">Status:</span>
          {["all", "pending", "verified", "rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition-all ${
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
            <span>Querying deposit ledger...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : deposits.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No deposit records found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">Investor</th>
                  <th className="p-3.5 font-medium">Amount & Currency</th>
                  <th className="p-3.5 font-medium">Custody Address / Hash</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium">Created Date</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#F5F7FA]">{dep.user_name}</div>
                      <div className="text-[11px] text-[#7D8998] font-mono">{dep.user_email}</div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-sm font-bold text-[#27C58B]">
                        +{dep.amount} {dep.currency}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] max-w-xs">
                      <div className="text-[#E2E8F0] truncate" title={dep.wallet_address}>
                        Addr: {dep.wallet_address || "Platform Custody"}
                      </div>
                      <div className="text-[#4388F5] truncate mt-0.5" title={dep.transaction_hash}>
                        TXID: {dep.transaction_hash || "Unconfirmed"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          dep.status === "verified"
                            ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30"
                            : dep.status === "rejected"
                            ? "bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30"
                            : "bg-[#4388F5]/10 text-[#4388F5] border border-[#4388F5]/30 animate-pulse"
                        }`}
                      >
                        {dep.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(dep.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {dep.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setReviewItem({ item: dep, action: "verified" })}
                            className="px-2.5 py-1 rounded bg-[#27C58B] text-black font-semibold text-[11px] hover:bg-[#27C58B]/90 transition-all"
                          >
                            Verify & Credit
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewItem({ item: dep, action: "rejected" })}
                            className="px-2.5 py-1 rounded bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30 text-[11px] hover:bg-[#F06464] hover:text-white transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#7D8998]">
                          {dep.status === "verified" ? "Verified" : "Rejected"}
                        </span>
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
            Showing {deposits.length} of {total} deposits
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

      {/* VERIFICATION / REJECTION CONFIRMATION MODAL */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  reviewItem.action === "verified"
                    ? "bg-[#27C58B]/10 text-[#27C58B]"
                    : "bg-[#F06464]/10 text-[#F06464]"
                }`}
              >
                {reviewItem.action === "verified" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {reviewItem.action === "verified" ? "Verify & Credit Deposit" : "Reject Deposit Request"}
                </h3>
                <p className="text-xs text-[#7D8998]">
                  Investor: {reviewItem.item.user_name} ({reviewItem.item.user_email})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#7D8998]">
                <span>Amount:</span>
                <span className="text-white font-bold">
                  {reviewItem.item.amount} {reviewItem.item.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#7D8998]">
                <span>Transaction Hash:</span>
                <span className="text-[#4388F5] truncate max-w-[200px]" title={reviewItem.item.transaction_hash}>
                  {reviewItem.item.transaction_hash || "Not provided"}
                </span>
              </div>
            </div>

            {reviewItem.action === "verified" ? (
              <p className="text-xs text-[#7D8998]">
                Confirming this deposit will atomically increment the user&apos;s available{" "}
                <span className="text-white font-semibold">{reviewItem.item.currency}</span> wallet balance and record
                an immutable transaction ledger record.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <label className="text-[#7D8998] block">Reason for Rejection (Required):</label>
                <textarea
                  placeholder="e.g. Unconfirmed transaction hash on blockchain explorer, insufficient network fee..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#F06464] h-20"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessDeposit}
                disabled={actionLoading || (reviewItem.action === "rejected" && !rejectionReason.trim())}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 text-white disabled:opacity-50 ${
                  reviewItem.action === "verified" ? "bg-[#27C58B] text-black" : "bg-[#F06464]"
                }`}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {reviewItem.action === "verified" ? "Confirm & Credit Wallet" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
