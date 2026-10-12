"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Send,
  AlertTriangle,
  CheckCircle2,
  Users,
  User,
  Loader2,
  RefreshCw,
  Clock,
  Shield,
  Radio,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [notifType, setNotifType] = useState<"system" | "announcement" | "alert">("announcement");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // System alert feed
  const [pendingStats, setPendingStats] = useState<{
    pending_withdrawals: number;
    pending_deposits: number;
    kyc_pending: number;
  }>({ pending_withdrawals: 0, pending_deposits: 0, kyc_pending: 0 });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const res = await api.get("/admin/stats");
      setPendingStats({
        pending_withdrawals: res.data.pending_withdrawals_count || 0,
        pending_deposits: res.data.pending_deposits_count || 0,
        kyc_pending: res.data.kyc_pending || 0,
      });
    } catch {
      // ignore
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: "error", msg: "Title and message content are required." });
      return;
    }
    if (targetType === "single" && !targetUserId.trim()) {
      setFeedback({ type: "error", msg: "Please specify target User ID." });
      return;
    }

    setIsSending(true);
    try {
      const res = await api.post("/admin/notifications/broadcast", {
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        target_user_id: targetType === "single" ? targetUserId.trim() : null,
      });

      setFeedback({
        type: "success",
        msg: `Notification broadcast sent successfully to ${res.data.recipients_count} user(s).`,
      });
      setTitle("");
      setMessage("");
      setTargetUserId("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to dispatch broadcast." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Alerts & Broadcast
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Platform Notifications</h1>
          <p className="text-xs text-[#7D8998]">
            Transmit urgent in-app system notices, audit platform alerts, and broadcast announcements to investors.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoadingFeed ? "animate-spin" : ""}`} />
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

      {/* Actionable Platform Alerts Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#7D8998]">Pending Withdrawal Requests</div>
            <div className="text-xl font-bold text-[#F59E0B] mt-1 font-mono">
              {pendingStats.pending_withdrawals} pending
            </div>
          </div>
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
        </div>

        <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#7D8998]">Pending Deposit Verifications</div>
            <div className="text-xl font-bold text-[#4388F5] mt-1 font-mono">
              {pendingStats.pending_deposits} pending
            </div>
          </div>
          <Bell className="h-5 w-5 text-[#4388F5]" />
        </div>

        <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#7D8998]">KYC Documents Pending</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {pendingStats.kyc_pending} submissions
            </div>
          </div>
          <Shield className="h-5 w-5 text-[#27C58B]" />
        </div>
      </div>

      {/* Broadcast Composer */}
      <div className="rounded-xl bg-[#111821] border border-white/10 p-6 space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#4388F5]" />
              <span>In-App Announcement Composer</span>
            </h3>
            <p className="text-xs text-[#7D8998]">Dispatches live notification cards straight to investor portal bells</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#7D8998] block mb-1 font-medium">Recipients Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`p-2.5 rounded-lg border text-center font-medium flex items-center justify-center gap-2 transition-all ${
                    targetType === "all"
                      ? "bg-[#4388F5] border-[#4388F5] text-white"
                      : "bg-[#0B0F14] border-white/10 text-[#7D8998] hover:text-white"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>All Active Investors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("single")}
                  className={`p-2.5 rounded-lg border text-center font-medium flex items-center justify-center gap-2 transition-all ${
                    targetType === "single"
                      ? "bg-[#4388F5] border-[#4388F5] text-white"
                      : "bg-[#0B0F14] border-white/10 text-[#7D8998] hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Specific User ID</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#7D8998] block mb-1 font-medium">Notification Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as "system" | "announcement" | "alert")}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
              >
                <option value="announcement">Platform Announcement</option>
                <option value="system">System Notification</option>
                <option value="alert">Security / Urgent Alert</option>
              </select>
            </div>
          </div>

          {targetType === "single" && (
            <div>
              <label className="text-[#7D8998] block mb-1 font-medium">Target User UUID</label>
              <input
                type="text"
                placeholder="e.g. 0e62cc22-3f1b-46de-9917-6c5c3911bece"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4388F5]"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[#7D8998] block mb-1 font-medium">Notification Subject / Heading</label>
            <input
              type="text"
              placeholder="e.g. Scheduled Network Upgrade Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
              required
            />
          </div>

          <div>
            <label className="text-[#7D8998] block mb-1 font-medium">Announcement Message Body</label>
            <textarea
              placeholder="Detail the message text here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#4388F5] h-28"
              required
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Transmit Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
