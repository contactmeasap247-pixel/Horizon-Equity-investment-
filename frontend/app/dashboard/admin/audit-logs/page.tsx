"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  Shield,
  Eye,
  Clock,
  Terminal,
} from "lucide-react";
import { api } from "@/lib/api";

interface AuditLogItem {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchAction, setSearchAction] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 25;

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchAction.trim()) params.append("action", searchAction.trim());
      if (entityFilter !== "all") params.append("entity_type", entityFilter);
      params.append("limit", limit.toString());
      params.append("offset", (page * limit).toString());

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.items);
      setTotal(res.data.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Failed to load audit logs from database.");
    } finally {
      setIsLoading(false);
    }
  }, [searchAction, entityFilter, page]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Security & Compliance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Audit Logs</h1>
          <p className="text-xs text-[#7D8998]">
            Immutable trace of administrative actions, balance adjustments, security policies, and parameter updates.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111821] border border-white/10 text-[#F5F7FA] hover:border-white/20 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#4388F5] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111821] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#7D8998]" />
          <input
            type="text"
            placeholder="Search by action name (e.g. balance, kyc)..."
            value={searchAction}
            onChange={(e) => {
              setSearchAction(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#7D8998] focus:outline-none focus:border-[#4388F5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-[#7D8998]" />
          <span className="text-xs text-[#7D8998]">Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
            className="bg-[#0B0F14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4388F5]"
          >
            <option value="all">All Entities</option>
            <option value="user">User</option>
            <option value="wallet">Wallet</option>
            <option value="withdrawal_request">Withdrawal Request</option>
            <option value="investment">Investment</option>
            <option value="site_setting">Site Setting</option>
            <option value="email_template">Email Template</option>
            <option value="notification">Notification</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl bg-[#111821] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-[#7D8998] text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#4388F5]" />
            <span>Scanning audit ledger...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#F06464]">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7D8998]">
            No audit records match the current filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F14]/50 text-[#7D8998]">
                  <th className="p-3.5 font-medium">Action Performed</th>
                  <th className="p-3.5 font-medium">Entity Type</th>
                  <th className="p-3.5 font-medium">Target Entity ID</th>
                  <th className="p-3.5 font-medium">IP Address</th>
                  <th className="p-3.5 font-medium">Timestamp</th>
                  <th className="p-3.5 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono text-white font-semibold">
                      {log.action}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[#151F2B] border border-white/5 text-[#4388F5]">
                        {log.entity_type || "System"}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#7D8998]">
                      {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : "--"}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#7D8998]">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                    <td className="p-3.5 text-[#7D8998] font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-[#151F2B] hover:bg-[#4388F5] hover:text-white text-[#4388F5] transition-all font-medium text-[11px]"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-white/10 bg-[#0B0F14]/30 flex items-center justify-between text-xs text-[#7D8998]">
          <span>
            Showing {logs.length} of {total} audit records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1 rounded bg-[#151F2B] text-[#F5F7FA] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-white">Page {page + 1}</span>
            <button
              type="button"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-[#151F2B] text-[#F5F7FA] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT LOG INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">Audit Event Inspection</h3>
              </div>
              <button type="button" onClick={() => setSelectedLog(null)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F14] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Event Action:</span>
                <span className="text-white font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Entity Type:</span>
                <span className="text-[#4388F5]">{selectedLog.entity_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Target ID:</span>
                <span className="text-white">{selectedLog.entity_id || "--"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8998]">Timestamp:</span>
                <span className="text-[#7D8998]">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Changed Values Diff */}
            <div className="space-y-2 text-xs">
              <span className="text-[#7D8998] font-semibold block">State Payload / Changes:</span>
              <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5 max-h-48 overflow-y-auto">
                <pre className="text-[11px] font-mono text-[#27C58B] whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.new_values || selectedLog.old_values || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-xs text-[#7D8998] hover:text-white"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
