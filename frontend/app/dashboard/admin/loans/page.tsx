"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  DollarSign,
  ArrowRight,
  X,
  FileText,
  ShieldCheck,
  Send,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatUsd } from "@/lib/format";

interface AdminLoanItem {
  id: string;
  reference: string;
  user_id: string;
  user_name: string;
  user_email: string;
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
  created_at?: string;
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<AdminLoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Review Modal
  const [reviewLoan, setReviewLoan] = useState<AdminLoanItem | null>(null);
  const [decision, setDecision] = useState<"approved" | "declined" | "requires_info">("approved");
  const [reason, setReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Disburse State
  const [disbursingId, setDisbursingId] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/loans");
      setLoans(res.data || []);
    } catch (e) {
      console.error("Failed to load admin loans:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewLoan) return;

    try {
      setReviewing(true);
      await api.post(`/admin/loans/${reviewLoan.id}/review`, {
        status: decision,
        decline_reason: decision !== "approved" ? reason.trim() : undefined,
      });

      setActionMsg(`Loan ${reviewLoan.reference} marked as ${decision}.`);
      setReviewLoan(null);
      setReason("");
      fetchLoans();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Review action failed.");
    } finally {
      setReviewing(false);
    }
  };

  const handleDisburse = async (loan: AdminLoanItem) => {
    if (!confirm(`Confirm disbursement of $${loan.principal_amount} ${loan.currency} to ${loan.user_name} (${loan.user_email})? This will credit their live wallet balance immediately.`)) {
      return;
    }

    try {
      setDisbursingId(loan.id);
      await api.post(`/admin/loans/${loan.id}/disburse`);
      setActionMsg(`Loan ${loan.reference} disbursed successfully! Credited borrower's USDT wallet.`);
      fetchLoans();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Disbursement failed.");
    } finally {
      setDisbursingId(null);
    }
  };

  const filtered = loans.filter((l) => {
    if (statusFilter !== "all" && l.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = l.reference.toLowerCase().includes(q);
      const matchName = l.user_name.toLowerCase().includes(q);
      const matchEmail = l.user_email.toLowerCase().includes(q);
      const matchProd = l.product_name.toLowerCase().includes(q);
      return matchRef || matchName || matchEmail || matchProd;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading platform credit facility ledger...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[#4388F5]" />
            Investment-Backed Loan Management
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Authoritative administrative underwriting, credit facility approvals, and blockchain capital disbursements.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="btn btn-secondary btn-sm font-semibold self-start sm:self-auto"
        >
          <span>Return to Admin Overview</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#111821] p-1 rounded-lg border border-white/10 self-start overflow-x-auto max-w-full">
          {["all", "submitted", "approved", "active", "fully_repaid", "declined"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition shrink-0 ${
                statusFilter === tab
                  ? "bg-[#4388F5] text-white shadow-sm"
                  : "text-[#7D8998] hover:text-white"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by user, email, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 pr-3 py-1.5 text-xs bg-[#111821] border-white/10 text-white placeholder-[#7D8998] h-9"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="panel overflow-hidden border-white/10 bg-[#111821]">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No Loan Records Found</p>
              <p className="text-xs text-[#7D8998] mt-0.5">
                No applications currently match the active filter criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[#7D8998] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Reference & Product</th>
                  <th className="py-3 px-4">Borrower Details</th>
                  <th className="py-3 px-4">Principal & Interest</th>
                  <th className="py-3 px-4">Outstanding Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((l) => {
                  const isSubmitted = l.status === "submitted" || l.status === "under_review";
                  const isApproved = l.status === "approved";
                  const isActive = l.status === "active";
                  const isRepaid = l.status === "fully_repaid";

                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="block text-white font-mono text-xs">{l.reference}</span>
                        <span className="block text-[10px] text-[#A6B0BE]">{l.product_name}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block text-white font-semibold">{l.user_name}</span>
                        <span className="block text-[11px] text-[#7D8998]">{l.user_email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">${formatUsd(l.principal_amount)}</span>
                          <span className="text-[10px] text-[#27C58B]">({l.monthly_interest_rate}%/mo)</span>
                        </div>
                        <span className="text-[10px] text-[#7D8998] block">
                          Total Repayment: ${formatUsd(l.total_repayment)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${l.outstanding_balance > 0 ? "text-[#F3B94F]" : "text-[#27C58B]"}`}>
                          ${formatUsd(l.outstanding_balance)} USDT
                        </span>
                        <span className="text-[10px] text-[#7D8998] block">
                          Repaid: ${formatUsd(l.total_repaid || 0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved || isActive
                              ? "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                              : isRepaid
                              ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                              : isSubmitted
                              ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                              : "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                          }`}
                        >
                          {l.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSubmitted && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewLoan(l);
                                setDecision("approved");
                              }}
                              className="btn btn-primary btn-sm text-[11px] py-1 px-2.5"
                            >
                              <span>Review</span>
                            </button>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              disabled={disbursingId === l.id}
                              onClick={() => handleDisburse(l)}
                              className="btn btn-secondary btn-sm text-[11px] py-1 px-2.5 bg-[#27C58B]/20 text-[#27C58B] border-[#27C58B]/40 hover:bg-[#27C58B]/30 flex items-center gap-1"
                            >
                              {disbursingId === l.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              <span>Disburse</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewLoan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel w-full max-w-md p-6 bg-[#111821] border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#4388F5]" />
                Underwrite Loan: {reviewLoan.reference}
              </h3>
              <button
                type="button"
                onClick={() => setReviewLoan(null)}
                className="p-1 rounded text-[#7D8998] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="p-3 rounded bg-[#0B0F14] border border-white/10 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Borrower:</span>
                  <span className="font-bold text-white">{reviewLoan.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Requested Principal:</span>
                  <span className="font-bold text-[#4388F5]">${formatUsd(reviewLoan.principal_amount)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Term & Interest:</span>
                  <span className="font-medium text-white">{reviewLoan.duration_months} Months ({reviewLoan.monthly_interest_rate}%/mo)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                  Underwriting Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("approved")}
                    className={`py-2 rounded-md text-xs font-bold border transition ${
                      decision === "approved"
                        ? "bg-[#27C58B]/20 border-[#27C58B] text-[#27C58B]"
                        : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                    }`}
                  >
                    Approve Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("declined")}
                    className={`py-2 rounded-md text-xs font-bold border transition ${
                      decision === "declined"
                        ? "bg-[#F06464]/20 border-[#F06464] text-[#F06464]"
                        : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                    }`}
                  >
                    Decline Application
                  </button>
                </div>
              </div>

              {decision === "declined" && (
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Decline Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide reason for declining this credit facility..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs p-2.5 resize-none"
                    required={decision === "declined"}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReviewLoan(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  {reviewing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Save Decision</span>
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
