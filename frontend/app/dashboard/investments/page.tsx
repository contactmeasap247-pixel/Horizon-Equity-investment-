"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Layers,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number | null;
  return_percentage: number;
  duration_days: number;
  referral_bonus_percentage: number;
}

interface WalletItem {
  currency: string;
  balance: number;
}

interface InvestmentItem {
  id: string;
  amount: number;
  currency: string;
  expected_return: number;
  status: string;
  start_date: string;
  maturity_date: string;
  is_auto_renew: boolean;
  plan: Plan;
}

export default function InvestmentsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeListTab, setActiveListTab] = useState<"active" | "matured">("active");

  // Purchase Modal state
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseCurrency, setPurchaseCurrency] = useState("BTC");
  const [isAutoRenew, setIsAutoRenew] = useState(false);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [plansRes, walletsRes, investmentsRes] = await Promise.all([
        api.get("/investments/plans"),
        api.get("/wallets"),
        api.get("/investments"),
      ]);

      setPlans(plansRes.data);
      setWallets(walletsRes.data);
      setInvestments(investmentsRes.data);
    } catch (e) {
      console.error("Error loading investment data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPurchase = (plan: Plan) => {
    setSelectedPlan(plan);
    setPurchaseAmount(plan.min_amount.toString());
    setFormError(null);
    setFormSuccess(null);
  };

  const handleClosePurchase = () => {
    setSelectedPlan(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !purchaseAmount) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const amountFloat = parseFloat(purchaseAmount);

    try {
      await api.post("/investments", {
        plan_id: selectedPlan.id,
        amount: amountFloat,
        currency: purchaseCurrency,
        is_auto_renew: isAutoRenew,
      });

      setFormSuccess(`Successfully purchased ${selectedPlan.name} Plan for ${purchaseAmount} ${purchaseCurrency}!`);
      setTimeout(() => {
        handleClosePurchase();
        fetchData();
      }, 1500);
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Purchase failed. Verify parameters and balances.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeUserWallet = wallets.find(
    (w) => w.currency.toUpperCase() === purchaseCurrency.toUpperCase()
  );
  const availableBalance = activeUserWallet ? activeUserWallet.balance : 0;

  // Filter lists
  const activeContracts = investments.filter((i) => i.status === "active");
  const maturedContracts = investments.filter((i) => i.status === "matured" || i.status === "completed" || i.status === "cancelled");

  // Helper to calculate progress percentage for active investments
  const getProgressPercentage = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / total) * 100), 99);
  };

  const getDaysLeft = (endStr: string) => {
    const end = new Date(endStr).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Matured";
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
      {/* Plans Catalog Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-base flex items-center gap-2">
          <Layers className="h-4.5 w-4.5 text-gold-300" /> Select Investment Tier
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p) => {
            const isFeatured = p.name.toLowerCase().includes("gold") || p.name.toLowerCase().includes("premium");
            return (
              <div
                key={p.id}
                className={`plan-card flex flex-col gap-6 ${isFeatured ? "featured bg-[#0D2D4A]/80 shadow-xl border-gold-300/30" : "bg-[#0D2D4A]/50"}`}
              >
                {isFeatured && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="badge badge-gold uppercase text-[9px] py-0.5 px-2">Popular</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <h4 className="text-xl font-bold mt-1">{p.name}</h4>
                  <p className="text-xs text-text-secondary mt-1">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-2 py-4 border-y border-white/5">
                  <span className="text-4xl font-extrabold text-white">{p.return_percentage.toFixed(1)}%</span>
                  <span className="text-text-secondary text-xs">Maturity ROI</span>
                </div>

                <div className="flex flex-col gap-3 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Lock Duration</span>
                    <span className="font-semibold text-white">{p.duration_days} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Investment</span>
                    <span className="font-semibold text-white">${p.min_amount} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum Investment</span>
                    <span className="font-semibold text-white">
                      {p.max_amount ? `$${p.max_amount} USD` : "No Limit"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referral Commission</span>
                    <span className="font-semibold text-gold-300">{p.referral_bonus_percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPurchase(p)}
                  className={`w-full justify-center mt-4 ${isFeatured ? "btn-primary" : "btn-secondary"}`}
                >
                  Purchase Tier
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Investment Contracts lists */}
      <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-6">
        <div className="flex border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveListTab("active")}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
              activeListTab === "active" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Active Contracts ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveListTab("matured")}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
              activeListTab === "matured" ? "border-gold-300 text-gold-300" : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Matured Logs ({maturedContracts.length})
          </button>
        </div>

        {/* Display Filtered Contracts list */}
        <div className="grid md:grid-cols-2 gap-6">
          {activeListTab === "active" ? (
            activeContracts.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-text-muted border border-dashed border-white/5 rounded-xl">
                No active contracts found.
              </div>
            ) : (
              activeContracts.map((inv) => {
                const percentage = getProgressPercentage(inv.start_date, inv.maturity_date);
                const daysText = getDaysLeft(inv.maturity_date);
                return (
                  <div key={inv.id} className="p-5 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-white">{inv.plan.name} Tier</span>
                        <span className="text-xs text-text-secondary mt-1">
                          Principal: {inv.amount} {inv.currency}
                        </span>
                      </div>
                      <span className="badge badge-gold uppercase text-[9px] py-0.5 px-2 font-bold animate-pulse-gold">
                        {daysText}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Started: {new Date(inv.start_date).toLocaleDateString()}</span>
                        <span>Maturity Progress: {percentage}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5 mt-2">
                      <span className="text-text-secondary">Expected Settlement:</span>
                      <span className="font-bold text-gold-300 text-sm">
                        {inv.expected_return.toFixed(5)} {inv.currency}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            maturedContracts.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-text-muted border border-dashed border-white/5 rounded-xl">
                No matured contracts logged.
              </div>
            ) : (
              maturedContracts.map((inv) => (
                <div key={inv.id} className="p-5 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-3 opacity-70">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-white">{inv.plan.name} Tier</span>
                      <span className="text-xs text-text-secondary mt-1">
                        Principal: {inv.amount} {inv.currency}
                      </span>
                    </div>
                    <span className="badge badge-success uppercase text-[9px] py-0.5 px-2">
                      {inv.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5 mt-1">
                    <span className="text-text-secondary">Settled Amount:</span>
                    <span className="font-bold text-white text-sm">
                      {inv.expected_return.toFixed(5)} {inv.currency}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Stateful Purchase Modal overlay */}
      {selectedPlan && (
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-6 border-white/10 max-w-[460px]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gold-300 font-semibold uppercase tracking-wider">Purchase contract</span>
                <h3 className="text-xl font-bold mt-0.5">Invest In {selectedPlan.name}</h3>
              </div>
              <button onClick={handleClosePurchase} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            {/* Error alerts inside modal */}
            {formError && (
              <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePurchaseSubmit} className="flex flex-col gap-4">
              {/* Currency selection */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Select Currency Wallet</label>
                <div className="grid grid-cols-4 gap-2">
                  {["BTC", "ETH", "USDT", "SOL"].map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setPurchaseCurrency(curr)}
                      className={`py-2 rounded-lg border font-semibold text-xs transition-all ${
                        purchaseCurrency === curr
                          ? "border-gold-300 bg-gold-300/10 text-gold-300"
                          : "border-white/5 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
                  <span>Available Balance:</span>
                  <span className="font-semibold text-white">
                    {availableBalance.toFixed(6)} {purchaseCurrency}
                  </span>
                </div>
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Principal Amount</label>
                <input
                  type="number"
                  step="any"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="0.05"
                  className="input font-semibold"
                  required
                  disabled={submitting}
                />
                <div className="flex justify-between text-[9px] text-text-muted mt-0.5 px-1">
                  <span>Tier Min Limit: ${selectedPlan.min_amount} Equiv.</span>
                  <span>Max: {selectedPlan.max_amount ? `$${selectedPlan.max_amount}` : "Unlimited"}</span>
                </div>
              </div>

              {/* Auto-renew switch */}
              <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Auto-Renew on Maturity</span>
                  <span className="text-[9px] text-text-muted mt-0.5">Re-invest principal balance instantly</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoRenew}
                  onChange={(e) => setIsAutoRenew(e.target.checked)}
                  className="h-4.5 w-4.5 accent-gold-300 cursor-pointer"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-3 disabled:opacity-50"
                disabled={submitting || formSuccess !== null}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Balance...
                  </>
                ) : (
                  "Confirm Investment"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
