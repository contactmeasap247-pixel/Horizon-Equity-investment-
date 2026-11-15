"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Copy,
  Check,
  History,
  Loader2,
  Share2,
  Award,
  Clock,
  TrendingUp,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCrypto } from "@/lib/format";

interface ReferredUser {
  id: string;
  full_name: string;
  email: string;
  kyc_status: string;
  created_at: string;
  has_deposited?: boolean;
  total_deposited?: number;
  deposit_status?: string;
  has_invested?: boolean;
  active_investments_count?: number;
  investment_status?: string;
  qualifying_activity?: string;
  total_commission_earned?: number;
  commission_status?: string;
}

interface CommissionItem {
  id: string;
  referrer_id?: string;
  referred_user_id: string;
  referred_user_name?: string;
  investment_id?: string;
  plan_name?: string;
  source_type?: string;
  commission_amount: number | string;
  currency: string;
  status: string;
  created_at: string;
  paid_at?: string;
}

interface Stats {
  referral_code: string;
  referral_count: number;
  active_referrals_count?: number;
  referral_earnings: number;
  pending_earnings?: number;
  pending_commissions: Record<string, number>;
  paid_commissions: Record<string, number>;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [referees, setReferees] = useState<ReferredUser[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = async () => {
    try {
      const [statsRes, refereesRes, commissionsRes] = await Promise.all([
        api.get("/referrals/stats"),
        api.get("/referrals/users"),
        api.get("/referrals/commissions"),
      ]);

      setStats(statsRes.data);
      setReferees(refereesRes.data || []);
      setCommissions(commissionsRes.data || []);
    } catch (e) {
      console.error("Error loading referral networks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const copyReferralLink = () => {
    if (!stats?.referral_code) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/register?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#4388F5] animate-spin" />
        <p className="text-xs text-[#7D8998]">Loading institutional partner telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Partners</span>
              <span className="text-xs text-[#7D8998] font-mono">AFFILIATE PROGRAM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Institutional Partner Network
            </h1>
            <p className="text-xs sm:text-sm text-[#A6B0BE] mt-1 max-w-2xl">
              Invite institutional investors, partners, and traders to earn automated recurring commissions across all active capital deployments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-[#27C58B]/10 border border-[#27C58B]/30 text-[#27C58B] flex items-center gap-1.5 py-1 px-2.5">
              <Award className="w-3.5 h-3.5" />
              Active Partner Status: Tier 1
            </span>
          </div>
        </div>
      </div>

      {/* Share / Referral Link Banner */}
      <div className="panel p-6 bg-[#111821] border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#4388F5]/10 border border-[#4388F5]/20 flex items-center justify-center text-[#4388F5] flex-shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Unique Invitation Link</h2>
              <p className="text-xs text-[#7D8998] mt-0.5">
                Share this link with your network. New registrations automatically map to your commission hierarchy.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto flex-1 max-w-xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  stats?.referral_code
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${stats.referral_code}`
                    : "Generating link..."
                }
                className="input text-xs font-mono select-all bg-[#0B0F14] border-white/10 text-white py-2 flex-1"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                className="btn btn-primary px-4 py-2 flex items-center gap-1.5 flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Affiliates Count */}
        <div className="panel p-4 sm:p-5 flex flex-col justify-between min-h-[115px] bg-[#111821] border-white/10">
          <div>
            <div className="flex items-center justify-between text-[#7D8998] text-xs">
              <span className="font-semibold uppercase tracking-wider">Affiliates Enrolled</span>
              <Users className="h-4 w-4 text-[#4388F5]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white num font-mono mt-2">
              {stats?.referral_count ?? 0}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-[#27C58B] font-medium truncate">
            {stats?.active_referrals_count ?? 0} active / funded partners
          </div>
        </div>

        {/* Total Settled Rewards USD */}
        <div className="panel p-4 sm:p-5 flex flex-col justify-between min-h-[115px] bg-[#111821] border-white/10">
          <div>
            <div className="flex items-center justify-between text-[#7D8998] text-xs">
              <span className="font-semibold uppercase tracking-wider">Settled Rewards</span>
              <TrendingUp className="h-4 w-4 text-[#27C58B]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#27C58B] num font-mono mt-2">
              ${Number(stats?.referral_earnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-[#7D8998] truncate">
            Dispatched to custodial balances
          </div>
        </div>

        {/* Pending Commissions */}
        <div className="panel p-4 sm:p-5 flex flex-col justify-between min-h-[115px] bg-[#111821] border-white/10">
          <div>
            <div className="flex items-center justify-between text-[#7D8998] text-xs">
              <span className="font-semibold uppercase tracking-wider">Pending Rewards</span>
              <Clock className="h-4 w-4 text-[#F3B94F]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F3B94F] num font-mono mt-2">
              ${Number(stats?.pending_earnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-[#7D8998] truncate">
            Awaiting contract maturity
          </div>
        </div>

        {/* Multi-Asset Commission Reserves */}
        <div className="panel p-4 sm:p-5 flex flex-col justify-between min-h-[115px] bg-[#111821] border-white/10">
          <div>
            <div className="flex items-center justify-between text-[#7D8998] text-xs mb-1.5">
              <span className="font-semibold uppercase tracking-wider">Asset Breakdown</span>
              <Coins className="h-4 w-4 text-[#4388F5]" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              {["USDT", "BTC", "ETH", "SOL"].map((curr) => {
                const paid = stats?.paid_commissions?.[curr] ?? 0;
                return (
                  <div key={curr} className="flex justify-between bg-[#0B0F14] px-1.5 py-0.5 rounded border border-white/5">
                    <span className="text-[#7D8998]">{curr}:</span>
                    <span className="text-white font-bold">{formatCrypto(paid, curr === "USDT" ? 2 : 4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-[#7D8998] truncate">
            Real-time multi-asset balances
          </div>
        </div>
      </div>

      {/* Referrals & Commissions Split Ledgers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Referred Accounts (Task 3) */}
        <div className="lg:col-span-7 panel p-6 space-y-4 bg-[#111821] border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4388F5]" />
                Attributed Referral Accounts
              </h3>
              <p className="text-[11px] text-[#7D8998] mt-0.5">
                Every registered partner maps here immediately upon signup.
              </p>
            </div>
            <span className="badge bg-white/5 border border-white/10 text-white font-mono text-xs">
              {referees.length} Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3 font-semibold">Partner</th>
                  <th className="p-3 font-semibold">Joined</th>
                  <th className="p-3 font-semibold">Deposits</th>
                  <th className="p-3 font-semibold">Deployments</th>
                  <th className="p-3 font-semibold text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[#7D8998] text-xs">
                      No referral partners registered yet. Share your link above to begin earning commissions.
                    </td>
                  </tr>
                ) : (
                  referees.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{ref.full_name}</div>
                        <div className="text-[10px] text-[#7D8998] font-mono truncate max-w-[160px]">
                          {ref.email}
                        </div>
                      </td>
                      <td className="p-3 text-[#7D8998] font-mono text-[11px]">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {ref.total_deposited && ref.total_deposited > 0 ? (
                          <span className="text-[#27C58B] font-semibold">
                            ${ref.total_deposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        ) : ref.deposit_status === "pending" ? (
                          <span className="text-[#F3B94F]">Pending</span>
                        ) : (
                          <span className="text-[#7D8998]">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            ref.investment_status === "active"
                              ? "bg-[#4388F5]/10 text-[#4388F5] border border-[#4388F5]/20"
                              : ref.investment_status === "completed"
                              ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/20"
                              : "text-[#7D8998]"
                          }`}
                        >
                          {ref.qualifying_activity || "Registered"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-[11px]">
                        {ref.total_commission_earned && ref.total_commission_earned > 0 ? (
                          <span className="text-[#27C58B] font-bold">
                            +${ref.total_commission_earned.toFixed(2)}
                          </span>
                        ) : ref.commission_status === "pending" ? (
                          <span className="text-[#F3B94F] font-semibold">Pending</span>
                        ) : (
                          <span className="text-[#7D8998]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Commission Ledgers */}
        <div className="lg:col-span-5 panel p-6 space-y-4 bg-[#111821] border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#27C58B]" />
                Commission Payout Ledger
              </h3>
              <p className="text-[11px] text-[#7D8998] mt-0.5">
                Itemized audit trail of affiliate rebates.
              </p>
            </div>
            <span className="badge bg-white/5 border border-white/10 text-white font-mono text-xs">
              {commissions.length} Ledgers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Source / Partner</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-[#7D8998] text-xs">
                      No referral commissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-[#7D8998] font-mono text-[11px]">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white truncate max-w-[140px]">
                          {comm.referred_user_name || "Partner"}
                        </div>
                        <div className="text-[10px] text-[#7D8998] truncate max-w-[140px]">
                          {comm.plan_name || (comm.source_type === "deposit" ? "Deposit Rebate" : "Investment Plan")}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#27C58B] text-[11px]">
                        +{formatCrypto(comm.commission_amount, comm.currency === "USDT" ? 2 : 4)} {comm.currency}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold tracking-wider ${
                            comm.status === "paid"
                              ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30"
                              : "bg-[#F3B94F]/10 text-[#F3B94F] border border-[#F3B94F]/30"
                          }`}
                        >
                          {comm.status === "paid" ? "Settled" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
