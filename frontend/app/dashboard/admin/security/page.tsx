"use client";

import { useEffect, useState } from "react";
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Power,
  KeyRound,
  FileText,
  Clock,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSecurityPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(30);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Confirmation modal for toggling maintenance mode
  const [confirmMaintenanceModal, setConfirmMaintenanceModal] = useState(false);
  const [targetMaintenanceState, setTargetMaintenanceState] = useState(false);

  useEffect(() => {
    async function loadSecuritySettings() {
      setIsLoading(true);
      try {
        const res = await api.get("/admin/settings");
        const secSetting = res.data.find((s: { key: string }) => s.key === "security_settings");
        if (secSetting && secSetting.value) {
          setMaintenanceMode(Boolean(secSetting.value.maintenance_mode));
          setMaintenanceMessage(
            secSetting.value.maintenance_message ||
              "Horizon Equity is currently undergoing scheduled platform maintenance. Please check back shortly."
          );
          setTwoFactorEnforced(Boolean(secSetting.value.two_factor_enforced));
          setMaxLoginAttempts(secSetting.value.max_login_attempts || 5);
          setLockoutDuration(secSetting.value.lockout_duration_minutes || 30);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadSecuritySettings();
  }, []);

  const saveSecurityControls = async (overrideMaintenance?: boolean) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const modeToSave = overrideMaintenance !== undefined ? overrideMaintenance : maintenanceMode;
      await api.put("/admin/settings/security_settings", {
        value: {
          maintenance_mode: modeToSave,
          maintenance_message: maintenanceMessage,
          two_factor_enforced: twoFactorEnforced,
          max_login_attempts: maxLoginAttempts,
          lockout_duration_minutes: lockoutDuration,
        },
      });

      setMaintenanceMode(modeToSave);
      setFeedback({
        type: "success",
        msg: "Security parameters and operational controls updated successfully in database.",
      });
      setConfirmMaintenanceModal(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to update security settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceToggleRequest = (enable: boolean) => {
    setTargetMaintenanceState(enable);
    setConfirmMaintenanceModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              System Controls
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Security & System Controls</h1>
          <p className="text-xs text-[#7D8998]">
            Manage platform-level maintenance mode, enforce authentication policies, and set login protection controls.
          </p>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real Backend Maintenance Mode Control Box */}
          <div className="rounded-xl bg-[#111821] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    maintenanceMode ? "bg-[#F06464]/10 text-[#F06464]" : "bg-[#27C58B]/10 text-[#27C58B]"
                  }`}
                >
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">System Maintenance Mode</h3>
                  <p className="text-xs text-[#7D8998]">
                    Current Status:{" "}
                    <span className={maintenanceMode ? "text-[#F06464] font-bold" : "text-[#27C58B] font-bold"}>
                      {maintenanceMode ? "ACTIVE (Public Access Suspended)" : "INACTIVE (Normal Operations)"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#7D8998] leading-relaxed">
              When Maintenance Mode is active, all public investor endpoints receive a{" "}
              <span className="font-mono text-white">503 Service Unavailable</span> status code, shielding live
              financial balances during upgrades. Administrative endpoints and authorization sessions remain accessible.
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-[#7D8998] block font-medium">Public Maintenance Notice:</label>
              <textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5] h-20 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              {maintenanceMode ? (
                <button
                  type="button"
                  onClick={() => handleMaintenanceToggleRequest(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#27C58B] text-black font-semibold text-xs flex items-center gap-2 hover:bg-[#27C58B]/90 transition-all"
                >
                  <Power className="h-4 w-4" />
                  <span>Disable Maintenance Mode (Resume Operations)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMaintenanceToggleRequest(true)}
                  className="px-4 py-2.5 rounded-lg bg-[#F06464] text-white font-semibold text-xs flex items-center gap-2 hover:bg-[#F06464]/90 transition-all"
                >
                  <Power className="h-4 w-4" />
                  <span>Activate Maintenance Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Authentication & Login Security Policies */}
          <div className="rounded-xl bg-[#111821] border border-white/10 p-6 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#4388F5]/10 text-[#4388F5]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Authentication & Account Policies</h3>
                <p className="text-xs text-[#7D8998]">Lockout thresholds and account verification requirements</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                <div>
                  <span className="font-semibold text-white block">Enforce Two-Factor Authentication</span>
                  <span className="text-[10px] text-[#7D8998]">Mandate 2FA for all client withdrawals</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnforced}
                  onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#4388F5]"
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1 font-medium">Max Failed Login Attempts Before Lockout</label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value) || 5)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1 font-medium">Account Lockout Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => saveSecurityControls()}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Security Parameters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR MAINTENANCE MODE */}
      {confirmMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  targetMaintenanceState ? "bg-[#F06464]/10 text-[#F06464]" : "bg-[#27C58B]/10 text-[#27C58B]"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {targetMaintenanceState ? "Confirm Maintenance Mode Activation" : "Confirm Platform Re-activation"}
                </h3>
                <p className="text-xs text-[#7D8998]">Authoritative Administrative Action</p>
              </div>
            </div>

            <p className="text-xs text-[#7D8998] leading-relaxed">
              {targetMaintenanceState
                ? "Are you sure you want to activate Platform Maintenance Mode? Ordinary user requests across the client dashboard will be temporarily halted with a 503 response until you disable it."
                : "Are you sure you want to disable Maintenance Mode? Ordinary investor transactions will be immediately resumed."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setConfirmMaintenanceModal(false)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveSecurityControls(targetMaintenanceState)}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 text-white disabled:opacity-50 ${
                  targetMaintenanceState ? "bg-[#F06464]" : "bg-[#27C58B] text-black"
                }`}
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {targetMaintenanceState ? "Yes, Activate Maintenance" : "Yes, Resume Operations"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
