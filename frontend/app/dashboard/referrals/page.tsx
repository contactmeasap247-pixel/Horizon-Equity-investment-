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
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCrypto } from "@/lib/format";

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
  commission_amount: number | string;
  currency: string;
  status: string;
  created_at: string;
}

interface Stats {
  referral_code: string;
  referral_count: number | string;
  referral_earnings: number | string;
  pending_commissions: Record<string, number | string>;
  paid_commissions: Record<string, number | string>;
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
        setReferees(refereesRes.data || []);
        setCommissions(commissionsRes.data || []);
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading partner networks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Partners</span>
              <span className="text-xs text-text-faint font-mono">AFFILIATE PROGRAM</span>
            </div>
            <h1 className="t-page">Institutional Partner Network</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Invite institutional investors, partners, and traders to earn automated recurring commissions across all active capital deployments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-success flex items-center gap-1.5 py-1 px-2.5">
              <Award className="w-3.5 h-3.5 text-success" />
              Active Partner Status: Tier 1
            </span>
          </div>
        </div>
      </div>

      {/* Share / Referral Link Banner */}
      <div className="panel p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Your Unique Invitation Link</h2>
              <p className="text-xs text-text-muted mt-0.5">
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
                className="input text-xs font-mono select-all bg-canvas py-2 flex-1"
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
        <div className="panel p-3.5 sm:p-5 flex flex-col justify-between min-h-[110px] sm:min-h-0">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
              Affiliates Enrolled
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-text num font-mono mt-1 sm:mt-2 truncate">
              {stats?.referral_count || 0}
            </div>
          </div>
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-border-subtle text-[10px] sm:text-xs text-text-faint truncate">
            Direct 1st-tier referrals
          </div>
        </div>

        {/* Total Rewards USD */}
        <div className="panel p-3.5 sm:p-5 flex flex-col justify-between min-h-[110px] sm:min-h-0">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
              Total Rewards
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-success num font-mono mt-1 sm:mt-2 truncate">
              ${(stats?.referral_earnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-border-subtle text-[10px] sm:text-xs text-text-faint truncate">
            Settled payouts
          </div>
        </div>

        {/* Multi-Currency Reserves */}
        <div className="panel p-3.5 sm:p-5 col-span-2 sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Multi-Asset Commission Reserves
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["BTC", "ETH", "USDT", "SOL"].map((curr) => {
                const pending = stats?.pending_commissions?.[curr] ?? 0;
                const paid = stats?.paid_commissions?.[curr] ?? 0;
                return (
                  <div key={curr} className="inset p-2 rounded-md border border-border-subtle">
                    <div className="text-xs font-bold text-text">{curr}</div>
                    <div className="text-[10px] sm:text-[11px] text-accent font-mono num mt-0.5 truncate">
                      Pending: {formatCrypto(pending, 4)}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-text-faint font-mono num truncate">
                      Settled: {formatCrypto(paid, 4)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 border-t border-border-subtle text-[10px] sm:text-xs text-text-faint truncate">
            Credited automatically to custodial balances
          </div>
        </div>
      </div>

      {/* Referrals & Commissions Split Ledgers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Referred Accounts */}
        <div className="lg:col-span-5 panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="t-title flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Referred Accounts
            </h3>
            <span className="badge font-mono text-[10px]">
              {referees.length} Accounts
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Join Date</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {referees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-text-muted text-xs">
                      No referral accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  referees.map((ref) => (
                    <tr key={ref.id}>
                      <td>
                        <div className="font-semibold text-text text-xs">{ref.full_name}</div>
                        <div className="text-[10px] text-text-faint truncate max-w-[130px] font-mono">
                          {ref.email}
                        </div>
                      </td>
                      <td className="text-text-muted text-xs font-mono">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge text-[10px] ${
                            ref.kyc_status === "verified"
                              ? "badge-success"
                              : ref.kyc_status === "pending"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
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

        {/* Right Col: Commission Ledgers */}
        <div className="lg:col-span-7 panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="t-title flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              Commission Payout Ledger
            </h3>
            <span className="badge font-mono text-[10px]">
              {commissions.length} Ledgers
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reward Amount</th>
                  <th>Asset</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-text-muted text-xs">
                      No referral commissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((comm) => (
                    <tr key={comm.id}>
                      <td className="text-text-muted text-xs font-mono">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </td>
                      <td className="font-mono text-xs font-bold text-success num">
                        +{formatCrypto(comm.commission_amount, 6)}
                      </td>
                      <td>
                        <span className="font-semibold text-text text-xs">
                          {comm.currency}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge text-[10px] ${
                            comm.status === "paid" ? "badge-success" : "badge-warning"
                          }`}
                        >
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
