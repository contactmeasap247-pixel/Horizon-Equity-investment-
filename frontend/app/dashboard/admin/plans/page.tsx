"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  Power,
  ShieldAlert,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

interface PlanItem {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount?: number | null;
  return_percentage: number;
  duration_days: number;
  duration_weeks?: number;
  referral_bonus_percentage?: number;
  is_active: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMinAmount, setFormMinAmount] = useState<string>("100");
  const [formMaxAmount, setFormMaxAmount] = useState<string>("");
  const [formReturnPct, setFormReturnPct] = useState<string>("15");
  const [durationUnit, setDurationUnit] = useState<"days" | "weeks">("days");
  const [durationValue, setDurationValue] = useState<string>("7");
  const [formReferralBonus, setFormReferralBonus] = useState<string>("5");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formSortOrder, setFormSortOrder] = useState<string>("1");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.get("/admin/investments/plans");
      setPlans(res.data || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to load investment plans." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Calculate computed days and validate <= 14 days
  const valNum = parseInt(durationValue, 10) || 0;
  const computedDays = durationUnit === "weeks" ? valNum * 7 : valNum;
  const computedWeeks = (computedDays / 7).toFixed(1);
  const isDurationValid = computedDays >= 1 && computedDays <= 14;

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormName("");
    setFormDesc("");
    setFormMinAmount("100");
    setFormMaxAmount("499");
    setFormReturnPct("15");
    setDurationUnit("days");
    setDurationValue("7");
    setFormReferralBonus("5");
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormSortOrder((plans.length + 1).toString());
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormDesc(plan.description || "");
    setFormMinAmount(plan.min_amount.toString());
    setFormMaxAmount(plan.max_amount !== null && plan.max_amount !== undefined ? plan.max_amount.toString() : "");
    setFormReturnPct(plan.return_percentage.toString());
    
    // Choose unit based on whether days divide cleanly by 7
    if (plan.duration_days % 7 === 0) {
      setDurationUnit("weeks");
      setDurationValue((plan.duration_days / 7).toString());
    } else {
      setDurationUnit("days");
      setDurationValue(plan.duration_days.toString());
    }

    setFormReferralBonus((plan.referral_bonus_percentage || 5).toString());
    setFormIsActive(plan.is_active);
    setFormIsFeatured(plan.is_featured || false);
    setFormSortOrder((plan.sort_order || 0).toString());
    setModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedback({ type: "error", msg: "Plan name is required." });
      return;
    }

    if (!isDurationValid) {
      setFeedback({
        type: "error",
        msg: "Plan duration cannot exceed 14 days (2 weeks). Must be between 1 and 14 days.",
      });
      return;
    }

    const minAmt = parseFloat(formMinAmount);
    const maxAmt = formMaxAmount.trim() ? parseFloat(formMaxAmount) : null;
    const returnPct = parseFloat(formReturnPct);
    const refBonus = parseFloat(formReferralBonus) || 5;
    const sortOrd = parseInt(formSortOrder, 10) || 0;

    if (isNaN(minAmt) || minAmt <= 0) {
      setFeedback({ type: "error", msg: "Minimum capital must be greater than zero." });
      return;
    }

    if (maxAmt !== null && maxAmt < minAmt) {
      setFeedback({ type: "error", msg: "Maximum capital cannot be less than minimum capital." });
      return;
    }

    if (isNaN(returnPct) || returnPct <= 0) {
      setFeedback({ type: "error", msg: "Return percentage must be greater than zero." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      min_amount: minAmt,
      max_amount: maxAmt,
      return_percentage: returnPct,
      duration_days: computedDays,
      duration_unit: durationUnit,
      duration_value: valNum,
      referral_bonus_percentage: refBonus,
      is_active: formIsActive,
      is_featured: formIsFeatured,
      sort_order: sortOrd,
    };

    try {
      if (editingPlan) {
        await api.put(`/admin/investments/plans/${editingPlan.id}`, payload);
        setFeedback({ type: "success", msg: `Plan '${payload.name}' updated successfully!` });
      } else {
        await api.post("/admin/investments/plans", payload);
        setFeedback({ type: "success", msg: `Plan '${payload.name}' created successfully!` });
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Operation failed. Please verify fields." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan: PlanItem) => {
    try {
      await api.patch(`/admin/investments/plans/${plan.id}/toggle-status`);
      setFeedback({
        type: "success",
        msg: `Plan '${plan.name}' is now ${plan.is_active ? "disabled" : "active"}.`,
      });
      fetchPlans();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to toggle plan status." });
    }
  };

  const handleDeletePlan = async (plan: PlanItem) => {
    if (!confirm(`Are you sure you want to permanently delete '${plan.name}'? Existing user contracts will retain their terms.`)) {
      return;
    }
    try {
      await api.delete(`/admin/investments/plans/${plan.id}`);
      setFeedback({ type: "success", msg: `Plan '${plan.name}' deleted successfully.` });
      fetchPlans();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to delete plan." });
    }
  };

  const formatDurationBadge = (days: number) => {
    if (days % 7 === 0) {
      const weeks = days / 7;
      return `${days} Days (${weeks} ${weeks === 1 ? "Week" : "Weeks"})`;
    }
    return `${days} Days`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Portfolio Strategies & Duration Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Investment Plans & Terms</h1>
          <p className="text-xs text-[#7D8998]">
            Configure yield portfolio tiers, lock-up durations (maximum 14 days / 2 weeks), ROI schedules, and capital boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPlans}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#4388F5] text-white hover:bg-[#4388F5]/90 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Plan Tier</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === "success"
              ? "bg-[#27C58B]/10 border-[#27C58B]/20 text-[#27C58B]"
              : "bg-[#F06464]/10 border-[#F06464]/20 text-[#F06464]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="underline font-semibold hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* 14-Day Maximum Governance Rule Banner */}
      <div className="rounded-xl p-4 bg-[#111821] border border-[#C5A059]/30 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-semibold text-white">Platform Duration Policy: 14-Day Absolute Maximum</h3>
          <p className="text-[#7D8998] leading-relaxed">
            All investment and lending terms are bounded by an absolute maximum duration of <strong>14 Days (2 Weeks)</strong>.
            Durations may be configured in <strong>Days</strong> (1–14) or <strong>Weeks</strong> (1–2).
            Server-side validations enforce this limit across all API endpoints. Existing active contracts retain their contractual maturity terms.
          </p>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="p-16 rounded-xl bg-[#111821] border border-white/10 flex items-center justify-center text-xs text-[#7D8998]">
          <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111821] border border-white/10 space-y-3">
          <Clock className="h-8 w-8 text-[#7D8998] mx-auto" />
          <p className="text-sm font-semibold text-white">No Investment Plans Found</p>
          <p className="text-xs text-[#7D8998]">Create your first investment plan tier with a 14-day maximum duration.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#4388F5] text-white inline-flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isExceeded = p.duration_days > 14;
            return (
              <div
                key={p.id}
                className={`rounded-xl bg-[#111821] border p-5 flex flex-col justify-between transition-all ${
                  p.is_active ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-70"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        p.is_active
                          ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                          : "bg-[#7D8998]/15 text-[#7D8998] border border-white/10"
                      }`}
                    >
                      {p.is_active ? "Active" : "Disabled"}
                    </span>
                    {p.is_featured && (
                      <span className="text-[10px] font-semibold text-[#C5A059] bg-[#C5A059]/15 border border-[#C5A059]/30 px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-[#7D8998] mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    )}
                  </div>

                  {/* ROI & Duration Highlighting */}
                  <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#7D8998]">Yield Return:</span>
                      <span className="text-lg font-bold text-[#27C58B] font-mono">+{p.return_percentage}%</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                      <span className="text-xs text-[#7D8998] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#4388F5]" />
                        Duration:
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                          isExceeded
                            ? "bg-[#F06464]/20 text-[#F06464] border border-[#F06464]/40"
                            : p.duration_days === 14
                            ? "bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30"
                            : "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                        }`}
                      >
                        {formatDurationBadge(p.duration_days)}
                        {p.duration_days === 14 && " (Max)"}
                      </span>
                    </div>
                  </div>

                  {/* Capital Limits */}
                  <div className="text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-[#7D8998]">
                      <span>Min Capital:</span>
                      <span className="text-white font-medium">${p.min_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#7D8998]">
                      <span>Max Capital:</span>
                      <span className="text-white font-medium">
                        {p.max_amount ? `$${p.max_amount.toLocaleString()}` : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#7D8998]">
                      <span>Affiliate Bonus:</span>
                      <span className="text-[#C5A059] font-medium">{p.referral_bonus_percentage || 5}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 mt-4 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      p.is_active
                        ? "border-[#F06464]/30 text-[#F06464] hover:bg-[#F06464]/10"
                        : "border-[#27C58B]/30 text-[#27C58B] hover:bg-[#27C58B]/10"
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{p.is_active ? "Disable" : "Enable"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-[#0B0F14] border border-white/10 text-[#7D8998] hover:text-white hover:border-white/20 transition-all"
                      title="Edit Plan & Duration"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p)}
                      className="p-1.5 rounded-lg bg-[#0B0F14] border border-white/10 text-[#7D8998] hover:text-[#F06464] hover:border-[#F06464]/40 transition-all"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#4388F5]" />
                <h3 className="text-base font-bold text-white">
                  {editingPlan ? `Edit ${editingPlan.name}` : "Create Investment Plan"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Plan Name & Sort */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[#7D8998] block mb-1">Plan Tier Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Silver Plan, Platinum Growth"
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[#7D8998] block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[#7D8998] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Portfolio asset allocation details and yield strategy..."
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              {/* DURATION CONFIGURATION WITH 14-DAY MAXIMUM */}
              <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#4388F5]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#4388F5]" />
                    <span>Contract Duration *</span>
                  </label>
                  <span className="text-[11px] text-[#C5A059] font-mono">Max: 14 Days (2 Weeks)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#7D8998] block mb-1">Duration Unit</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value as "days" | "weeks";
                        setDurationUnit(newUnit);
                        // Sensible default when switching
                        if (newUnit === "weeks" && parseInt(durationValue, 10) > 2) {
                          setDurationValue("2");
                        }
                      }}
                      className="w-full bg-[#111821] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#4388F5]"
                    >
                      <option value="days">Days (1 – 14 Days)</option>
                      <option value="weeks">Weeks (1 – 2 Weeks)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#7D8998] block mb-1">
                      {durationUnit === "days" ? "Number of Days (1-14)" : "Number of Weeks (1-2)"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={durationUnit === "days" ? 14 : 2}
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      className={`w-full bg-[#111821] border rounded-lg p-2 text-white font-mono text-sm focus:outline-none ${
                        !isDurationValid ? "border-[#F06464] focus:border-[#F06464]" : "border-white/10 focus:border-[#4388F5]"
                      }`}
                    />
                  </div>
                </div>

                {/* Duration Pre-computation and Limits Validation Alert */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#7D8998]">Computed Duration:</span>
                  <span className={isDurationValid ? "text-[#27C58B] font-bold" : "text-[#F06464] font-bold"}>
                    {computedDays} Days ({computedWeeks} Weeks)
                  </span>
                </div>

                {!isDurationValid && (
                  <div className="p-2.5 rounded-lg bg-[#F06464]/10 border border-[#F06464]/30 text-[#F06464] text-[11px] flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Duration cannot exceed 14 days (2 weeks). Please adjust duration within limit.</span>
                  </div>
                )}
              </div>

              {/* Yield & Capital Limits */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#7D8998] block mb-1">Return ROI % *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formReturnPct}
                    onChange={(e) => setFormReturnPct(e.target.value)}
                    placeholder="15.0"
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[#7D8998] block mb-1">Min Capital ($) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[#7D8998] block mb-1">Max Capital ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={formMaxAmount}
                    onChange={(e) => setFormMaxAmount(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
              </div>

              {/* Referral Bonus */}
              <div>
                <label className="text-[#7D8998] block mb-1">Affiliate Referral Bonus %</label>
                <input
                  type="number"
                  step="any"
                  value={formReferralBonus}
                  onChange={(e) => setFormReferralBonus(e.target.value)}
                  placeholder="5.0"
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              {/* Checkbox Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0B0F14] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                  <span className="text-white">Active for Purchase</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0B0F14] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                  <span className="text-white">Featured Badge</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isDurationValid || !formName.trim()}
                  className="px-5 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-[#4388F5]/90 transition-all"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

