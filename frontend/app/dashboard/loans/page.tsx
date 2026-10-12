"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Landmark,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  CreditCard,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatUsd, toNum } from "@/lib/format";

interface LoanProduct {
  id: string;
  name: string;
  currency: string;
  min_amount: number;
  max_amount: number;
  monthly_interest_rate: number;
  duration_months: number;
  repayment_frequency: string;
  description: string;
}

interface EligibilityData {
  is_eligible: boolean;
  reason: string;
  qualifying_investments_count: number;
  active_loan?: {
    id: string;
    reference: string;
    status: string;
    outstanding_balance: number;
  } | null;
}

interface LoanApplication {
  id: string;
  reference: string;
  product_name: string;
  principal_amount: number;
  currency: string;
  monthly_interest_rate: number;
  duration_months: number;
  total_interest: number;
  total_repayment: number;
  monthly_installment: number;
  outstanding_balance: number;
  total_repaid: number;
  status: string;
  decline_reason?: string;
  disbursed_at?: string;
  due_date?: string;
  created_at: string;
}

export default function LoansPage() {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Application Form States
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [appError, setAppError] = useState("");
  const [appSuccess, setAppSuccess] = useState("");

  // Repayment Modal
  const [repayLoan, setRepayLoan] = useState<LoanApplication | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [repaySubmitting, setRepaySubmitting] = useState(false);
  const [repayError, setRepayError] = useState("");
  const [repaySuccess, setRepaySuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eligRes, prodRes, myLoansRes, walletRes] = await Promise.all([
        api.get("/loans/eligibility"),
        api.get("/loans/products"),
        api.get("/loans/my-loans"),
        api.get("/wallets/USDT").catch(() => ({ data: { balance: 0 } })),
      ]);

      setEligibility(eligRes.data);
      const prods = prodRes.data || [];
      setProducts(prods);
      setMyLoans(myLoansRes.data || []);
      setUsdtBalance(toNum(walletRes.data?.balance || 0));

      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id);
        setBorrowAmount(prods[0].min_amount.toString());
        setDurationMonths(prods[0].duration_months);
      }
    } catch (e) {
      console.error("Failed to load loan telemetry:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeProduct = products.find((p) => p.id === selectedProductId);

  // Calculate Simple Interest Calculations
  const principal = parseFloat(borrowAmount) || 0;
  const rateMonthly = activeProduct ? activeProduct.monthly_interest_rate : 2.0;
  // Interest = Principal * (monthly_rate / 100) * duration_months
  const calculatedInterest = principal * (rateMonthly / 100.0) * durationMonths;
  const totalRepayment = principal + calculatedInterest;
  const monthlyInstallment = durationMonths > 0 ? totalRepayment / durationMonths : 0;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError("");
    setAppSuccess("");

    if (!activeProduct) {
      setAppError("Please select an active loan tier.");
      return;
    }

    if (principal < activeProduct.min_amount || principal > activeProduct.max_amount) {
      setAppError(
        `Borrowing amount must be between $${activeProduct.min_amount} and $${activeProduct.max_amount} ${activeProduct.currency}.`
      );
      return;
    }

    if (!termsAccepted) {
      setAppError("You must review and explicitly accept the credit facility terms agreement.");
      return;
    }

    try {
      setApplying(true);
      const res = await api.post("/loans/apply", {
        product_id: activeProduct.id,
        amount: principal,
        duration_months: durationMonths,
        terms_accepted: true,
      });

      setAppSuccess(`Loan application ${res.data.reference} submitted successfully for compliance review.`);
      setTermsAccepted(false);
      loadData();
    } catch (err: any) {
      setAppError(err.response?.data?.detail || "Failed to submit loan application.");
    } finally {
      setApplying(false);
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayLoan) return;
    setRepayError("");
    setRepaySuccess("");

    const numRepay = parseFloat(repayAmount);
    if (isNaN(numRepay) || numRepay <= 0) {
      setRepayError("Please enter a valid repayment amount.");
      return;
    }

    if (numRepay > usdtBalance) {
      setRepayError(`Insufficient USDT balance. Available: $${formatUsd(usdtBalance)}.`);
      return;
    }

    try {
      setRepaySubmitting(true);
      const res = await api.post(`/loans/${repayLoan.id}/repay`, {
        amount: numRepay,
      });

      setRepaySuccess(`Repayment of $${res.data.repaid_amount} USDT processed successfully!`);
      setTimeout(() => {
        setRepayLoan(null);
        setRepaySuccess("");
        loadData();
      }, 1500);
    } catch (err: any) {
      setRepayError(err.response?.data?.detail || "Repayment failed.");
    } finally {
      setRepaySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Evaluating credit underwriting eligibility and loan products...</p>
      </div>
    );
  }

  const isEligible = eligibility?.is_eligible || false;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Landmark className="h-6 w-6 text-[#4388F5]" />
              Investment-Backed Credit Facility
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30 uppercase tracking-wider">
              Underwritten Liquidity
            </span>
          </div>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Access non-dilutive liquidity advances backed by your verified completed investment contracts without selling portfolio assets.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm font-semibold self-start sm:self-auto"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Independent Bonus Policy Notice (Phase 12 Requirement) */}
      <div className="panel p-4 bg-[#151F2B]/60 border-white/10 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#4388F5] shrink-0 mt-0.5" />
        <p className="text-xs text-[#A6B0BE] leading-relaxed">
          <strong>Promotional Bonus Policy:</strong> The $5 registration bonus operates as a separate promotional welcome credit and cannot count as a completed capital investment. Loan eligibility requires completion of an actual portfolio investment tier (e.g. Silver Starter Tier).
        </p>
      </div>

      {/* Eligibility Status Card */}
      <div
        className={`panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
          isEligible
            ? "border-[#27C58B]/40 bg-[#27C58B]/5"
            : "border-[#F3B94F]/40 bg-[#F3B94F]/5"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${
              isEligible
                ? "bg-[#27C58B]/20 border-[#27C58B]/40 text-[#27C58B]"
                : "bg-[#F3B94F]/20 border-[#F3B94F]/40 text-[#F3B94F]"
            }`}
          >
            {isEligible ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <ShieldAlert className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isEligible
                  ? "Approved for Investment-Backed Advances"
                  : "Loan Eligibility Status: Action Required"}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isEligible
                    ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                    : "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                }`}
              >
                {isEligible ? "Qualified" : "Not Qualified"}
              </span>
            </div>
            <p className="text-xs text-[#A6B0BE] mt-1 leading-relaxed">
              {eligibility?.reason}
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-[#7D8998]">
              <span>
                Completed Qualifying Investments:{" "}
                <strong className="text-white">
                  {eligibility?.qualifying_investments_count || 0}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {!isEligible && (
          <Link
            href="/dashboard/investments"
            className="btn btn-primary btn-sm shrink-0 flex items-center gap-1.5 shadow-md"
          >
            <span>Explore Qualifying Plans</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Loan Application Workflow (If eligible and no pending loan) */}
      {isEligible && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Selection & Configuration */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="panel p-6 bg-[#111821] border-white/10 flex flex-col gap-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#4388F5]" />
                  Select Approved Loan Product
                </h3>
                <p className="text-xs text-[#7D8998] mt-0.5">
                  Institutional simple-interest facility with transparent monthly installments.
                </p>
              </div>

              {appError && (
                <div className="p-3.5 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{appError}</span>
                </div>
              )}

              {appSuccess && (
                <div className="p-3.5 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{appSuccess}</span>
                </div>
              )}

              <form onSubmit={handleApply} className="flex flex-col gap-5">
                {/* Product Radio / Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {products.map((prod) => {
                    const isSel = selectedProductId === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setBorrowAmount(prod.min_amount.toString());
                          setDurationMonths(prod.duration_months);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSel
                            ? "border-[#4388F5] bg-[#4388F5]/10 shadow-sm"
                            : "border-white/10 bg-[#0B0F14] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="loanProduct"
                            checked={isSel}
                            onChange={() => {}}
                            className="text-[#4388F5] border-white/20 bg-[#0B0F14]"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-[#A6B0BE] block mt-0.5">
                              {prod.description}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#27C58B] block">
                            {prod.monthly_interest_rate}% / mo
                          </span>
                          <span className="text-[10px] text-[#7D8998] block">
                            ${prod.min_amount} - ${prod.max_amount} USDT
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Amount input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#A6B0BE]">
                      Requested Principal Amount (USDT) *
                    </label>
                    {activeProduct && (
                      <span className="text-[10px] text-[#7D8998]">
                        Limits: ${activeProduct.min_amount} - ${activeProduct.max_amount} USDT
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    min={activeProduct?.min_amount || 100}
                    max={activeProduct?.max_amount || 10000}
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-bold"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#A6B0BE]">
                      Duration (Months) *
                    </label>
                    <span className="text-[10px] text-[#7D8998]">
                      Up to {activeProduct?.duration_months || 12} months
                    </span>
                  </div>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  >
                    {Array.from(
                      { length: activeProduct?.duration_months || 6 },
                      (_, i) => i + 1
                    ).map((m) => (
                      <option key={m} value={m}>
                        {m} Month{m > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="p-3.5 rounded bg-[#0B0F14] border border-white/10 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="loanTerms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-white/20 bg-[#111821] text-[#4388F5] mt-0.5"
                    required
                  />
                  <label htmlFor="loanTerms" className="text-[11px] text-[#A6B0BE] leading-relaxed cursor-pointer">
                    I have reviewed and explicitly agree to the credit agreement. I understand interest is calculated at {rateMonthly}% monthly simple interest and installments are due monthly. No automated collateral deduction occurs without prior formal notice.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={applying || !termsAccepted}
                  className="btn btn-primary w-full py-2.5 font-semibold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Credit Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Loan Application</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Transparent Simple Interest Schedule */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="panel p-5 bg-[#111821] border-white/10 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D8998] border-b border-white/10 pb-2.5">
                Simple Interest Schedule Breakdown
              </h4>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center text-[#A6B0BE]">
                  <span>Principal Borrowed</span>
                  <span className="font-bold text-white">
                    ${formatUsd(principal)} USDT
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A6B0BE]">
                  <span>Monthly Interest Rate</span>
                  <span className="font-bold text-[#27C58B]">
                    {rateMonthly}% Simple Interest
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A6B0BE]">
                  <span>Duration Term</span>
                  <span className="font-bold text-white">
                    {durationMonths} Months
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A6B0BE]">
                  <span>Total Calculated Interest</span>
                  <span className="font-bold text-[#F3B94F]">
                    ${formatUsd(calculatedInterest)} USDT
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm text-white">
                  <span>Total Repayment Amount</span>
                  <span className="text-white">
                    ${formatUsd(totalRepayment)} USDT
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#A6B0BE] text-xs pt-1">
                  <span>Monthly Installment</span>
                  <span className="font-bold text-[#4388F5]">
                    ${formatUsd(monthlyInstallment)} USDT / mo
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0B0F14] border border-white/5 text-[11px] text-[#7D8998] flex items-start gap-2">
                <Info className="h-4 w-4 text-[#4388F5] shrink-0 mt-0.5" />
                <p>
                  Calculated as: <em>Interest = Principal × Rate × Months</em>. Once approved by administration, funds are disbursed directly to your USDT balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User's Loans Ledger */}
      <div className="panel p-6 bg-[#111821] border-white/10 flex flex-col gap-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#4388F5]" />
              My Loan Facilities & Applications
            </h3>
            <p className="text-xs text-[#7D8998] mt-0.5">
              Review current credit lines, outstanding balances, approval statuses, and execute repayments.
            </p>
          </div>
        </div>

        {myLoans.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No Loan Applications</p>
              <p className="text-xs text-[#7D8998] mt-0.5 max-w-sm">
                You have not submitted any investment-backed credit applications yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLoans.map((loan) => {
              const isActive = loan.status === "active" || loan.status === "repayment_due" || loan.status === "overdue";
              const isRepaid = loan.status === "fully_repaid";
              const isSubmitted = loan.status === "submitted" || loan.status === "under_review";
              const isDeclined = loan.status === "declined";

              return (
                <div
                  key={loan.id}
                  className="p-5 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{loan.product_name}</span>
                        <span className="font-mono text-[10px] text-[#7D8998]">({loan.reference})</span>
                      </div>
                      <span className="text-[10px] text-[#7D8998] block mt-0.5">
                        Applied {new Date(loan.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isActive
                          ? "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                          : isRepaid
                          ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                          : isSubmitted
                          ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                          : "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                      }`}
                    >
                      {loan.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5">
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Principal</span>
                      <span className="font-bold text-white">${formatUsd(loan.principal_amount)} USDT</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Total Repayment</span>
                      <span className="font-bold text-white">${formatUsd(loan.total_repayment)} USDT</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Outstanding Balance</span>
                      <span className={`font-bold ${loan.outstanding_balance > 0 ? "text-[#F3B94F]" : "text-[#27C58B]"}`}>
                        ${formatUsd(loan.outstanding_balance)} USDT
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7D8998] block">Installment</span>
                      <span className="font-bold text-[#A6B0BE]">
                        ${formatUsd(loan.monthly_installment)} / mo ({loan.duration_months}m)
                      </span>
                    </div>
                  </div>

                  {loan.decline_reason && (
                    <div className="text-[11px] text-[#F06464] bg-[#F06464]/10 p-2 rounded border border-[#F06464]/20">
                      Reason: {loan.decline_reason}
                    </div>
                  )}

                  {isActive && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRepayLoan(loan);
                          setRepayAmount(loan.monthly_installment.toString());
                        }}
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Make Repayment</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Repayment Modal */}
      {repayLoan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel w-full max-w-md p-6 bg-[#111821] border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#27C58B]" />
                Execute Loan Repayment
              </h3>
              <button
                type="button"
                onClick={() => setRepayLoan(null)}
                className="p-1 rounded text-[#7D8998] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {repayError && (
              <div className="mb-4 p-3 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{repayError}</span>
              </div>
            )}

            {repaySuccess && (
              <div className="mb-4 p-3 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{repaySuccess}</span>
              </div>
            )}

            <form onSubmit={handleRepay} className="flex flex-col gap-4">
              <div className="p-3 rounded bg-[#0B0F14] border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Facility:</span>
                  <span className="font-bold text-white">{repayLoan.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Outstanding Due:</span>
                  <span className="font-bold text-[#F3B94F]">${formatUsd(repayLoan.outstanding_balance)} USDT</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1">
                  <span className="text-[#7D8998]">Available USDT Balance:</span>
                  <span className="font-bold text-[#27C58B]">${formatUsd(usdtBalance)} USDT</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Repayment Amount (USDT) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={repayLoan.outstanding_balance}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRepayLoan(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={repaySubmitting}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  {repaySubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Repayment</span>
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
