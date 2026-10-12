"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Share2,
  History,
  Shield,
  Layers,
  Repeat,
  Mail,
  Bell,
  FileText,
  Lock,
  Settings,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";

interface MetricsData {
  total_users: number;
  active_users: number;
  suspended_users: number;
  kyc_pending: number;
  total_deposits_count: number;
  total_deposits_amount: Record<string, number>;
  total_withdrawals_count: number;
  total_withdrawals_amount: Record<string, number>;
  completed_withdrawals_count: number;
  pending_deposits_count: number;
  pending_withdrawals_count: number;
  active_investments_count: number;
  active_investments_amount: Record<string, number>;
  total_transactions_count: number;
  total_referral_commissions: Record<string, number>;
  wallet_balances: Record<string, number>;
  activity_chart: Array<{
    date: string;
    transactions: number;
    deposits: number;
    withdrawals: number;
  }>;
  refreshed_at: string;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "90d" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (selectedPeriod: string, showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await api.get(`/admin/stats?period=${selectedPeriod}`);
      setData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load platform overview metrics from database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(period);
  }, [period, fetchMetrics]);

  const periods: Array<{ id: "today" | "7d" | "30d" | "90d" | "all"; label: string }> = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "all", label: "All Time" },
  ];

  const adminNavCards = [
    { name: "Users", desc: "Accounts, KYC, balances & suspensions", href: "/dashboard/admin/users", icon: Users, count: data?.total_users },
    { name: "Deposits", desc: "Proof review & custody verifications", href: "/dashboard/admin/deposits", icon: ArrowDownLeft, alert: data?.pending_deposits_count },
    { name: "Withdrawals", desc: "Dispatches & reinvestment actions", href: "/dashboard/admin/withdrawals", icon: ArrowUpRight, alert: data?.pending_withdrawals_count },
    { name: "Transactions", desc: "Immutable financial ledger records", href: "/dashboard/admin/transactions", icon: History, count: data?.total_transactions_count },
    { name: "Active Deposits", desc: "Unexpired contracts & maturity", href: "/dashboard/admin/active-deposits", icon: Layers, count: data?.active_investments_count },
    { name: "Referrals", desc: "Commission network & top referrers", href: "/dashboard/admin/referrals", icon: Share2 },
    { name: "Exchange", desc: "Market rates & bridge controls", href: "/dashboard/admin/exchange", icon: Repeat },
    { name: "Email Templates", desc: "Custom templates & previewer", href: "/dashboard/admin/email-templates", icon: Mail },
    { name: "Notifications", desc: "System alerts & user broadcast", href: "/dashboard/admin/notifications", icon: Bell },
    { name: "Audit Logs", desc: "Traceable admin & security events", href: "/dashboard/admin/audit-logs", icon: FileText },
    { name: "Security & Controls", desc: "Maintenance mode & login rules", href: "/dashboard/admin/security", icon: Lock },
    { name: "Platform Settings", desc: "Global parameters & auto-withdrawal", href: "/dashboard/admin/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#27C58B] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#27C58B]">
              Production Management System
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Platform Control Center</h1>
          <p className="text-xs text-[#7D8998]">
            Real-time multi-asset metrics aggregated directly from platform database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter Buttons */}
          <div className="bg-[#111821] p-1 rounded-lg border border-white/10 flex items-center gap-1">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  period === p.id
                    ? "bg-[#4388F5] text-white shadow-sm"
                    : "text-[#7D8998] hover:text-white hover:bg-white/5"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchMetrics(period, true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Refreshed Notice */}
      <div className="flex items-center justify-between text-xs text-[#7D8998] px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[#7D8998]" />
          <span>
            Last synchronized:{" "}
            <span className="font-mono text-[#F5F7FA]">
              {data?.refreshed_at ? new Date(data.refreshed_at).toLocaleTimeString() : "--"}
            </span>{" "}
            (UTC)
          </span>
        </div>
        <div className="text-[11px] text-[#7D8998]">Zero-Mock Database Enforced</div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-[#F06464]/10 border border-[#F06464]/20 flex items-center justify-between text-xs text-[#F06464]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchMetrics(period)}
            className="underline font-semibold hover:text-white"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-16 rounded-xl bg-[#111821] border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
          <p className="text-xs text-[#7D8998]">Querying platform database records...</p>
        </div>
      ) : data ? (
        <>
          {/* Phase 2: Overview Metric Cards (12 Precise Metrics) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Users */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Registered Users</span>
                <Users className="h-4 w-4 text-[#4388F5]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.total_users.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Total database user profiles</p>
            </div>

            {/* 2. Active Users */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Active Users</span>
                <CheckCircle2 className="h-4 w-4 text-[#27C58B]" />
              </div>
              <div className="text-2xl font-bold text-[#27C58B] mt-2 font-mono">
                {data.active_users.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Active & unsuspended accounts</p>
            </div>

            {/* 3. Suspended Users */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Suspended Users</span>
                <AlertTriangle className="h-4 w-4 text-[#F06464]" />
              </div>
              <div className="text-2xl font-bold text-[#F06464] mt-2 font-mono">
                {data.suspended_users.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Access revoked by administration</p>
            </div>

            {/* 4. Total Deposits */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Total Deposits</span>
                <ArrowDownLeft className="h-4 w-4 text-[#4388F5]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.total_deposits_count.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">
                USDT: {data.total_deposits_amount?.USDT?.toLocaleString() || "0"} | BTC: {data.total_deposits_amount?.BTC || "0"}
              </p>
            </div>

            {/* 5. Total Withdrawal Requests */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Withdrawal Requests</span>
                <ArrowUpRight className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.total_withdrawals_count.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">All submitted user requests</p>
            </div>

            {/* 6. Completed Withdrawals */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Completed Withdrawals</span>
                <CheckCircle2 className="h-4 w-4 text-[#27C58B]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.completed_withdrawals_count.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">
                Settled: {data.total_withdrawals_amount?.USDT?.toLocaleString() || "0"} USDT
              </p>
            </div>

            {/* 7. Active Investments */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Active Investments</span>
                <Layers className="h-4 w-4 text-[#4388F5]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.active_investments_count.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Contracts currently running</p>
            </div>

            {/* 8. Active Investment Value */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Active Capital</span>
                <TrendingUp className="h-4 w-4 text-[#27C58B]" />
              </div>
              <div className="text-xl font-bold text-[#27C58B] mt-2 font-mono">
                {data.active_investments_amount?.USDT?.toLocaleString() || "0"} USDT
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">
                BTC: {data.active_investments_amount?.BTC || "0"} | ETH: {data.active_investments_amount?.ETH || "0"}
              </p>
            </div>

            {/* 9. Recorded Referral Earnings */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Referral Commissions</span>
                <Share2 className="h-4 w-4 text-[#4388F5]" />
              </div>
              <div className="text-xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.total_referral_commissions?.USDT?.toLocaleString() || "0"} USDT
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Paid commission rewards</p>
            </div>

            {/* 10. Platform Transactions */}
            <div className="bg-[#111821] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-[#7D8998] text-xs">
                <span>Platform Transactions</span>
                <History className="h-4 w-4 text-[#7D8998]" />
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mt-2 font-mono">
                {data.total_transactions_count.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#7D8998] mt-1">Immutable financial ledger entries</p>
            </div>

            {/* 11. Pending Deposits (Actionable) */}
            <Link
              href="/dashboard/admin/deposits?status=pending"
              className={`p-4 rounded-xl border transition-all ${
                data.pending_deposits_count > 0
                  ? "bg-[#4388F5]/10 border-[#4388F5]/30 hover:border-[#4388F5]"
                  : "bg-[#111821] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={data.pending_deposits_count > 0 ? "text-[#4388F5] font-semibold" : "text-[#7D8998]"}>
                  Pending Deposits
                </span>
                <ArrowDownLeft className={`h-4 w-4 ${data.pending_deposits_count > 0 ? "text-[#4388F5]" : "text-[#7D8998]"}`} />
              </div>
              <div className={`text-2xl font-bold mt-2 font-mono ${data.pending_deposits_count > 0 ? "text-[#4388F5]" : "text-[#F5F7FA]"}`}>
                {data.pending_deposits_count}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#4388F5] mt-1">
                <span>Review submissions</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </div>
            </Link>

            {/* 12. Pending Withdrawals (Actionable) */}
            <Link
              href="/dashboard/admin/withdrawals?status=pending"
              className={`p-4 rounded-xl border transition-all ${
                data.pending_withdrawals_count > 0
                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 hover:border-[#F59E0B]"
                  : "bg-[#111821] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={data.pending_withdrawals_count > 0 ? "text-[#F59E0B] font-semibold" : "text-[#7D8998]"}>
                  Pending Withdrawals
                </span>
                <ArrowUpRight className={`h-4 w-4 ${data.pending_withdrawals_count > 0 ? "text-[#F59E0B]" : "text-[#7D8998]"}`} />
              </div>
              <div className={`text-2xl font-bold mt-2 font-mono ${data.pending_withdrawals_count > 0 ? "text-[#F59E0B]" : "text-[#F5F7FA]"}`}>
                {data.pending_withdrawals_count}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#F59E0B] mt-1">
                <span>Process or reinvest</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </div>
            </Link>
          </div>

          {/* Historical Activity Chart & System Custody Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Historical Activity (Real Database Records) */}
            <div className="lg:col-span-2 bg-[#111821] p-5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F7FA]">Platform Activity Timeline</h3>
                    <p className="text-xs text-[#7D8998]">Daily transactions & operations for the selected timeframe</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-xs text-[#4388F5]">
                      <span className="h-2 w-2 rounded-full bg-[#4388F5]" /> Transactions
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#27C58B]">
                      <span className="h-2 w-2 rounded-full bg-[#27C58B]" /> Deposits
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
                      <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Withdrawals
                    </span>
                  </div>
                </div>

                {/* Bar representation of timeline */}
                <div className="mt-6 h-48 flex items-end gap-2 pt-6 border-b border-white/10 pb-2">
                  {data.activity_chart.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#7D8998]">
                      No recorded activity in selected timeframe.
                    </div>
                  ) : (
                    data.activity_chart.map((point, idx) => {
                      const totalActivity = point.transactions + point.deposits + point.withdrawals;
                      const maxVal = Math.max(
                        ...data.activity_chart.map((p) => p.transactions + p.deposits + p.withdrawals),
                        1
                      );
                      const heightPercent = Math.max((totalActivity / maxVal) * 100, 6);

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          {/* Tooltip */}
                          <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0B0F14] border border-white/10 p-2 rounded text-[10px] text-white z-20 whitespace-nowrap shadow-xl">
                            <div className="font-semibold">{point.date}</div>
                            <div className="text-[#4388F5]">Tx: {point.transactions}</div>
                            <div className="text-[#27C58B]">Dep: {point.deposits}</div>
                            <div className="text-[#F59E0B]">Wdr: {point.withdrawals}</div>
                          </div>

                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#151F2B] border border-white/5 rounded-t group-hover:bg-[#4388F5]/30 transition-all flex flex-col justify-end overflow-hidden"
                          >
                            <div
                              style={{ height: `${(point.withdrawals / Math.max(totalActivity, 1)) * 100}%` }}
                              className="w-full bg-[#F59E0B]/80"
                            />
                            <div
                              style={{ height: `${(point.deposits / Math.max(totalActivity, 1)) * 100}%` }}
                              className="w-full bg-[#27C58B]/80"
                            />
                            <div
                              style={{ height: `${(point.transactions / Math.max(totalActivity, 1)) * 100}%` }}
                              className="w-full bg-[#4388F5]/80"
                            />
                          </div>
                          <span className="text-[9px] text-[#7D8998] truncate w-full text-center">
                            {point.date}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7D8998] pt-3">
                <span>Metrics query source: PostgreSQL / SQLite Async Transaction Pool</span>
                <span className="font-mono text-white/50">{data.activity_chart.length} Timeline Buckets</span>
              </div>
            </div>

            {/* Platform User Wallet Balances (Aggregate) */}
            <div className="bg-[#111821] p-5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#4388F5]" />
                    <h3 className="text-sm font-semibold text-[#F5F7FA]">User Balances</h3>
                  </div>
                  <span className="text-[10px] text-[#7D8998] uppercase tracking-wider">Active Custody</span>
                </div>

                <div className="space-y-3 mt-4">
                  {[
                    { symbol: "BTC", name: "Bitcoin", val: data.wallet_balances?.BTC || 0, color: "text-[#F59E0B]" },
                    { symbol: "ETH", name: "Ethereum", val: data.wallet_balances?.ETH || 0, color: "text-[#627EEA]" },
                    { symbol: "USDT", name: "Tether USD", val: data.wallet_balances?.USDT || 0, color: "text-[#26A17B]" },
                    { symbol: "SOL", name: "Solana", val: data.wallet_balances?.SOL || 0, color: "text-[#14F195]" },
                  ].map((asset) => (
                    <div
                      key={asset.symbol}
                      className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-[#151F2B] border border-white/10 flex items-center justify-center font-bold text-xs text-[#F5F7FA]">
                          {asset.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#F5F7FA]">{asset.symbol}</div>
                          <div className="text-[10px] text-[#7D8998]">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${asset.color}`}>
                          {asset.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </div>
                        <div className="text-[9px] text-[#7D8998]">Available Capital</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#7D8998]">System Deposit Custody:</span>
                <Link
                  href="/dashboard/admin/wallets"
                  className="text-xs font-semibold text-[#4388F5] hover:underline flex items-center gap-1"
                >
                  Manage Wallets
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Administrative Control Hub Navigation Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#F5F7FA]">Administrative Control Hub</h3>
              <span className="text-xs text-[#7D8998]">Direct access to all 12 operational management centers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminNavCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.name}
                    href={card.href}
                    className="p-4 rounded-xl bg-[#111821] border border-white/10 hover:border-[#4388F5]/40 hover:bg-[#151F2B] transition-all flex items-start justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-[#0B0F14] border border-white/10 text-[#4388F5] group-hover:text-white group-hover:bg-[#4388F5] transition-all">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F5F7FA] flex items-center gap-2">
                          <span>{card.name}</span>
                          {card.alert !== undefined && card.alert > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F59E0B] text-black animate-pulse">
                              {card.alert} pending
                            </span>
                          )}
                          {card.count !== undefined && (
                            <span className="text-[10px] text-[#7D8998] font-mono">({card.count})</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7D8998] mt-1">{card.desc}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#7D8998] group-hover:text-[#4388F5] transition-all shrink-0 mt-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
