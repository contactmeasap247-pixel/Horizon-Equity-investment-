"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { api } from "@/lib/api";

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

  const navGroups = [
    { id: "general", name: "General Brand", icon: Settings },
    { id: "deposits", name: "Deposits", icon: ArrowDownLeft },
    { id: "withdrawals", name: "Withdrawals", icon: ArrowUpRight },
    { id: "auto_withdrawal", name: "Auto-Withdrawals (Phase 13)", icon: Zap },
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
          </div>
        </div>
      )}
    </div>
  );
}
