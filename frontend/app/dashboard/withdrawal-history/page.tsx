"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  ArrowUpRight,
  Copy,
  Check,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCrypto, toNum } from "@/lib/format";

interface WithdrawalRecord {
  id: string;
  amount: number | string;
  currency: string;
  wallet_address: string;
  wallet_type: string;
  status: string;
  rejection_reason?: string;
  transaction_hash?: string;
  created_at: string;
  processed_at?: string;
}

export default function WithdrawalHistoryPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallets/history/withdrawals");
      setWithdrawals(res.data || []);
    } catch (e) {
      console.error("Error loading withdrawal history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = withdrawals.filter((w) => {
    if (statusFilter !== "all" && w.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchHash = w.transaction_hash?.toLowerCase().includes(q);
      const matchCurr = w.currency.toLowerCase().includes(q);
      const matchAddr = w.wallet_address.toLowerCase().includes(q);
      const matchId = w.id.toLowerCase().includes(q);
      const matchType = w.wallet_type.toLowerCase().includes(q);
      return matchHash || matchCurr || matchAddr || matchId || matchType;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading withdrawal records from authoritative database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="h-6 w-6 text-[#F3B94F]" />
            Withdrawal Request History
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Real-time tracking of outbound capital disbursements, compliance review states, and blockchain broadcast TXIDs.
          </p>
        </div>

        <Link
          href="/dashboard/withdrawals"
          className="btn btn-primary btn-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Withdrawal Request</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#111821] p-1 rounded-lg border border-white/10 self-start">
          {["all", "pending", "completed", "rejected"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                statusFilter === tab
                  ? "bg-[#4388F5] text-white shadow-sm"
                  : "text-[#7D8998] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by address, currency, or TXID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 pr-3 py-1.5 text-xs bg-[#111821] border-white/10 text-white placeholder-[#7D8998] h-9"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="panel overflow-hidden border-white/10 bg-[#111821]">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No Withdrawal Records Found</p>
              <p className="text-xs text-[#7D8998] mt-0.5 max-w-sm">
                {statusFilter !== "all"
                  ? `No withdrawal records currently match the "${statusFilter}" filter.`
                  : "You have not submitted any withdrawal requests yet."}
              </p>
            </div>
            <Link href="/dashboard/withdrawals" className="btn btn-secondary btn-sm mt-2">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Submit a Withdrawal</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[#7D8998] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Disbursement Amount</th>
                  <th className="py-3 px-4">Processing Status</th>
                  <th className="py-3 px-4">Destination Address & Network</th>
                  <th className="py-3 px-4">Broadcast Hash (TXID)</th>
                  <th className="py-3 px-4 text-right">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((w) => {
                  const isCompleted = w.status.toLowerCase() === "completed" || w.status.toLowerCase() === "approved";
                  const isPending = w.status.toLowerCase() === "pending";
                  const isRejected = w.status.toLowerCase() === "rejected" || w.status.toLowerCase() === "declined";

                  return (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#F3B94F]">
                            {w.currency}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {formatCrypto(toNum(w.amount))} {w.currency}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-start ${
                              isCompleted
                                ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                                : isPending
                                ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                                : "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : isPending ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span>{w.status}</span>
                          </span>
                          {w.rejection_reason && (
                            <span className="text-[10px] text-[#F06464] flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              {w.rejection_reason}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold text-[#4388F5]">
                            {w.wallet_type || "External"}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E2E8F0] max-w-[200px]">
                            <span className="truncate">{w.wallet_address}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(w.wallet_address, `addr-${w.id}`)}
                              className="p-1 text-[#7D8998] hover:text-white shrink-0"
                              title="Copy Destination"
                            >
                              {copiedId === `addr-${w.id}` ? (
                                <Check className="h-3 w-3 text-[#27C58B]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#7D8998]">
                        {w.transaction_hash ? (
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <span className="truncate text-[#27C58B]">{w.transaction_hash}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(w.transaction_hash!, `tx-${w.id}`)}
                              className="p-1 text-[#7D8998] hover:text-white shrink-0"
                              title="Copy TXID"
                            >
                              {copiedId === `tx-${w.id}` ? (
                                <Check className="h-3 w-3 text-[#27C58B]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#7D8998] italic text-[11px]">Awaiting Dispatch</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right text-[#7D8998] text-[11px]">
                        <div>{new Date(w.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-[#556376]">
                          {new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
