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
  Plus,
  Edit2,
  Power,
  Calendar,
  Percent,
  TrendingUp,
  AlertTriangle,
  Layers,
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

interface AdminLoanProduct {
  id: string;
  name: string;
  currency: string;
  min_amount: number;
  max_amount: number;
  monthly_interest_rate: number;
  interest_rate?: number;
  duration_months: number;
  duration_days?: number;
  duration_weeks?: number;
  repayment_frequency: string;
  description?: string;
  is_active: boolean;
}

export default function AdminLoansPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "products">("applications");

  // Applications State
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

  // Products & Facility Governance State
  const [products, setProducts] = useState<AdminLoanProduct[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminLoanProduct | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCurrency, setProdCurrency] = useState("USDT");
  const [prodMinAmount, setProdMinAmount] = useState("100");
  const [prodMaxAmount, setProdMaxAmount] = useState("1000");
  const [prodInterestRate, setProdInterestRate] = useState("5.0");
  const [prodDurationUnit, setProdDurationUnit] = useState<"days" | "weeks">("days");
  const [prodDurationVal, setProdDurationVal] = useState("7");
  const [prodDesc, setProdDesc] = useState("");
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodSaving, setProdSaving] = useState(false);

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

  const fetchProducts = async () => {
    try {
      setProdLoading(true);
      const res = await api.get("/admin/loans/products");
      setProducts(res.data || []);
    } catch (e) {
      console.error("Failed to load loan products:", e);
    } finally {
      setProdLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchProducts();
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

  // Product Duration Computation with strict 14-day limit
  const prodValNum = parseInt(prodDurationVal, 10) || 1;
  const prodComputedDays = prodDurationUnit === "weeks" ? prodValNum * 7 : prodValNum;
  const isProdDurationValid = prodComputedDays >= 1 && prodComputedDays <= 14;

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCurrency("USDT");
    setProdMinAmount("100");
    setProdMaxAmount("1000");
    setProdInterestRate("5.0");
    setProdDurationUnit("days");
    setProdDurationVal("7");
    setProdDesc("");
    setProdIsActive(true);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: AdminLoanProduct) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCurrency(prod.currency || "USDT");
    setProdMinAmount(prod.min_amount.toString());
    setProdMaxAmount(prod.max_amount.toString());
    setProdInterestRate((prod.interest_rate ?? prod.monthly_interest_rate).toString());
    const days = prod.duration_days || (prod.duration_months <= 14 ? prod.duration_months : 7);
    if (days % 7 === 0) {
      setProdDurationUnit("weeks");
      setProdDurationVal((days / 7).toString());
    } else {
      setProdDurationUnit("days");
      setProdDurationVal(days.toString());
    }
    setProdDesc(prod.description || "");
    setProdIsActive(prod.is_active);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProdDurationValid) {
      alert("Duration cannot exceed 14 days (2 weeks). Must be between 1 and 14 days.");
      return;
    }
    const minAmt = parseFloat(prodMinAmount);
    const maxAmt = parseFloat(prodMaxAmount);
    const rate = parseFloat(prodInterestRate);
    if (isNaN(minAmt) || isNaN(maxAmt) || minAmt <= 0 || maxAmt < minAmt) {
      alert("Please provide valid minimum and maximum loan limits.");
      return;
    }
    if (isNaN(rate) || rate < 0) {
      alert("Interest rate must be a non-negative number.");
      return;
    }

    try {
      setProdSaving(true);
      const payload = {
        name: prodName.trim(),
        currency: prodCurrency.trim(),
        min_amount: minAmt,
        max_amount: maxAmt,
        interest_rate: rate,
        duration_days: prodComputedDays,
        repayment_frequency: "lump_sum",
        description: prodDesc.trim() || undefined,
        is_active: prodIsActive,
      };

      if (editingProduct) {
        await api.put(`/admin/loans/products/${editingProduct.id}`, payload);
        setActionMsg(`Loan product '${payload.name}' updated successfully!`);
      } else {
        await api.post("/admin/loans/products", payload);
        setActionMsg(`Loan product '${payload.name}' created successfully!`);
      }
      setProductModalOpen(false);
      fetchProducts();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save loan product.");
    } finally {
      setProdSaving(false);
    }
  };

  const handleToggleProductStatus = async (product: AdminLoanProduct) => {
    try {
      await api.patch(`/admin/loans/products/${product.id}/toggle-status`);
      setActionMsg(`Loan product '${product.name}' status toggled.`);
      fetchProducts();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to toggle status.");
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

  if (loading && products.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading platform credit facility ledger & products...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Landmark className="h-6 w-6 text-[#4388F5]" />
              Investment-Backed Loan Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30 uppercase tracking-wider font-mono">
              ≤ 14d Term Governance
            </span>
          </div>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Authoritative credit facility underwriting, flat-rate interest configuration (≤14 days), and blockchain disbursements.
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

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === "applications"
              ? "bg-[#4388F5] text-white shadow-sm"
              : "text-[#7D8998] hover:text-white bg-[#111821] border border-white/5"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Loan Applications Queue ({loans.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === "products"
              ? "bg-[#4388F5] text-white shadow-sm"
              : "text-[#7D8998] hover:text-white bg-[#111821] border border-white/5"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Facility & Tier Governance ({products.length})</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/15 text-white font-mono">≤14d</span>
        </button>
      </div>

      {/* TAB 1: LOAN APPLICATIONS QUEUE */}
      {activeTab === "applications" && (
        <div className="space-y-4">
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
                      <th className="py-3 px-4">Term & Due Date</th>
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
                          <td className="py-3.5 px-4 text-[#A6B0BE]">
                            <span className="block text-white font-medium">{l.user_name}</span>
                            <span className="block text-[10px] text-[#7D8998] font-mono">{l.user_email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white">
                              ${formatUsd(l.principal_amount)} {l.currency}
                            </span>
                            <span className="block text-[10px] text-[#27C58B]">
                              +{formatUsd(l.total_interest)} {l.currency} ({l.monthly_interest_rate}% flat)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#A6B0BE]">
                            <span className="text-white block">
                              {l.duration_months <= 14 ? `${l.duration_months} Days` : `${l.duration_months} Months`}
                            </span>
                            <span className="text-[10px] text-[#7D8998]">
                              {l.created_at ? new Date(l.created_at).toLocaleDateString() : "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono">
                            <span className={l.outstanding_balance > 0 ? "text-[#F3B94F]" : "text-[#27C58B]"}>
                              ${formatUsd(l.outstanding_balance)} {l.currency}
                            </span>
                            <span className="block text-[10px] text-[#7D8998]">
                              Repaid: ${formatUsd(l.total_repaid)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isSubmitted
                                  ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                                  : isApproved
                                  ? "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                                  : isActive
                                  ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                                  : isRepaid
                                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                  : "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                              }`}
                            >
                              {l.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {isSubmitted && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewLoan(l);
                                  setDecision("approved");
                                  setReason("");
                                }}
                                className="btn btn-secondary btn-xs font-semibold text-[#4388F5] hover:text-white"
                              >
                                Review / Decide
                              </button>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                disabled={disbursingId === l.id}
                                onClick={() => handleDisburse(l)}
                                className="btn btn-primary btn-xs font-semibold flex items-center gap-1.5"
                              >
                                {disbursingId === l.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Disbursing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3 w-3" />
                                    <span>Disburse Live</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FACILITY & TIER GOVERNANCE (≤ 14d) */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Loan Tier Term & Capital Controls</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30">
                  Enforced ≤ 14d
                </span>
              </div>
              <p className="text-xs text-[#7D8998] mt-0.5">
                Configure allowed principal ranges, flat rate interest %, and duration (1–14 days / 1–2 weeks) per facility tier.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateProduct}
              className="btn btn-primary btn-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Configure New Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => {
              const days = p.duration_days || (p.duration_months <= 14 ? p.duration_months : 7);
              const weeks = (days / 7).toFixed(1);
              const flatRate = p.interest_rate ?? p.monthly_interest_rate;

              return (
                <div
                  key={p.id}
                  className={`panel p-5 bg-[#111821] border rounded-xl flex flex-col justify-between gap-4 transition-all ${
                    p.is_active ? "border-white/10" : "border-white/5 opacity-60 bg-[#0B0F14]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          p.is_active
                            ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                            : "bg-[#7D8998]/15 text-[#7D8998] border border-[#7D8998]/30"
                        }`}
                      >
                        {p.is_active ? "Applications Active" : "Disabled"}
                      </span>
                    </div>

                    <p className="text-xs text-[#7D8998] min-h-[32px]">
                      {p.description || "Credit liquidity advance for verified active investors."}
                    </p>

                    <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-[#7D8998]">
                        <span>Principal Limits:</span>
                        <span className="text-white font-bold">
                          ${formatUsd(p.min_amount)} – ${formatUsd(p.max_amount)} {p.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#7D8998]">
                        <span>Interest Rate:</span>
                        <span className="text-[#27C58B] font-bold">{flatRate}% Flat</span>
                      </div>
                      <div className="flex justify-between text-[#7D8998]">
                        <span>Allowed Duration:</span>
                        <span className="text-[#4388F5] font-bold">
                          {days} Days ({weeks} wks)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleProductStatus(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                        p.is_active
                          ? "bg-[#F06464]/10 text-[#F06464] hover:bg-[#F06464] hover:text-white"
                          : "bg-[#27C58B]/10 text-[#27C58B] hover:bg-[#27C58B] hover:text-white"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      <span>{p.is_active ? "Disable" : "Enable"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#151F2B] hover:bg-[#4388F5] text-white transition text-xs font-semibold"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Tier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOAN PRODUCT CONFIGURATION MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">
                  {editingProduct ? `Edit Tier: ${editingProduct.name}` : "Configure New Loan Tier"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#7D8998] block mb-1">Tier Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Micro Capital Advance"
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#7D8998] block mb-1">Minimum Amount ($) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={prodMinAmount}
                    onChange={(e) => setProdMinAmount(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[#7D8998] block mb-1">Maximum Amount ($) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={prodMaxAmount}
                    onChange={(e) => setProdMaxAmount(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Flat Interest Rate (%) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={prodInterestRate}
                  onChange={(e) => setProdInterestRate(e.target.value)}
                  placeholder="5.0"
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                />
                <p className="text-[11px] text-[#7D8998] mt-1">
                  Flat one-time interest applied to principal (e.g. 15% on $1,000 = $150 interest, $1,150 total due).
                </p>
              </div>

              {/* DURATION CONFIGURATION WITH 14-DAY MAXIMUM */}
              <div className="p-3.5 rounded-lg bg-[#0B0F14] border border-[#4388F5]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#4388F5]" />
                    <span>Repayment Duration *</span>
                  </label>
                  <span className="text-[11px] text-[#C5A059] font-mono">Max: 14 Days (2 Weeks)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#7D8998] block mb-1">Duration Unit</label>
                    <select
                      value={prodDurationUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value as "days" | "weeks";
                        setProdDurationUnit(newUnit);
                        if (newUnit === "weeks" && parseInt(prodDurationVal, 10) > 2) {
                          setProdDurationVal("2");
                        }
                      }}
                      className="w-full bg-[#111821] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                    >
                      <option value="days">Days (1–14 Days)</option>
                      <option value="weeks">Weeks (1–2 Weeks)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#7D8998] block mb-1">
                      {prodDurationUnit === "days" ? "Number of Days (1-14)" : "Number of Weeks (1-2)"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={prodDurationUnit === "days" ? 14 : 2}
                      value={prodDurationVal}
                      onChange={(e) => setProdDurationVal(e.target.value)}
                      className={`w-full bg-[#111821] border rounded-lg p-2 text-white font-mono text-sm focus:outline-none ${
                        !isProdDurationValid ? "border-[#F06464]" : "border-white/10 focus:border-[#4388F5]"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-[#7D8998]">Calculated Duration:</span>
                  <span className={isProdDurationValid ? "text-[#27C58B] font-bold" : "text-[#F06464] font-bold"}>
                    {prodComputedDays} Days ({prodDurationUnit === "weeks" ? `${prodValNum} Week(s)` : `${prodComputedDays} Day(s)`})
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Facility underwriting terms, collateral qualifications..."
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0B0F14] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                  <span className="text-white font-medium">Enable for Investor Applications</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prodSaving || !isProdDurationValid}
                  className="px-4 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {prodSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Loan Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW APPLICATION MODAL */}
      {reviewLoan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-[#111821] border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#4388F5]" />
                Underwriting Decision: {reviewLoan.reference}
              </h3>
              <button
                type="button"
                onClick={() => setReviewLoan(null)}
                className="text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-[#0B0F14] p-3 rounded border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#A6B0BE]">
                <span>Borrower:</span>
                <span className="text-white">{reviewLoan.user_name}</span>
              </div>
              <div className="flex justify-between text-[#A6B0BE]">
                <span>Principal:</span>
                <span className="text-[#4388F5] font-bold">
                  ${formatUsd(reviewLoan.principal_amount)} {reviewLoan.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#A6B0BE]">
                <span>Interest:</span>
                <span className="text-[#27C58B]">
                  ${formatUsd(reviewLoan.total_interest)} {reviewLoan.currency} ({reviewLoan.monthly_interest_rate}% flat)
                </span>
              </div>
              <div className="flex justify-between text-[#A6B0BE]">
                <span>Total Repayment:</span>
                <span className="text-white font-bold">
                  ${formatUsd(reviewLoan.total_repayment)} {reviewLoan.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#A6B0BE]">
                <span>Duration Term:</span>
                <span className="text-white">
                  {reviewLoan.duration_months <= 14 ? `${reviewLoan.duration_months} Days` : `${reviewLoan.duration_months} Months`}
                </span>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-2">
                  Compliance Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("approved")}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition ${
                      decision === "approved"
                        ? "bg-[#27C58B]/20 border-[#27C58B] text-[#27C58B]"
                        : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                    }`}
                  >
                    Approve Facility
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("declined")}
                    className={`py-2 px-3 rounded text-xs font-semibold border transition ${
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
