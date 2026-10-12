"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Share2,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface TopReferrer {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
}

interface RecentCommission {
  id: string;
  referrer_name: string;
  referrer_email: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface ReferralAnalytics {
  top_referrers: TopReferrer[];
  paid_totals: Record<string, number>;
  pending_totals: Record<string, number>;
  recent_commissions: RecentCommission[];
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"earnings" | "count">("earnings");

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/referrals/analytics");
      setData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load referral analytics from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const sortedReferrers = data?.top_referrers ? [...data.top_referrers].sort((a, b) => {
    if (sortBy === "earnings") return b.referral_earnings - a.referral_earnings;
    return b.referral_count - a.referral_count;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Network Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Referral Earnings</h1>
          <p className="text-xs text-[#7D8998]">
            Audit partner commissions, view network top referrers, and verify rewards distribution records.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 rounded-xl bg-[#111821] border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
          <p className="text-xs text-[#7D8998]">Aggregating referral network records...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl bg-[#111821] border border-white/10 text-center text-xs text-[#F06464]">
          {error}
        </div>
      ) : data ? (
        <>
          {/* Commission Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>USDT Commissions Paid</span>
                <CheckCircle2 className="h-4 w-4 text-[#27C58B]" />
              </div>
              <div className="text-2xl font-bold text-[#27C58B] mt-2 font-mono">
                {data.paid_totals?.USDT?.toLocaleString() || "0"} USDT
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Dispatched to user balances</p>
            </div>

            <div className="bg-[#111821] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>BTC Commissions Paid</span>
                <CheckCircle2 className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-bold text-[#F59E0B] mt-2 font-mono">
                {data.paid_totals?.BTC || "0"} BTC
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Settled on-chain or internal</p>
            </div>

            <div className="bg-[#111821] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Pending Commissions</span>
                <Clock className="h-4 w-4 text-[#4388F5]" />
              </div>
              <div className="text-2xl font-bold text-[#4388F5] mt-2 font-mono">
                {data.pending_totals?.USDT || "0"} USDT
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Awaiting contract maturity</p>
            </div>

            <div className="bg-[#111821] p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Network Referrers</span>
                <Award className="h-4 w-4 text-[#A78BFA]" />
              </div>
              <div className="text-2xl font-bold text-white mt-2 font-mono">
                {data.top_referrers.length}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Partners with active downstream</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Referrers Table */}
            <div className="lg:col-span-2 rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">Top Affiliate Leaders</h3>
                  <p className="text-xs text-[#7D8998]">Derived from verified user referral records</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[#7D8998]">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setSortBy("earnings")}
                    className={`px-2 py-1 rounded text-xs ${
                      sortBy === "earnings" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    Earnings
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("count")}
                    className={`px-2 py-1 rounded text-xs ${
                      sortBy === "count" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    Count
                  </button>
                </div>
              </div>

              {sortedReferrers.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#7D8998]">
                  No affiliate network activity recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                        <th className="p-3.5 font-medium">Rank & Referrer</th>
                        <th className="p-3.5 font-medium">Referral Code</th>
                        <th className="p-3.5 font-medium">Referred Members</th>
                        <th className="p-3.5 font-medium text-right">Recorded Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedReferrers.map((ref, idx) => (
                        <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                  idx === 0
                                    ? "bg-[#F59E0B] text-black"
                                    : idx === 1
                                    ? "bg-slate-300 text-black"
                                    : idx === 2
                                    ? "bg-amber-700 text-white"
                                    : "bg-[#151F2B] text-[#7D8998]"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-semibold text-white">{ref.name}</div>
                                <div className="text-[11px] text-[#7D8998] font-mono">{ref.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-[#4388F5]">
                            {ref.referral_code}
                          </td>
                          <td className="p-3.5 font-mono text-white">
                            {ref.referral_count} investors
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-[#27C58B]">
                            {ref.referral_earnings} USDT
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Commission Events */}
            <div className="rounded-xl bg-[#111821] border border-white/10 p-4 space-y-3">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-semibold text-[#F5F7FA]">Recent Commission Logs</h3>
                <p className="text-xs text-[#7D8998]">Audit trail of recent commission disbursements</p>
              </div>

              {data.recent_commissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7D8998]">
                  No commissions logged in database.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {data.recent_commissions.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{c.referrer_name}</div>
                        <div className="text-[10px] text-[#7D8998] font-mono">{c.referrer_email}</div>
                        <div className="text-[9px] text-[#7D8998] mt-0.5">
                          {new Date(c.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#27C58B]">
                          +{c.amount} {c.currency}
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#27C58B]/10 text-[#27C58B]">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
