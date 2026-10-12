"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  X,
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

const SUPPORTED_CURRENCIES = ["BTC", "ETH", "USDT", "SOL"];

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

      setPlans(plansRes.data || []);
      setWallets(walletsRes.data || []);
      setInvestments(investmentsRes.data || []);
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

      setFormSuccess(`Successfully allocated ${purchaseAmount} ${purchaseCurrency} into the ${selectedPlan.name} strategy contract.`);
      setTimeout(() => {
        handleClosePurchase();
        fetchData();
      }, 1500);
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Allocation failed. Verify parameters and wallet balances.");
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
  const maturedContracts = investments.filter(
    (i) => i.status === "matured" || i.status === "completed" || i.status === "cancelled"
  );

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
    return days > 0 ? `${days} days remaining` : "Matured";
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading investment portfolios...</p>
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
              <span className="badge badge-accent">Yield Engine</span>
              <span className="text-xs text-text-faint font-mono">AUTOMATED DEPLOYMENT</span>
            </div>
            <h1 className="t-page">Investment Strategies & Contracts</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Deploy capital into quantitative algorithmic yield contracts with institutional-grade risk hedging and automated maturity settlements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="panel px-4 py-2 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-text-faint uppercase font-mono">Active Deployments</div>
                <div className="text-base font-bold text-text num font-mono">{activeContracts.length} Contracts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="t-title flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            Available Strategy Tiers
          </h2>
          <span className="text-xs text-text-muted">Fixed-Term Compounding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isFeatured =
              p.name.toLowerCase().includes("gold") ||
              p.name.toLowerCase().includes("premium") ||
              p.name.toLowerCase().includes("growth");

            return (
              <div
                key={p.id}
                className={`panel p-6 flex flex-col justify-between relative border transition-all ${
                  isFeatured
                    ? "border-accent shadow-sm"
                    : "border-border hover:border-border-hover"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-accent text-[10px] font-bold">RECOMMENDED</span>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Strategy Model
                  </div>
                  <h3 className="text-xl font-bold text-text mt-1">{p.name}</h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed min-h-[40px]">
                    {p.description}
                  </p>

                  {/* Return metric box */}
                  <div className="my-5 p-4 inset rounded-lg">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-text num font-mono">
                        {p.return_percentage.toFixed(1)}%
                      </span>
                      <span className="text-xs text-text-muted font-medium">Net Fixed ROI</span>
                    </div>
                    <div className="text-[11px] text-text-faint mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" />
                      Locked Term: {p.duration_days} Calendar Days
                    </div>
                  </div>

                  {/* Tier details */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Minimum Capital:</span>
                      <span className="font-mono text-text font-bold num">
                        ${p.min_amount.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Maximum Allocation:</span>
                      <span className="font-mono text-text font-medium num">
                        {p.max_amount ? `$${p.max_amount.toLocaleString()} USD` : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Affiliate Rebate:</span>
                      <span className="font-mono text-accent font-semibold num">
                        {p.referral_bonus_percentage.toFixed(1)}% Tier
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted">Principal Guarantee:</span>
                      <span className="text-success font-medium">100% Insured</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => handleOpenPurchase(p)}
                    className={`btn w-full justify-center py-2.5 ${
                      isFeatured ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    Allocate Capital
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contracts Tabs & Ledgers */}
      <div className="panel p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="tabs">
            <button
              type="button"
              onClick={() => setActiveListTab("active")}
              className={`tab flex items-center gap-2 ${
                activeListTab === "active" ? "tab-active" : ""
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Active Contracts ({activeContracts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveListTab("matured")}
              className={`tab flex items-center gap-2 ${
                activeListTab === "matured" ? "tab-active" : ""
              }`}
            >
              <Calendar className="w-4 h-4" />
              Matured Ledgers ({maturedContracts.length})
            </button>
          </div>
        </div>

        {/* List Content */}
        {activeListTab === "active" ? (
          activeContracts.length === 0 ? (
            <div className="p-12 text-center inset rounded-lg border border-dashed border-border">
              <Layers className="w-8 h-8 text-text-faint mx-auto mb-3" />
              <p className="text-sm font-medium text-text">No active contracts currently deployed</p>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                Select an institutional strategy from the tier catalog above to deploy capital and begin compounding returns.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContracts.map((inv) => {
                const percentage = getProgressPercentage(inv.start_date, inv.maturity_date);
                const daysText = getDaysLeft(inv.maturity_date);
                return (
                  <div key={inv.id} className="inset p-5 rounded-lg border border-border space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text">{inv.plan.name} Tier</span>
                          <span className="badge badge-accent text-[10px] font-mono">
                            {inv.plan.return_percentage}% ROI
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-1 font-mono">
                          Principal: <span className="text-text font-bold num">{inv.amount} {inv.currency}</span>
                        </div>
                      </div>
                      <span className="badge badge-success text-[10px]">{daysText}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-text-faint font-mono">
                        <span>Started: {new Date(inv.start_date).toLocaleDateString()}</span>
                        <span>Maturity: {percentage}%</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-text-muted">Settlement Capital:</span>
                      <span className="font-mono text-accent font-bold text-sm num">
                        {inv.expected_return.toFixed(5)} {inv.currency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          maturedContracts.length === 0 ? (
            <div className="p-12 text-center inset rounded-lg border border-dashed border-border">
              <Calendar className="w-8 h-8 text-text-faint mx-auto mb-3" />
              <p className="text-sm font-medium text-text">No matured contracts logged</p>
              <p className="text-xs text-text-muted mt-1">
                Completed strategy maturities will automatically appear here once their term elapses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maturedContracts.map((inv) => (
                <div key={inv.id} className="inset p-5 rounded-lg border border-border space-y-3 opacity-90">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-text">{inv.plan.name} Tier</div>
                      <div className="text-xs text-text-muted mt-1 font-mono">
                        Principal: <span className="text-text font-semibold num">{inv.amount} {inv.currency}</span>
                      </div>
                    </div>
                    <span className="badge badge-success text-[10px] uppercase font-bold">
                      {inv.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="text-text-muted">Settled Payout:</span>
                    <span className="font-mono text-success font-bold text-sm num">
                      {inv.expected_return.toFixed(5)} {inv.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Allocation Modal Dialog */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="panel p-6 max-w-lg w-full space-y-6 border border-border shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-accent font-mono uppercase tracking-wider font-semibold">
                  Capital Allocation Contract
                </span>
                <h3 className="text-lg font-bold text-text mt-0.5">Deploy into {selectedPlan.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleClosePurchase}
                className="btn btn-ghost p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success alerts */}
            {formError && (
              <div className="alert alert-danger text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
                <div className="leading-relaxed">{formError}</div>
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                <div className="leading-relaxed">{formSuccess}</div>
              </div>
            )}

            <form onSubmit={handlePurchaseSubmit} className="space-y-5">
              {/* Currency selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Funding Reserve Wallet
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setPurchaseCurrency(curr)}
                      className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all text-center ${
                        purchaseCurrency === curr
                          ? "bg-accent/15 border-accent text-accent font-bold"
                          : "bg-surface-raised border-border text-text-muted hover:text-text hover:border-border-hover"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-text-faint px-1">
                  <span>Available Balance:</span>
                  <span className="font-mono text-accent font-semibold num">
                    {availableBalance.toFixed(6)} {purchaseCurrency}
                  </span>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Principal Allocation ({purchaseCurrency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="0.05"
                  className="input font-mono font-semibold"
                  required
                  disabled={submitting}
                />
                <div className="flex justify-between text-[11px] text-text-faint px-1">
                  <span>Min: ${selectedPlan.min_amount} USD Equiv.</span>
                  <span>Max: {selectedPlan.max_amount ? `$${selectedPlan.max_amount} USD` : "Unlimited"}</span>
                </div>
              </div>

              {/* Auto-renew checkbox */}
              <label className="flex items-center justify-between p-3.5 inset rounded-lg cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-text">Auto-Renew on Maturity</div>
                  <div className="text-[11px] text-text-muted">Automatically reinvest principal balance upon settlement</div>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoRenew}
                  onChange={(e) => setIsAutoRenew(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded"
                  disabled={submitting}
                />
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || formSuccess !== null}
                  className="btn btn-primary w-full justify-center py-2.5 text-xs font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Validating Balance & Allocating...
                    </>
                  ) : (
                    "Confirm Capital Deployment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
