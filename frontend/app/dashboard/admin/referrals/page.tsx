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
  ShieldCheck,
  Check,
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
  referrer_id: string;
  referrer_name: string;
  referrer_email: string;
  referred_id: string;
  referred_name: string;
  referred_email: string;
  amount: number;
  currency: string;
  status: string;
  source_type?: string;
  plan_name?: string;
  created_at: string;
  paid_at?: string;
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
  const [isReconciling, setIsReconciling] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  const handleReconcile = async () => {
    if (isReconciling) return;
    setIsReconciling(true);
    setSuccessMsg(null);
    try {
      const res = await api.post("/admin/referrals/reconcile");
      setSuccessMsg(res.data?.message || "Affiliate reconciliation completed successfully.");
      await fetchAnalytics();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e.response?.data?.detail || "Affiliate reconciliation failed.");
    } finally {
      setIsReconciling(false);
    }
  };

  const handleSettleCommission = async (id: string) => {
    setSettlingId(id);
    try {
      await api.post(`/admin/referrals/commissions/${id}/settle`);
      await fetchAnalytics();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e.response?.data?.detail || "Failed to settle commission.");
    } finally {
      setSettlingId(null);
    }
  };

  const sortedReferrers = data?.top_referrers ? [...data.top_referrers].sort((a, b) => {
    if (sortBy === "earnings") return b.referral_earnings - a.referral_earnings;
    return b.referral_count - a.referral_count;
  }) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Network Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Referral Earnings & Audit</h1>
          <p className="text-xs text-[#7D8998]">
            Audit partner commissions, view network top referrers, and verify rewards distribution records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReconcile}
            disabled={isReconciling}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#27C58B]/10 border border-[#27C58B]/30 text-[#27C58B] hover:bg-[#27C58B]/20 transition-all disabled:opacity-50"
            title="Reconcile and synchronize all affiliate counts and matured commissions"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${isReconciling ? "animate-spin" : ""}`} />
            <span>{isReconciling ? "Reconciling..." : "Reconcile Network"}</span>
          </button>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
                {Number(data.paid_totals?.USDT || 0).toLocaleString()} USDT
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
                {Number(data.pending_totals?.USDT || 0).toLocaleString()} USDT
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Referrers Table */}
            <div className="lg:col-span-5 rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
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
                        <th className="p-3 font-medium">Rank & Referrer</th>
                        <th className="p-3 font-medium">Code</th>
                        <th className="p-3 font-medium">Members</th>
                        <th className="p-3 font-medium text-right">Settled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedReferrers.map((ref, idx) => (
                        <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
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
                              <div className="truncate max-w-[130px]">
                                <div className="font-semibold text-white truncate">{ref.name}</div>
                                <div className="text-[10px] text-[#7D8998] font-mono truncate">{ref.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#4388F5]">
                            {ref.referral_code}
                          </td>
                          <td className="p-3 font-mono text-white text-[11px]">
                            {ref.referral_count}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#27C58B] text-[11px]">
                            ${Number(ref.referral_earnings || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Commission Events (Task 7) */}
            <div className="lg:col-span-7 rounded-xl bg-[#111821] border border-white/10 p-4 space-y-3">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">Commission Audit Logs</h3>
                  <p className="text-xs text-[#7D8998]">Comprehensive ledger of referring and referred partner events</p>
                </div>
                <span className="badge text-[10px] font-mono">
                  {data.recent_commissions.length} Records
                </span>
              </div>

              {data.recent_commissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7D8998]">
                  No commissions logged in database.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {data.recent_commissions.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{c.referrer_name}</span>
                          <span className="text-[10px] text-[#7D8998]">earned from</span>
                          <span className="font-medium text-[#4388F5]">{c.referred_name}</span>
                        </div>
                        <div className="text-[11px] text-[#A6B0BE] flex items-center gap-2">
                          <span className="font-medium">{c.plan_name || "Investment"}</span>
                          <span className="text-[#7D8998]">•</span>
                          <span className="text-[#7D8998] text-[10px]">
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#27C58B]">
                            +{c.amount} {c.currency}
                          </div>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              c.status === "paid"
                                ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/20"
                                : "bg-[#F3B94F]/10 text-[#F3B94F] border border-[#F3B94F]/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        {c.status === "pending" && (
                          <button
                            type="button"
                            disabled={settlingId === c.id}
                            onClick={() => handleSettleCommission(c.id)}
                            className="btn btn-secondary btn-sm text-[10px] py-1 px-2.5 font-semibold text-[#27C58B] hover:bg-[#27C58B]/20 border-[#27C58B]/30"
                            title="Manually settle and credit referrer balance"
                          >
                            {settlingId === c.id ? "Settling..." : "Settle Now"}
                          </button>
                        )}
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
