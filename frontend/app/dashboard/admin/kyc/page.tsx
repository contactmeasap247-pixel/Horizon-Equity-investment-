"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  X,
  FileText,
  User,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";

interface KycSubmissionItem {
  id: string;
  email: string;
  full_name: string;
  country?: string;
  kyc_status: string;
  kyc_documents?: {
    document_type?: string;
    document_number?: string;
    full_legal_name?: string;
    date_of_birth?: string;
    nationality?: string;
    front_document?: string;
    back_document?: string;
    selfie_proof?: string;
    review_notes?: string;
  } | null;
  kyc_submitted_at?: string;
  kyc_verified_at?: string;
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Review Modal State
  const [selectedUser, setSelectedUser] = useState<KycSubmissionItem | null>(null);
  const [decision, setDecision] = useState<"verified" | "rejected" | "requires_info">("verified");
  const [reason, setReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const fetchKycQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/kyc/submissions");
      setSubmissions(res.data || []);
    } catch (e) {
      console.error("Failed to load KYC submissions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycQueue();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setReviewing(true);
      await api.post(`/admin/users/${selectedUser.id}/kyc`, {
        status: decision,
        rejection_reason: decision !== "verified" ? reason.trim() : undefined,
      });

      setActionMsg(`KYC status for ${selectedUser.full_name} updated to ${decision}.`);
      setSelectedUser(null);
      setReason("");
      fetchKycQueue();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "KYC review submission failed.");
    } finally {
      setReviewing(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (statusFilter !== "all" && s.kyc_status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.full_name.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchCountry = s.country?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCountry;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading compliance verification queue...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#27C58B]" />
            KYC Compliance Verification Queue
          </h2>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Review user identity dossiers, inspect document scans, and approve or reject withdrawal privileges.
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
          {["all", "under_review", "submitted", "pending", "verified", "rejected"].map((tab) => (
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
            placeholder="Search by name, email, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 pr-3 py-1.5 text-xs bg-[#111821] border-white/10 text-white placeholder-[#7D8998] h-9"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="panel overflow-hidden border-white/10 bg-[#111821]">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7D8998]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No KYC Submissions Found</p>
              <p className="text-xs text-[#7D8998] mt-0.5">
                No users currently match the selected compliance status.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[#7D8998] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Document Type & ID</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s) => {
                  const isVerified = s.kyc_status === "verified" || s.kyc_status === "approved";
                  const isReview = s.kyc_status === "under_review" || s.kyc_status === "submitted" || s.kyc_status === "pending";
                  const docs = s.kyc_documents;

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="block text-white font-semibold">{s.full_name}</span>
                        <span className="block text-[11px] text-[#7D8998]">{s.email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block text-white uppercase text-[11px] font-bold">
                          {docs?.document_type || "N/A"}
                        </span>
                        <span className="block text-[11px] font-mono text-[#7D8998]">
                          {docs?.document_number || "Awaiting file"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isVerified
                              ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                              : isReview
                              ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                              : "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                          }`}
                        >
                          {s.kyc_status || "Pending"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#7D8998] text-[11px]">
                        {s.kyc_submitted_at ? new Date(s.kyc_submitted_at).toLocaleString() : "Not submitted"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(s);
                            setDecision("verified");
                          }}
                          className="btn btn-primary btn-sm text-[11px] py-1 px-3"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span>Review Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel w-full max-w-lg p-6 bg-[#111821] border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#27C58B]" />
                Review Compliance Dossier: {selectedUser.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded text-[#7D8998] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Submitted Information Card */}
              <div className="p-4 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col gap-2 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7D8998] border-b border-white/5 pb-1">
                  Submitted Applicant Details
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[#7D8998] block">Legal Name:</span>
                    <span className="font-bold text-white">
                      {selectedUser.kyc_documents?.full_legal_name || selectedUser.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7D8998] block">Document Type:</span>
                    <span className="font-bold text-white uppercase">
                      {selectedUser.kyc_documents?.document_type || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7D8998] block">Document Number:</span>
                    <span className="font-mono text-white">
                      {selectedUser.kyc_documents?.document_number || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7D8998] block">Date of Birth:</span>
                    <span className="text-white">
                      {selectedUser.kyc_documents?.date_of_birth || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7D8998] block">Nationality:</span>
                    <span className="text-white">
                      {selectedUser.kyc_documents?.nationality || selectedUser.country || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7D8998] block">Account Email:</span>
                    <span className="text-white">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              {/* Review Decision Form */}
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                    Compliance Decision *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision("verified")}
                      className={`py-2 rounded-md text-xs font-bold border transition ${
                        decision === "verified"
                          ? "bg-[#27C58B]/20 border-[#27C58B] text-[#27C58B]"
                          : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision("requires_info")}
                      className={`py-2 rounded-md text-xs font-bold border transition ${
                        decision === "requires_info"
                          ? "bg-[#F3B94F]/20 border-[#F3B94F] text-[#F3B94F]"
                          : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                      }`}
                    >
                      Require Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision("rejected")}
                      className={`py-2 rounded-md text-xs font-bold border transition ${
                        decision === "rejected"
                          ? "bg-[#F06464]/20 border-[#F06464] text-[#F06464]"
                          : "bg-[#0B0F14] border-white/10 text-[#7D8998]"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {decision !== "verified" && (
                  <div>
                    <label className="text-xs font-semibold text-[#A6B0BE] block mb-1">
                      {decision === "requires_info" ? "Additional Requirements Note *" : "Rejection Reason *"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        decision === "requires_info"
                          ? "e.g. Back of document image was blurry. Please resubmit a high-resolution photo."
                          : "e.g. Document expired or name does not match account."
                      }
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs p-2.5 resize-none"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Decision</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
