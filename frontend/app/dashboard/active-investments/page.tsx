"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { toNum, formatCrypto, formatPercent } from "@/lib/format";

interface Plan {
  id: string;
  name: string;
  description: string;
  return_percentage: number | string;
  duration_days: number;
}

interface InvestmentItem {
  id: string;
  amount: number | string;
  currency: string;
  expected_return: number | string;
  status: string;
  start_date: string;
  maturity_date: string;
  is_auto_renew: boolean;
  plan: Plan;
}

export default function ActiveInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<"active" | "matured" | "all">("active");

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/investments");
      setInvestments(res.data || []);
    } catch (e) {
      console.error("Failed to load active contracts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const getProgressPercentage = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();

    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 99);
  };

  const getDaysLeft = (endStr?: string) => {
    if (!endStr) return "Active";
    const end = new Date(endStr).getTime();
    if (isNaN(end)) return "Active";
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Matured";
  };

  const filtered = investments.filter((inv) => {
    if (statusTab === "all") return true;
    return inv.status.toLowerCase() === statusTab.toLowerCase();
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading portfolio contracts and yield maturity...</p>
      </div>
    );
  }

  const activeCount = investments.filter((i) => i.status === "active").length;
  const maturedCount = investments.filter((i) => i.status === "matured" || i.status === "completed").length;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#4388F5]" />
            Active Portfolio Contracts
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Real-time compounding performance, contractual maturity timelines, and accrued yield telemetry.
          </p>
        </div>

        <Link
          href="/dashboard/investments"
          className="btn btn-primary btn-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Investment Contract</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#111821] p-1 rounded-lg border border-white/10 self-start">
        <button
          type="button"
          onClick={() => setStatusTab("active")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            statusTab === "active"
              ? "bg-[#4388F5] text-white shadow-sm"
              : "text-[#7D8998] hover:text-white"
          }`}
        >
          Active Contracts ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusTab("matured")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            statusTab === "matured"
              ? "bg-[#4388F5] text-white shadow-sm"
              : "text-[#7D8998] hover:text-white"
          }`}
        >
          Matured Contracts ({maturedCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusTab("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            statusTab === "all"
              ? "bg-[#4388F5] text-white shadow-sm"
              : "text-[#7D8998] hover:text-white"
          }`}
        >
          All ({investments.length})
        </button>
      </div>

      {/* Contracts List */}
      {filtered.length === 0 ? (
        <div className="panel p-16 flex flex-col items-center justify-center text-center gap-3 bg-[#111821] border-white/10">
          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No {statusTab} Contracts Found</p>
            <p className="text-xs text-[#7D8998] mt-0.5 max-w-sm">
              Commit capital to high-performing quantitative arbitrage and equity strategies to accrue daily yields.
            </p>
          </div>
          <Link href="/dashboard/investments" className="btn btn-secondary btn-sm mt-2">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Explore Investment Plans</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inv) => {
            const isMatured = inv.status === "matured" || inv.status === "completed";
            const progress = getProgressPercentage(inv.start_date, inv.maturity_date);
            const daysLeft = getDaysLeft(inv.maturity_date);

            return (
              <div
                key={inv.id}
                className="panel p-5 bg-[#111821] border-white/10 flex flex-col justify-between gap-4 hover:border-white/20 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {inv.plan?.name || "Portfolio Tier"}
                      </span>
                      <span className="text-[11px] text-[#A6B0BE] block mt-0.5">
                        +{formatPercent(toNum(inv.plan?.return_percentage || 0))} Expected Yield
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isMatured
                          ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                          : "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 my-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Committed Principal</span>
                      <span className="font-bold text-white">
                        {formatCrypto(toNum(inv.amount))} {inv.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Projected Return</span>
                      <span className="font-bold text-[#27C58B]">
                        {formatCrypto(toNum(inv.expected_return))} {inv.currency}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-[#7D8998] mb-1.5">
                      <span>Maturity Progress</span>
                      <span className="font-bold text-white">{isMatured ? "100%" : `${progress}%`}</span>
                    </div>
                    <div className="w-full bg-[#0B0F14] h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isMatured ? "bg-[#27C58B]" : "bg-[#4388F5]"
                        }`}
                        style={{ width: `${isMatured ? 100 : progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#7D8998]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{isMatured ? "Matured" : daysLeft}</span>
                  </span>
                  <span>End: {new Date(inv.maturity_date).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
