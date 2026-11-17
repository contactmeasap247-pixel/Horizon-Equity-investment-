"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Mail,
  Share2,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Power,
  Zap,
  TrendingUp,
  Headphones,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronRight,
  X,
  Phone,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { SupportChannel, SupportWidgetConfig } from "@/app/components/FloatingSupportWidget";

interface SettingItem {
  key: string;
  value: Record<string, unknown>;
  group_name?: string;
  description?: string;
  updated_at?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // General settings state
  const [generalData, setGeneralData] = useState({
    platform_name: "Horizon Equity",
    support_email: "support@horizonequity.io",
    base_currency: "USD",
    company_address: "Horizon Towers, Financial Center, London",
  });

  // Deposit settings state
  const [depositData, setDepositData] = useState({
    min_deposit_btc: 0.001,
    min_deposit_eth: 0.02,
    min_deposit_usdt: 50.0,
    min_deposit_sol: 0.5,
    require_manual_approval: true,
  });

  // Withdrawal settings state
  const [withdrawalData, setWithdrawalData] = useState({
    min_withdrawal_usd: 50.0,
    max_withdrawal_usd: 250000.0,
    withdrawal_fee_percent: 0.5,
    requires_kyc: true,
  });

  // Phase 13: Auto-Withdrawal Settings state
  const [autoWithdrawalData, setAutoWithdrawalData] = useState({
    enabled: false,
    max_threshold: 500.0,
    requires_kyc: true,
    manual_review_above: 500.0,
    allowed_usdt: true,
    allowed_btc: false,
  });

  // Customer Support Widget State
  const [supportWidgetData, setSupportWidgetData] = useState<SupportWidgetConfig>({
    enabled: true,
    title: "Horizon Concierge Support",
    welcome_message: "How can our client desk assist your portfolio today?",
    position: "bottom-right",
    offset_x: 24,
    offset_y: 24,
    mobile_position: "bottom-right",
    mobile_offset_x: 16,
    mobile_offset_y: 16,
    show_on_mobile: true,
    show_on_desktop: true,
    draggable: true,
    visibility_scope: "both",
    channels: [],
  });

  // Support Channel Modal State
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [channelForm, setChannelForm] = useState<SupportChannel>({
    id: "",
    type: "whatsapp",
    name: "",
    value: "",
    country_code: "+44",
    description: "",
    prefilled_message: "",
    enabled: true,
    order: 1,
  });

