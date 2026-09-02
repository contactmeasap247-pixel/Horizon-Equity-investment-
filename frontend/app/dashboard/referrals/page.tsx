"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Copy,
  Check,
  Coins,
  History,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface ReferredUser {
  id: string;
  full_name: string;
  email: string;
  kyc_status: string;
  created_at: string;
}

interface CommissionItem {
  id: string;
  referred_user_id: string;
  commission_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Stats {
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  pending_commissions: Record<string, number>;
  paid_commissions: Record<string, number>;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [referees, setReferees] = useState<ReferredUser[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const [statsRes, refereesRes, commissionsRes] = await Promise.all([
          api.get("/referrals/stats"),
          api.get("/referrals/users"),
          api.get("/referrals/commissions"),
        ]);
        
        setStats(statsRes.data);
        setReferees(refereesRes.data);
        setCommissions(commissionsRes.data);
      } catch (e) {
        console.error("Error loading referral networks:", e);
      } finally {
        setIsLoading(false);
      }
    };

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
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 stagger-1 animate-slide-up">
      {/* Top Banner and Quick Copier */}
      <div className="card bg-[#0D2D4A]/85 border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gold-300/10 flex items-center justify-center text-gold-300 border border-gold-300/20">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg">Partner Program</h3>
            <p className="text-xs text-text-secondary mt-0.5">Invite partners and build recurring cryptographical income stream.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              readOnly
              value={stats?.referral_code ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${stats.referral_code}` : "Generating Link..."}
              className="input text-xs font-mono select-all bg-white/[0.02] pr-12 truncate"
            />
            <button
              onClick={copyReferralLink}
              className="absolute right-1 top-1 h-8 px-2.5 bg-gold-300 text-[#0A2540] hover:bg-gold-200 rounded-lg flex items-center justify-center transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Referral Analytics summary grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Referral count card */}
        <div className="stat-card flex flex-col gap-2">
          <span className="text-xs text-text-secondary">Partners Registered</span>
          <span className="text-3xl font-extrabold mt-1 text-white">{stats?.referral_count || 0}</span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">Direct referrals tree count</span>
        </div>

        {/* Total earnings card */}
        <div className="stat-card flex flex-col gap-2">
          <span className="text-xs text-text-secondary">Total Rewards Valuation</span>
          <span className="text-3xl font-extrabold mt-1 text-gradient">${(stats?.referral_earnings || 0).toFixed(2)}</span>
          <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">Paid commission amounts sum</span>
        </div>

        {/* Pending commissions summary card */}
        <div className="stat-card flex flex-col gap-2 col-span-1 sm:col-span-2 bg-white/[0.01]">
          <span className="text-xs text-text-secondary">Accumulated Commission Balances</span>
          <div className="grid grid-cols-4 gap-4 mt-2">
            {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
              const pending = stats?.pending_commissions?.[curr] || 0;
              const paid = stats?.paid_commissions?.[curr] || 0;
              return (
                <div key={curr} className="flex flex-col border-r border-white/5 last:border-none pr-2">
                  <span className="text-xs font-bold text-white">{curr}</span>
                  <span className="text-[11px] text-gold-300 mt-1">
                    Pnd: {pending.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-text-muted mt-0.5">
                    Paid: {paid.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Referrals queues tables */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Referred accounts list */}
        <div className="lg:col-span-5 card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-gold-300" /> Referred Accounts
          </h3>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Join Date</th>
                  <th>KYC</th>
                </tr>
              </thead>
              <tbody>
                {referees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-text-muted">
                      No referred accounts signed up yet.
                    </td>
                  </tr>
                ) : (
                  referees.map((ref) => (
                    <tr key={ref.id}>
                      <td className="flex flex-col">
                        <span className="font-bold text-xs">{ref.full_name}</span>
                        <span className="text-[9px] text-text-muted mt-0.5 truncate max-w-[140px]">{ref.email}</span>
                      </td>
                      <td className="text-text-secondary text-xs">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                          ref.kyc_status === "verified" ? "badge-success" : ref.kyc_status === "pending" ? "badge-warning" : "badge-danger"
                        }`}>
                          {ref.kyc_status || "unverified"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Commission payout transaction logs */}
        <div className="lg:col-span-7 card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-gold-300" /> Commission Ledgers
          </h3>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Match Reward</th>
                  <th>Asset</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-text-muted">
                      No referral commissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((comm) => (
                    <tr key={comm.id}>
                      <td className="text-text-secondary text-xs">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </td>
                      <td className="font-extrabold text-white">+{comm.commission_amount.toFixed(6)}</td>
                      <td className="font-bold text-gold-300">{comm.currency}</td>
                      <td>
                        <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                          comm.status === "paid" ? "badge-success" : "badge-warning"
                        }`}>
                          {comm.status}
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
