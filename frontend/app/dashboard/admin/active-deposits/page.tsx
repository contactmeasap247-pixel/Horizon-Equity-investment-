"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  ExternalLink,
  TrendingUp,
  PlayCircle,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

interface ActiveInvestment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  expected_return: number;
  return_percentage: number;
  duration_days: number;
  start_date: string;
  maturity_date: string;
  remaining_seconds: number;
  status: string;
  is_approaching_maturity: boolean;
}

export default function AdminActiveDepositsPage() {
  const [investments, setInvestments] = useState<ActiveInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [approachingOnly, setApproachingOnly] = useState(false);

  // Settlement Processing Action
  const [isProcessingMatured, setIsProcessingMatured] = useState(false);
  const [settlementResult, setSettlementResult] = useState<{
    processed_count: number;
    total_credited: Record<string, number>;
  } | null>(null);

  const fetchActiveInvestments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/investments/active");
      setInvestments(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load active contracts from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveInvestments();
  }, [fetchActiveInvestments]);

  const handleProcessMatured = async () => {
    setIsProcessingMatured(true);
    try {
      const res = await api.post("/admin/investments/process-matured");
      setSettlementResult(res.data);
      fetchActiveInvestments();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to process matured contracts.");
    } finally {
      setIsProcessingMatured(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "Maturity Reached";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch =
      inv.user_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.user_email.toLowerCase().includes(search.toLowerCase()) ||
      inv.plan_name.toLowerCase().includes(search.toLowerCase());
    if (approachingOnly) {
      return matchesSearch && inv.is_approaching_maturity;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Active Contracts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Active Deposits</h1>
          <p className="text-xs text-[#7D8998]">
            Monitor active investor capital allocations, live maturity countdowns, and execute contract settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleProcessMatured}
            disabled={isProcessingMatured}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#27C58B] text-black hover:bg-[#27C58B]/90 transition-all disabled:opacity-50"
            title="Settle contracts past maturity date"
          >
            {isProcessingMatured ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            <span>Process Matured Contracts</span>
          </button>

          <button
            type="button"
            onClick={fetchActiveInvestments}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Settlement Result Alert */}
      {settlementResult && (
        <div className="p-4 rounded-xl bg-[#27C58B]/10 border border-[#27C58B]/20 text-xs text-[#27C58B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Settlement executed successfully: {settlementResult.processed_count} contract(s) matured and paid out to
              investor wallets.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSettlementResult(null)}
            className="underline font-semibold hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by investor name, email, or tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setApproachingOnly(!approachingOnly)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-all ${
              approachingOnly
                ? "bg-[#F59E0B] text-black border-[#F59E0B]"
                : "bg-[#0B0F14] text-[#7D8998] border-white/10 hover:text-white"
            }`}
          >
            Approaching Maturity (&lt; 24h)
          </button>
          <span className="text-xs text-[#7D8998] font-mono">
            {filteredInvestments.length} Active Contracts
          </span>
        </div>
      </div>

      {/* Active Deposits Table */}
      <div className="rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-[#7D8998] text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
            <span>Loading active contracts...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : filteredInvestments.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No active contracts found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">Investor</th>
                  <th className="p-3.5 font-medium">Portfolio Tier</th>
                  <th className="p-3.5 font-medium">Principal Capital</th>
                  <th className="p-3.5 font-medium">Expected Return</th>
                  <th className="p-3.5 font-medium">Activation Date</th>
                  <th className="p-3.5 font-medium">Maturity Date</th>
                  <th className="p-3.5 font-medium text-right">Time Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvestments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#F5F7FA]">{inv.user_name}</div>
                      <div className="text-[11px] text-[#7D8998] font-mono">{inv.user_email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{inv.plan_name}</div>
                      <div className="text-[10px] text-[#4388F5]">+{inv.return_percentage}% Target ROI</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-white font-bold">
                      {inv.amount} {inv.currency}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#27C58B] font-bold">
                      {inv.expected_return} {inv.currency}
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(inv.start_date).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(inv.maturity_date).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right font-mono">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${
                          inv.remaining_seconds <= 0
                            ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30 animate-pulse"
                            : inv.is_approaching_maturity
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse"
                            : "bg-[#151F2B] text-white border border-white/5"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatCountdown(inv.remaining_seconds)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
