"use client";

import { useEffect, useState, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Share2,
  Repeat,
  Sliders,
} from "lucide-react";
import { api } from "@/lib/api";

interface TransactionItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  type: string;
  subtype?: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  reference: string;
  description?: string;
  created_at: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 25;

  // Selected Transaction Modal
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", limit.toString());
      params.append("offset", (page * limit).toString());

      const res = await api.get(`/admin/transactions?${params.toString()}`);
      setTransactions(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load transactions ledger from database.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-[#27C58B]" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-[#F59E0B]" />;
      case "investment":
      case "return":
        return <TrendingUp className="h-4 w-4 text-[#4388F5]" />;
      case "reinvestment":
        return <Repeat className="h-4 w-4 text-[#38BDF8]" />;
      case "referral_bonus":
        return <Share2 className="h-4 w-4 text-[#A78BFA]" />;
      case "adjustment":
        return <Sliders className="h-4 w-4 text-[#F43F5E]" />;
      default:
        return <History className="h-4 w-4 text-[#7D8998]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Authoritative Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Platform Transactions</h1>
          <p className="text-xs text-[#7D8998]">
            Full immutable ledger of all deposits, withdrawals, investments, returns, adjustments, and referrals.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by user email, name, reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7D8998]">
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4388F5]"
            >
              <option value="all">All Categories</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="investment">Investment Allocation</option>
              <option value="return">Contract Return</option>
              <option value="reinvestment">Reinvestment</option>
              <option value="referral_bonus">Referral Reward</option>
              <option value="adjustment">Manual Adjustment</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#7D8998]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="bg-[#0B0F14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4388F5]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed / Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-[#7D8998] text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
            <span>Scanning transaction ledger...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No transactions match the selected filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">Type</th>
                  <th className="p-3.5 font-medium">Reference</th>
                  <th className="p-3.5 font-medium">Investor</th>
                  <th className="p-3.5 font-medium">Amount</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium">Timestamp</th>
                  <th className="p-3.5 font-medium text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 font-medium capitalize text-white">
                        <div className="p-1.5 rounded-md bg-[#0B0F14] border border-white/10">
                          {getTypeIcon(tx.type)}
                        </div>
                        <span>{tx.type.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#4388F5]">
                      {tx.reference}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#F5F7FA]">{tx.user_name}</div>
                      <div className="text-[11px] text-[#7D8998] font-mono">{tx.user_email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span
                        className={`font-bold ${
                          tx.amount > 0 ? "text-[#27C58B]" : tx.amount < 0 ? "text-[#F06464]" : "text-white"
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} {tx.currency}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tx.status === "completed"
                            ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30"
                            : tx.status === "failed"
                            ? "bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded bg-[#151F2B] hover:bg-[#4388F5] hover:text-white text-[#4388F5] transition-all font-medium text-[11px]"
                      >
                        Inspect
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
            Showing {transactions.length} of {total} records
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

      {/* TRANSACTION INSPECTION MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">Ledger Entry Audit</h3>
              </div>
              <button type="button" onClick={() => setSelectedTx(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F14] border border-white/5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Reference:</span>
                <span className="text-[#4388F5] font-bold">{selectedTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Category Type:</span>
                <span className="text-white capitalize">{selectedTx.type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Investor:</span>
                <span className="text-white">{selectedTx.user_name} ({selectedTx.user_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Amount & Asset:</span>
                <span className={selectedTx.amount >= 0 ? "text-[#27C58B] font-bold" : "text-[#F06464] font-bold"}>
                  {selectedTx.amount} {selectedTx.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Ledger Status:</span>
                <span className="text-white uppercase">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Timestamp:</span>
                <span className="text-[#7D8998]">{new Date(selectedTx.created_at).toLocaleString()}</span>
              </div>
            </div>

            {selectedTx.description && (
              <div className="space-y-1 text-xs">
                <span className="text-[#7D8998]">Description & Notes:</span>
                <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 text-[#E2E8F0]">
                  {selectedTx.description}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-xs text-[#7D8998] hover:text-white"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