  // Support Preview State
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        ["general", "deposits", "withdrawals", "auto_withdrawal", "support_widget", "plans"].includes(tabParam)
      ) {
        setActiveGroup(tabParam);
      }
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data);

      for (const item of res.data) {
        if (item.key === "general_settings" && item.value) {
          setGeneralData((prev) => ({ ...prev, ...item.value }));
        }
        if (item.key === "deposit_settings" && item.value) {
          setDepositData((prev) => ({ ...prev, ...item.value }));
        }
        if (item.key === "withdrawal_settings" && item.value) {
          setWithdrawalData((prev) => ({ ...prev, ...item.value }));
        }
        if (item.key === "auto_withdrawal_settings" && item.value) {
          const val = item.value as {
            enabled?: boolean;
            max_threshold?: number;
            requires_kyc?: boolean;
            manual_review_above?: number;
            allowed_currencies?: string[];
          };
          setAutoWithdrawalData({
            enabled: Boolean(val.enabled),
            max_threshold: val.max_threshold || 500,
            requires_kyc: val.requires_kyc !== undefined ? val.requires_kyc : true,
            manual_review_above: val.manual_review_above || 500,
            allowed_usdt: val.allowed_currencies?.includes("USDT") ?? true,
            allowed_btc: val.allowed_currencies?.includes("BTC") ?? false,
          });
        }
      }

      // Fetch Support Widget Configuration
      try {
        const supportRes = await api.get("/admin/support-widget");
        if (supportRes.data) {
          setSupportWidgetData(supportRes.data);
        }
      } catch {
        // retain defaults
      }
    } catch {
      setFeedback({ type: "error", msg: "Failed to load platform settings from database." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveGroup = async (key: string, payload: unknown) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await api.put(`/admin/settings/${key}`, { value: payload });
      setFeedback({ type: "success", msg: "Configuration persisted successfully." });
      fetchSettings();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to update configuration." });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSupportWidget = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.put("/admin/support-widget", { config: supportWidgetData });
      setSupportWidgetData(res.data);
      setFeedback({ type: "success", msg: "Customer Support Widget configuration persisted successfully." });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to update support widget." });
    } finally {
      setIsSaving(false);
    }
  };

  const openAddChannel = () => {
    setEditingIndex(null);
    setChannelForm({
      id: `channel-${Date.now()}`,
      type: "whatsapp",
      name: "",
      value: "",
      country_code: "+44",
      description: "",
      prefilled_message: "",
      enabled: true,
      order: supportWidgetData.channels.length + 1,
    });
    setChannelModalOpen(true);
  };

  const openEditChannel = (index: number) => {
    setEditingIndex(index);
    setChannelForm({ ...supportWidgetData.channels[index] });
    setChannelModalOpen(true);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelForm.name.trim() || !channelForm.value.trim()) return;

    const updatedChannels = [...supportWidgetData.channels];
    if (editingIndex !== null) {
      updatedChannels[editingIndex] = channelForm;
    } else {
      updatedChannels.push({
        ...channelForm,
        id: channelForm.id || `channel-${Date.now()}`,
        order: updatedChannels.length + 1,
      });
    }
    setSupportWidgetData({ ...supportWidgetData, channels: updatedChannels });
    setChannelModalOpen(false);
  };

  const handleDeleteChannel = (index: number) => {
    const updated = supportWidgetData.channels.filter((_, i) => i !== index);
    setSupportWidgetData({ ...supportWidgetData, channels: updated });
  };

  const handleToggleChannel = (index: number) => {
    const updated = [...supportWidgetData.channels];
    updated[index].enabled = !updated[index].enabled;
    setSupportWidgetData({ ...supportWidgetData, channels: updated });
  };

  const handleMoveChannel = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= supportWidgetData.channels.length) return;

    const updated = [...supportWidgetData.channels];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((c, idx) => {
      c.order = idx + 1;
    });

    setSupportWidgetData({ ...supportWidgetData, channels: updated });
  };

  const navGroups = [
    { id: "general", name: "General Brand", icon: Settings },
    { id: "deposits", name: "Deposits", icon: ArrowDownLeft },
    { id: "withdrawals", name: "Withdrawals", icon: ArrowUpRight },
    { id: "auto_withdrawal", name: "Auto-Withdrawals (Phase 13)", icon: Zap },
    { id: "support_widget", name: "Customer Support Widget", icon: Headphones },
    { id: "plans", name: "Investment Plans & Terms", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Configuration Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Platform Settings</h1>
          <p className="text-xs text-[#7D8998]">
            Configure global brand parameters, asset deposit thresholds, withdrawal controls, and autonomous payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === "success"
              ? "bg-[#27C58B]/10 border-[#27C58B]/20 text-[#27C58B]"
              : "bg-[#F06464]/10 border-[#F06464]/20 text-[#F06464]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="underline font-semibold hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 rounded-xl bg-[#111821] border border-white/10 flex items-center justify-center text-xs text-[#7D8998]">
          <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Tabs */}
          <div className="lg:col-span-4 rounded-xl bg-[#111821] border border-white/10 p-3 space-y-1">
            {navGroups.map((g) => {
              const Icon = g.icon;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGroup(g.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeGroup === g.id
                      ? "bg-[#4388F5] text-white shadow-sm"
                      : "text-[#7D8998] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Form Pane */}
          <div className="lg:col-span-8 rounded-xl bg-[#111821] border border-white/10 p-6">
            {/* GENERAL BRAND SETTINGS */}
            {activeGroup === "general" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveGroup("general_settings", generalData);
                }}
                className="space-y-4 text-xs"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">General Platform Parameters</h3>
                  <p className="text-xs text-[#7D8998]">Core brand identity and customer concierge contacts</p>
                </div>

                <div>
                  <label className="text-[#7D8998] block mb-1 font-medium">Platform Brand Name</label>
                  <input
                    type="text"
                    value={generalData.platform_name}
                    onChange={(e) => setGeneralData({ ...generalData, platform_name: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#7D8998] block mb-1 font-medium">Support Concierge Email</label>
                  <input
                    type="email"
                    value={generalData.support_email}
                    onChange={(e) => setGeneralData({ ...generalData, support_email: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Base Portfolio Currency</label>
                    <input
                      type="text"
                      value={generalData.base_currency}
                      onChange={(e) => setGeneralData({ ...generalData, base_currency: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Headquarters Address</label>
                    <input
                      type="text"
                      value={generalData.company_address}
                      onChange={(e) => setGeneralData({ ...generalData, company_address: e.target.value })}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Brand Settings</span>
                  </button>
                </div>
              </form>
            )}

            {/* DEPOSIT SETTINGS */}
            {activeGroup === "deposits" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveGroup("deposit_settings", depositData);
                }}
                className="space-y-4 text-xs"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">Deposit Minimums & Review Policy</h3>
                  <p className="text-xs text-[#7D8998]">Threshold minimums for inbound cryptocurrency transactions</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Minimum BTC Deposit</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={depositData.min_deposit_btc}
                      onChange={(e) =>
                        setDepositData({ ...depositData, min_deposit_btc: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Minimum ETH Deposit</label>
                    <input
                      type="number"
                      step="0.001"
                      value={depositData.min_deposit_eth}
                      onChange={(e) =>
                        setDepositData({ ...depositData, min_deposit_eth: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Minimum USDT Deposit</label>
                    <input
                      type="number"
                      step="1"
                      value={depositData.min_deposit_usdt}
                      onChange={(e) =>
                        setDepositData({ ...depositData, min_deposit_usdt: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Minimum SOL Deposit</label>
                    <input
                      type="number"
                      step="0.1"
                      value={depositData.min_deposit_sol}
                      onChange={(e) =>
                        setDepositData({ ...depositData, min_deposit_sol: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Require Administrative Custody Verification</span>
                    <span className="text-[10px] text-[#7D8998]">Hold deposits as pending until approved by admin</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={depositData.require_manual_approval}
                    onChange={(e) =>
                      setDepositData({ ...depositData, require_manual_approval: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Deposit Settings</span>
                  </button>
                </div>
              </form>
            )}

            {/* WITHDRAWAL SETTINGS */}
            {activeGroup === "withdrawals" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveGroup("withdrawal_settings", withdrawalData);
                }}
                className="space-y-4 text-xs"
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">Withdrawal Policies & Limits</h3>
                  <p className="text-xs text-[#7D8998]">Global limits and compliance validation for outbound transfers</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Minimum Withdrawal (USD Equivalent)</label>
                    <input
                      type="number"
                      value={withdrawalData.min_withdrawal_usd}
                      onChange={(e) =>
                        setWithdrawalData({ ...withdrawalData, min_withdrawal_usd: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Maximum Single Withdrawal</label>
                    <input
                      type="number"
                      value={withdrawalData.max_withdrawal_usd}
                      onChange={(e) =>
                        setWithdrawalData({ ...withdrawalData, max_withdrawal_usd: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#7D8998] block mb-1 font-medium">Platform Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={withdrawalData.withdrawal_fee_percent}
                    onChange={(e) =>
                      setWithdrawalData({ ...withdrawalData, withdrawal_fee_percent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Require Verified KYC Status</span>
                    <span className="text-[10px] text-[#7D8998]">Only verified identities can request withdrawals</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={withdrawalData.requires_kyc}
                    onChange={(e) =>
                      setWithdrawalData({ ...withdrawalData, requires_kyc: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Withdrawal Settings</span>
                  </button>
                </div>
              </form>
            )}

            {/* PHASE 13: AUTOMATIC WITHDRAWAL SETTINGS */}
            {activeGroup === "auto_withdrawal" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const allowedCurrencies = [];
                  if (autoWithdrawalData.allowed_usdt) allowedCurrencies.push("USDT");
                  if (autoWithdrawalData.allowed_btc) allowedCurrencies.push("BTC");
                  saveGroup("auto_withdrawal_settings", {
                    enabled: autoWithdrawalData.enabled,
                    max_threshold: autoWithdrawalData.max_threshold,
                    requires_kyc: autoWithdrawalData.requires_kyc,
                    manual_review_above: autoWithdrawalData.manual_review_above,
                    allowed_currencies: allowedCurrencies,
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#F59E0B]" />
                      <span>Automatic Withdrawal Settings (Phase 13)</span>
                    </h3>
                    <p className="text-xs text-[#7D8998]">Autonomous blockchain payout rules and safety limits</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      autoWithdrawalData.enabled
                        ? "bg-[#27C58B]/10 text-[#27C58B] border border-[#27C58B]/30"
                        : "bg-[#F06464]/10 text-[#F06464] border border-[#F06464]/30"
                    }`}
                  >
                    {autoWithdrawalData.enabled ? "Active" : "Disabled (Default Safe State)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0B0F14] border border-[#F59E0B]/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Enable Autonomous Processing</span>
                    <span className="text-[10px] text-[#7D8998]">
                      Automatically broadcast approved withdrawals under threshold
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoWithdrawalData.enabled}
                    onChange={(e) =>
                      setAutoWithdrawalData({ ...autoWithdrawalData, enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Maximum Auto Payout Limit ($)</label>
                    <input
                      type="number"
                      value={autoWithdrawalData.max_threshold}
                      onChange={(e) =>
                        setAutoWithdrawalData({
                          ...autoWithdrawalData,
                          max_threshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                      required
                    />
                    <p className="text-[10px] text-[#7D8998] mt-1">Single payout ceiling for automated queue</p>
                  </div>

                  <div>
                    <label className="text-[#7D8998] block mb-1 font-medium">Force Manual Review Above ($)</label>
                    <input
                      type="number"
                      value={autoWithdrawalData.manual_review_above}
                      onChange={(e) =>
                        setAutoWithdrawalData({
                          ...autoWithdrawalData,
                          manual_review_above: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                      required
                    />
                    <p className="text-[10px] text-[#7D8998] mt-1">Requests exceeding this require 2-step manual signoff</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 space-y-2">
                  <span className="text-[#7D8998] block font-medium">Eligible Currencies for Auto Payout:</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="checkbox"
                        checked={autoWithdrawalData.allowed_usdt}
                        onChange={(e) =>
                          setAutoWithdrawalData({ ...autoWithdrawalData, allowed_usdt: e.target.checked })
                        }
                        className="h-3.5 w-3.5 rounded accent-[#4388F5]"
                      />
                      <span>USDT (Tether USD)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="checkbox"
                        checked={autoWithdrawalData.allowed_btc}
                        onChange={(e) =>
                          setAutoWithdrawalData({ ...autoWithdrawalData, allowed_btc: e.target.checked })
                        }
                        className="h-3.5 w-3.5 rounded accent-[#4388F5]"
                      />
                      <span>BTC (Bitcoin)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Mandate Verified KYC Status</span>
                    <span className="text-[10px] text-[#7D8998]">Never auto-process withdrawals for unverified users</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoWithdrawalData.requires_kyc}
                    onChange={(e) =>
                      setAutoWithdrawalData({ ...autoWithdrawalData, requires_kyc: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#4388F5]"
                  />
                </div>

                <p className="text-[11px] text-[#7D8998] leading-relaxed">
                  Important: Enabling auto-withdrawals never retroactively dispatches existing pending requests. All
                  operations are strictly bounded by backend balance validation and recorded in transaction histories.
                </p>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Auto-Withdrawal Controls</span>
                  </button>
                </div>
              </form>
            )}

            {/* INVESTMENT PLANS & TERMS */}
            {activeGroup === "plans" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Investment Plans & Duration Governance</h3>
                    <p className="text-xs text-[#7D8998] mt-0.5">
                      Configure multi-tier portfolio options, lockup terms (strictly &le; 14 days), and ROI rates.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/admin/plans"
                    className="px-4 py-2 rounded-lg bg-[#4388F5] text-white text-xs font-semibold hover:bg-[#4388F5]/90 transition-all flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Open Plans Management Suite</span>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#C5A059]/30 space-y-2">
                  <span className="text-xs font-bold text-[#C5A059] block">14-Day Maximum Duration Mandate</span>
                  <p className="text-xs text-[#7D8998] leading-relaxed">
                    Under the platform risk governance policy, all investment contracts and portfolio tiers are bounded by an absolute maximum duration of <strong>14 Days (2 Weeks)</strong>.
                    Durations may be configured in <strong>Days (1–14)</strong> or <strong>Weeks (1–2)</strong>.
                    Server-side validations reject any configuration exceeding 14 days.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F14] border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-white block">Actions Available in Management Suite:</span>
                  <ul className="text-xs text-[#7D8998] space-y-1.5 list-disc list-inside">
                    <li>Create new investment plan tiers with customizable ROI, min/max capital, and duration.</li>
                    <li>Edit existing plans: update duration (in Days or Weeks, up to 14 days), ROI %, and boundaries.</li>
                    <li>One-click enable / disable toggle to activate or deactivate plan tiers instantly.</li>
                    <li>Existing investor contracts and contractual maturity dates remain strictly untouched.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CUSTOMER SUPPORT WIDGET MANAGEMENT SUITE */}
            {activeGroup === "support_widget" && (
              <div className="space-y-6">
                {/* Header & Master Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-[#4388F5]" />
                      <h3 className="text-base font-bold text-white">Customer Support Floating Desk</h3>
                    </div>
                    <p className="text-xs text-[#7D8998] mt-0.5">
                      Centralized multi-channel concierge launcher, positioning, visibility rules, and live contact destinations.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                        supportWidgetData.enabled
                          ? "bg-[#27C58B]/10 text-[#27C58B] border-[#27C58B]/30"
                          : "bg-white/5 text-[#7D8998] border-white/10"
                      }`}
                    >
                      {supportWidgetData.enabled ? "Desk Active" : "Deactivated"}
                    </span>

                    <button
                      type="button"
                      onClick={saveSupportWidget}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-[#4388F5] text-white text-xs font-semibold hover:bg-[#4388F5]/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>Save Configuration</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Settings and Channels Form */}
                  <div className="xl:col-span-7 space-y-6">
                    {/* General Parameters Card */}
                    <div className="p-5 rounded-xl bg-[#0B0F14] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6B0BE] border-b border-white/5 pb-2">
                        1. General Parameters & Visibility Scopes
                      </h4>

                      {/* Master Enable Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#111821] border border-white/5">
                        <div>
                          <span className="font-semibold text-white block text-xs">Enable Support Widget</span>
                          <span className="text-[11px] text-[#7D8998]">
                            Master toggle for the floating launcher across all client viewports
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={supportWidgetData.enabled}
                          onChange={(e) =>
                            setSupportWidgetData({ ...supportWidgetData, enabled: e.target.checked })
                          }
                          className="h-4 w-4 rounded accent-[#4388F5] cursor-pointer"
                        />
                      </div>

                      {/* Title & Greeting Message */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Widget Heading Title
                          </label>
                          <input
                            type="text"
                            value={supportWidgetData.title}
                            onChange={(e) =>
                              setSupportWidgetData({ ...supportWidgetData, title: e.target.value })
                            }
                            placeholder="e.g. Horizon Concierge Support"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Welcome & Inquiry Greeting
                          </label>
                          <textarea
                            rows={2}
                            value={supportWidgetData.welcome_message}
                            onChange={(e) =>
                              setSupportWidgetData({ ...supportWidgetData, welcome_message: e.target.value })
                            }
                            placeholder="e.g. How can our client desk assist your portfolio today?"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                          />
                        </div>
                      </div>

                      {/* Primary vs Secondary Visibility Scope */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <label className="text-xs font-semibold text-[#A6B0BE] block">
                          Application Display Scope
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            {
                              id: "both",
                              label: "Both Areas",
                              desc: "Investor Dashboard & Public Website",
                            },
                            {
                              id: "primary",
                              label: "Primary Only",
                              desc: "Investor Client Dashboard (/dashboard)",
                            },
                            {
                              id: "secondary",
                              label: "Secondary Only",
                              desc: "Public Marketing Pages (/)",
                            },
                          ].map((scope) => {
                            const isSel = supportWidgetData.visibility_scope === scope.id;
                            return (
                              <button
                                key={scope.id}
                                type="button"
                                onClick={() =>
                                  setSupportWidgetData({
                                    ...supportWidgetData,
                                    visibility_scope: scope.id as any,
                                  })
                                }
                                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                                  isSel
                                    ? "bg-[#4388F5]/10 border-[#4388F5] text-white"
                                    : "bg-[#111821] border-white/5 text-[#7D8998] hover:border-white/15 hover:text-white"
                                }`}
                              >
                                <span className="text-xs font-bold block">{scope.label}</span>
                                <span className="text-[10px] mt-1 opacity-80">{scope.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-[#64748B] italic mt-1">
                          Protected Routes: Administrative pages (/dashboard/admin/*) and authentication screens (/login, /register) are always protected from widget obstruction.
                        </p>
                      </div>

                      {/* Desktop & Mobile Positioning Grid */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <span className="text-xs font-semibold text-[#A6B0BE] block">
                          Corner Anchors & Pixel Offsets
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Desktop Anchor */}
                          <div className="p-3 rounded-lg bg-[#111821] border border-white/5 space-y-2">
                            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              <Monitor className="h-3.5 w-3.5 text-[#4388F5]" /> Desktop Positioning
                            </span>
                            <div>
                              <label className="text-[10px] text-[#7D8998] block mb-1">Corner Anchor</label>
                              <select
                                value={supportWidgetData.position}
                                onChange={(e) =>
                                  setSupportWidgetData({
                                    ...supportWidgetData,
                                    position: e.target.value as any,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#0B0F14] border border-white/10 text-white focus:outline-none"
                              >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-[#7D8998] block">X Offset (px)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={200}
                                  value={supportWidgetData.offset_x}
                                  onChange={(e) =>
                                    setSupportWidgetData({
                                      ...supportWidgetData,
                                      offset_x: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-xs rounded bg-[#0B0F14] border border-white/10 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-[#7D8998] block">Y Offset (px)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={200}
                                  value={supportWidgetData.offset_y}
                                  onChange={(e) =>
                                    setSupportWidgetData({
                                      ...supportWidgetData,
                                      offset_y: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-xs rounded bg-[#0B0F14] border border-white/10 text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Mobile Anchor */}
                          <div className="p-3 rounded-lg bg-[#111821] border border-white/5 space-y-2">
                            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              <Smartphone className="h-3.5 w-3.5 text-[#10B981]" /> Mobile Positioning
                            </span>
                            <div>
                              <label className="text-[10px] text-[#7D8998] block mb-1">Corner Anchor</label>
                              <select
                                value={supportWidgetData.mobile_position}
                                onChange={(e) =>
                                  setSupportWidgetData({
                                    ...supportWidgetData,
                                    mobile_position: e.target.value as any,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#0B0F14] border border-white/10 text-white focus:outline-none"
                              >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-[#7D8998] block">X Offset (px)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={200}
                                  value={supportWidgetData.mobile_offset_x}
                                  onChange={(e) =>
                                    setSupportWidgetData({
                                      ...supportWidgetData,
                                      mobile_offset_x: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-xs rounded bg-[#0B0F14] border border-white/10 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-[#7D8998] block">Y Offset (px)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={200}
                                  value={supportWidgetData.mobile_offset_y}
                                  onChange={(e) =>
                                    setSupportWidgetData({
                                      ...supportWidgetData,
                                      mobile_offset_y: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-xs rounded bg-[#0B0F14] border border-white/10 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Device and Dragging Toggles */}
                      <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="flex items-center gap-2 p-2.5 rounded bg-[#111821] border border-white/5 text-xs text-[#A6B0BE] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={supportWidgetData.draggable}
                            onChange={(e) =>
                              setSupportWidgetData({ ...supportWidgetData, draggable: e.target.checked })
                            }
                            className="h-3.5 w-3.5 rounded accent-[#4388F5]"
                          />
                          <span>Allow User Dragging</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded bg-[#111821] border border-white/5 text-xs text-[#A6B0BE] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={supportWidgetData.show_on_desktop}
                            onChange={(e) =>
                              setSupportWidgetData({ ...supportWidgetData, show_on_desktop: e.target.checked })
                            }
                            className="h-3.5 w-3.5 rounded accent-[#4388F5]"
                          />
                          <span>Desktop Viewports</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded bg-[#111821] border border-white/5 text-xs text-[#A6B0BE] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={supportWidgetData.show_on_mobile}
                            onChange={(e) =>
                              setSupportWidgetData({ ...supportWidgetData, show_on_mobile: e.target.checked })
                            }
                            className="h-3.5 w-3.5 rounded accent-[#4388F5]"
                          />
                          <span>Mobile Viewports</span>
                        </label>
                      </div>
                    </div>

                    {/* Multi-Channel Management Card */}
                    <div className="p-5 rounded-xl bg-[#0B0F14] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6B0BE]">
                            2. Configured Contact Channels ({supportWidgetData.channels.length})
                          </h4>
                          <p className="text-[11px] text-[#7D8998] mt-0.5">
                            Reorder, enable, or add channels dynamically without source code changes.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={openAddChannel}
                          className="px-3 py-1.5 rounded-lg bg-[#4388F5]/15 border border-[#4388F5]/30 text-[#4388F5] hover:bg-[#4388F5] hover:text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Channel</span>
                        </button>
                      </div>

                      {/* Channels List */}
                      {supportWidgetData.channels.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-[#111821] border border-dashed border-white/10 text-xs text-[#7D8998]">
                          No contact channels configured. Click "+ Add Channel" to add WhatsApp, Telegram, or Email support.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {supportWidgetData.channels.map((chan, idx) => (
                            <div
                              key={chan.id || idx}
                              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                                chan.enabled
                                  ? "bg-[#111821] border-white/10"
                                  : "bg-[#111821]/50 border-white/5 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Order index */}
                                <span className="text-[11px] font-mono text-[#64748B] w-4 text-center shrink-0">
                                  {idx + 1}
                                </span>

                                {/* Channel Platform Badge */}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                    chan.type === "whatsapp"
                                      ? "bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30"
                                      : chan.type === "telegram"
                                      ? "bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30"
                                      : chan.type === "email"
                                      ? "bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30"
                                      : chan.type === "phone"
                                      ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                      : "bg-[#4388F5]/15 text-[#4388F5] border border-[#4388F5]/30"
                                  }`}
                                >
                                  {chan.type}
                                </span>

                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {chan.name}
                                  </span>
                                  <span className="text-[11px] text-[#7D8998] block truncate font-mono mt-0.5">
                                    {chan.value}
                                    {chan.country_code ? ` (${chan.country_code})` : ""}
                                  </span>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Reorder Buttons */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveChannel(idx, "up")}
                                  className="p-1 rounded hover:bg-white/10 text-[#7D8998] hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === supportWidgetData.channels.length - 1}
                                  onClick={() => handleMoveChannel(idx, "down")}
                                  className="p-1 rounded hover:bg-white/10 text-[#7D8998] hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>

                                {/* Toggle Enabled */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleChannel(idx)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ml-1 ${
                                    chan.enabled
                                      ? "bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30"
                                      : "bg-white/5 text-[#64748B] hover:bg-white/10"
                                  }`}
                                >
                                  {chan.enabled ? "Active" : "Off"}
                                </button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => openEditChannel(idx)}
                                  className="p-1.5 rounded hover:bg-white/10 text-[#4388F5] hover:text-white transition cursor-pointer ml-1"
                                  title="Edit Channel"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChannel(idx)}
                                  className="p-1.5 rounded hover:bg-[#F06464]/20 text-[#F06464] transition cursor-pointer"
                                  title="Remove Channel"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Preview Card */}
                  <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-6">
                    <div className="p-4 rounded-xl bg-[#0B0F14] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-[#4388F5]" /> Real-Time Live Preview
                        </span>

                        {/* Viewport switch */}
                        <div className="flex items-center gap-1 bg-[#111821] p-0.5 rounded-lg border border-white/10">
                          <button
                            type="button"
                            onClick={() => setPreviewViewport("desktop")}
                            className={`p-1.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                              previewViewport === "desktop"
                                ? "bg-[#4388F5] text-white shadow-sm"
                                : "text-[#7D8998] hover:text-white"
                            }`}
                            title="Preview on desktop screen"
                          >
                            <Monitor className="h-3 w-3" />
                            <span className="hidden sm:inline">Desktop</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewViewport("mobile")}
                            className={`p-1.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                              previewViewport === "mobile"
                                ? "bg-[#4388F5] text-white shadow-sm"
                                : "text-[#7D8998] hover:text-white"
                            }`}
                            title="Preview on mobile device"
                          >
                            <Smartphone className="h-3 w-3" />
                            <span className="hidden sm:inline">Mobile</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#7D8998]">
                        Interactive simulation reflecting your unsaved configuration. Click the floating launcher to preview the expanded panel.
                      </p>

                      {/* Simulation Frame Container */}
                      <div
                        className={`mx-auto rounded-xl border border-white/10 bg-[#070A0E] overflow-hidden relative transition-all duration-300 shadow-inner ${
                          previewViewport === "mobile"
                            ? "w-[280px] h-[480px] border-2 border-white/20"
                            : "w-full h-[400px]"
                        }`}
                      >
                        {/* Mock App Chrome */}
                        <div className="h-7 bg-[#111821] border-b border-white/5 px-3 flex items-center justify-between text-[10px] text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                          </div>
                          <span className="font-mono text-[9px] text-[#4388F5]/80">
                            {supportWidgetData.visibility_scope === "secondary"
                              ? "horizon-equity.net"
                              : "horizon-equity.net/dashboard"}
                          </span>
                        </div>

                        {/* Mock Background Content */}
                        <div className="p-4 space-y-2.5 opacity-30 select-none pointer-events-none">
                          <div className="h-4 w-3/4 rounded bg-white/20" />
                          <div className="h-3 w-1/2 rounded bg-white/10" />
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="h-16 rounded bg-white/10" />
                            <div className="h-16 rounded bg-white/10" />
                          </div>
                        </div>

                        {/* Simulated Floating Launcher Button */}
                        {supportWidgetData.enabled && (
                          <div
                            style={{
                              position: "absolute",
                              ...(previewViewport === "mobile"
                                ? {
                                    ...(supportWidgetData.mobile_position === "bottom-right"
                                      ? { bottom: "16px", right: "16px" }
                                      : supportWidgetData.mobile_position === "bottom-left"
                                      ? { bottom: "16px", left: "16px" }
                                      : supportWidgetData.mobile_position === "top-right"
                                      ? { top: "36px", right: "16px" }
                                      : { top: "36px", left: "16px" }),
                                  }
                                : {
                                    ...(supportWidgetData.position === "bottom-right"
                                      ? { bottom: "20px", right: "20px" }
                                      : supportWidgetData.position === "bottom-left"
                                      ? { bottom: "20px", left: "20px" }
                                      : supportWidgetData.position === "top-right"
                                      ? { top: "36px", right: "20px" }
                                      : { top: "36px", left: "20px" }),
                                  }),
                            }}
                            className="z-20"
                          >
                            <button
                              type="button"
                              onClick={() => setPreviewExpanded((prev) => !prev)}
                              className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#4388F5] text-white flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 transition cursor-pointer relative"
                            >
                              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#0B0F14]" />
                              {previewExpanded ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Headphones className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Simulated Expanded Panel */}
                        {previewExpanded && supportWidgetData.enabled && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "68px",
                              right: "12px",
                              width: previewViewport === "mobile" ? "256px" : "280px",
                            }}
                            className="z-30 rounded-xl bg-[#0F172A] border border-white/15 shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div>
                                <span className="text-[11px] font-bold text-white block">
                                  {supportWidgetData.title || "Horizon Concierge Support"}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                  <span className="text-[9px] font-semibold text-[#10B981]">24/7 Desk Active</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPreviewExpanded(false)}
                                className="h-5 w-5 rounded bg-white/5 text-[#7D8998] flex items-center justify-center text-xs"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>

                            {supportWidgetData.welcome_message && (
                              <p className="text-[10px] text-[#94A3B8] leading-tight">
                                {supportWidgetData.welcome_message}
                              </p>
                            )}

                            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pt-1">
                              {supportWidgetData.channels
                                .filter((c) => c.enabled)
                                .map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-2 rounded-lg bg-[#111821] border border-white/5 flex items-center justify-between text-[10px] text-white"
                                  >
                                    <div className="truncate min-w-0 pr-1">
                                      <span className="font-bold block truncate">{c.name}</span>
                                      <span className="text-[9px] text-[#7D8998] block truncate font-mono">
                                        {c.value}
                                      </span>
                                    </div>
                                    <ChevronRight className="h-3 w-3 text-[#4388F5] shrink-0" />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADD / EDIT CHANNEL MODAL */}
                {channelModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-white/15 p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Plus className="h-4 w-4 text-[#4388F5]" />
                          <span>{editingIndex !== null ? "Edit Support Channel" : "Add New Support Channel"}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setChannelModalOpen(false)}
                          className="h-6 w-6 rounded-md bg-white/5 hover:bg-white/10 text-[#7D8998] hover:text-white flex items-center justify-center transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveChannel} className="space-y-3.5">
                        {/* Channel Type */}
                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Platform / Channel Type *
                          </label>
                          <select
                            value={channelForm.type}
                            onChange={(e) => setChannelForm({ ...channelForm, type: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                          >
                            <option value="whatsapp">WhatsApp (Direct Phone & Prefilled Text)</option>
                            <option value="telegram">Telegram (Username or URL)</option>
                            <option value="messenger">Facebook Messenger</option>
                            <option value="instagram">Instagram Direct</option>
                            <option value="email">Email Concierge Desk</option>
                            <option value="phone">Telephone Hot Line</option>
                            <option value="custom">Custom Web Link / Internal Route</option>
                            <option value="live_chat">Live Web Chat (Smartsupp)</option>
                          </select>
                        </div>

                        {/* Channel Name */}
                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Channel Display Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={channelForm.name}
                            onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                            placeholder="e.g. WhatsApp VIP Desk"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                          />
                        </div>

                        {/* Destination Value */}
                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Contact Number / Username / URL *
                          </label>
                          <input
                            type="text"
                            required
                            value={channelForm.value}
                            onChange={(e) => setChannelForm({ ...channelForm, value: e.target.value })}
                            placeholder={
                              channelForm.type === "whatsapp"
                                ? "+447451278960"
                                : channelForm.type === "telegram"
                                ? "HorizonEquitySupport"
                                : channelForm.type === "email"
                                ? "support@horizon-equity.net"
                                : channelForm.type === "phone"
                                ? "+18005550199"
                                : "https://... or /dashboard/tickets"
                            }
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                          />
                          <p className="text-[10px] text-[#64748B] mt-1">
                            {channelForm.type === "whatsapp" && "Enter phone with country code (e.g. +447451278960)."}
                            {channelForm.type === "telegram" && "Enter Telegram username without @ or full t.me link."}
                            {channelForm.type === "email" && "Enter institutional support email address."}
                            {channelForm.type === "custom" && "Enter full https:// URL or relative internal path (/dashboard/tickets)."}
                          </p>
                        </div>

                        {/* Country code for WhatsApp / Phone */}
                        {(channelForm.type === "whatsapp" || channelForm.type === "phone") && (
                          <div>
                            <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                              Country Calling Code (Optional)
                            </label>
                            <input
                              type="text"
                              value={channelForm.country_code || ""}
                              onChange={(e) => setChannelForm({ ...channelForm, country_code: e.target.value })}
                              placeholder="+44"
                              className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                            />
                          </div>
                        )}

                        {/* Short Description */}
                        <div>
                          <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                            Short Subtext / Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={channelForm.description || ""}
                            onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                            placeholder="e.g. Instant 24/7 private concierge"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                          />
                        </div>

                        {/* Prefilled message for WhatsApp / Email */}
                        {(channelForm.type === "whatsapp" || channelForm.type === "email") && (
                          <div>
                            <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                              Prefilled Message or Email Subject (Optional)
                            </label>
                            <input
                              type="text"
                              value={channelForm.prefilled_message || ""}
                              onChange={(e) => setChannelForm({ ...channelForm, prefilled_message: e.target.value })}
                              placeholder="e.g. Hello Horizon Equity desk, I need assistance with my portfolio."
                              className="w-full px-3 py-2 text-xs rounded-lg bg-[#111821] border border-white/10 text-white focus:outline-none focus:border-[#4388F5]"
                            />
                          </div>
                        )}

                        {/* Active toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#111821] border border-white/5">
                          <span className="text-xs font-semibold text-white">Enable this channel immediately</span>
                          <input
                            type="checkbox"
                            checked={channelForm.enabled}
                            onChange={(e) => setChannelForm({ ...channelForm, enabled: e.target.checked })}
                            className="h-4 w-4 rounded accent-[#4388F5] cursor-pointer"
                          />
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setChannelModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A6B0BE] transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#4388F5] hover:bg-[#4388F5]/90 text-xs font-semibold text-white transition flex items-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Save Channel</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
