"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  UserCheck,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface KycStatusData {
  status: string;
  submitted_at: string | null;
  verified_at: string | null;
  submission_data: {
    document_type?: string;
    full_legal_name?: string;
    nationality?: string;
    date_of_birth?: string;
    submitted_fields?: string[];
  } | null;
  rejection_reason: string | null;
  instructions: string;
}

export default function VerificationPage() {
  const { user, setUser } = useAuthStore();
  const [kycData, setKycData] = useState<KycStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Form states
  const [docType, setDocType] = useState("passport");
  const [docNumber, setDocNumber] = useState("");
  const [legalName, setLegalName] = useState(user?.full_name || "");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState(user?.country || "");
  const [frontDocName, setFrontDocName] = useState("");
  const [frontDocBase64, setFrontDocBase64] = useState("");
  const [backDocName, setBackDocName] = useState("");
  const [backDocBase64, setBackDocBase64] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [selfieBase64, setSelfieBase64] = useState("");
  const [agreementChecked, setAgreementChecked] = useState(false);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/kyc");
      setKycData(res.data);
    } catch {
      setFormError("Failed to fetch KYC compliance telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setName: (name: string) => void,
    setBase64: (data: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("File size exceeds 5MB limit. Please upload a smaller document image.");
      return;
    }

    setName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!docNumber.trim() || !legalName.trim() || !dob.trim() || !nationality.trim()) {
      setFormError("Please fill out all mandatory legal identification fields.");
      return;
    }

    if (!agreementChecked) {
      setFormError("You must attest that the submitted legal information is genuine.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        document_type: docType,
        document_number: docNumber.trim(),
        full_legal_name: legalName.trim(),
        date_of_birth: dob.trim(),
        nationality: nationality.trim(),
        front_document: frontDocBase64 || "doc_front_attached",
        back_document: backDocBase64 || undefined,
        selfie_proof: selfieBase64 || undefined,
      };

      const res = await api.post("/users/kyc/submit", payload);
      setKycData(res.data);
      setFormSuccess("Verification documentation submitted successfully! Our compliance team will review your file.");
      
      // Update local auth store user status
      if (user) {
        setUser({ ...user, kyc_status: "under_review" });
      }
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to submit verification file.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4388F5]" />
        <p className="text-xs text-[#7D8998]">Loading verification compliance records...</p>
      </div>
    );
  }

  const status = kycData?.status || user?.kyc_status || "not_started";
  const isVerified = status === "verified" || status === "approved";
  const isUnderReview = status === "under_review" || status === "submitted" || status === "pending";
  const isRejected = status === "rejected";
  const isRequiresInfo = status === "requires_info";

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Identity Verification (KYC)
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isVerified
                  ? "bg-[#27C58B]/15 text-[#27C58B] border border-[#27C58B]/30"
                  : isUnderReview
                  ? "bg-[#F3B94F]/15 text-[#F3B94F] border border-[#F3B94F]/30"
                  : isRejected
                  ? "bg-[#F06464]/15 text-[#F06464] border border-[#F06464]/30"
                  : "bg-white/10 text-[#A6B0BE] border border-white/10"
              }`}
            >
              {isVerified
                ? "Verified"
                : isUnderReview
                ? "Under Review"
                : isRejected
                ? "Rejected"
                : isRequiresInfo
                ? "Action Required"
                : "Not Started"}
            </span>
          </div>
          <p className="text-xs text-[#A6B0BE] mt-1">
            Global regulatory compliance ensures institutional security, asset custody protection, and unlocks full withdrawal capability.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-secondary btn-sm font-semibold self-start sm:self-auto"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Status Banner */}
      {isVerified ? (
        <div className="panel p-6 border-[#27C58B]/40 bg-[#27C58B]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#27C58B]/20 border border-[#27C58B]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-[#27C58B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Verification Successful
                <CheckCircle2 className="h-4 w-4 text-[#27C58B]" />
              </h3>
              <p className="text-xs text-[#A6B0BE] mt-0.5">
                Your account is fully compliant with institutional KYC requirements. Cryptocurrency withdrawals and capital advances are unrestricted.
              </p>
              {kycData?.verified_at && (
                <p className="text-[11px] text-[#7D8998] mt-1">
                  Verified timestamp: {new Date(kycData.verified_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/withdrawals" className="btn btn-primary btn-sm">
              <span>Initiate Withdrawal</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      ) : isUnderReview ? (
        <div className="panel p-6 border-[#F3B94F]/40 bg-[#F3B94F]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#F3B94F]/20 border border-[#F3B94F]/40 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-[#F3B94F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verification Under Review</h3>
              <p className="text-xs text-[#A6B0BE] mt-0.5">
                {kycData?.instructions ||
                  "Your identification dossier is currently in our compliance queue. Submissions are processed within 24 business hours."}
              </p>
              {kycData?.submitted_at && (
                <p className="text-[11px] text-[#7D8998] mt-1">
                  Submitted: {new Date(kycData.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-[#F3B94F]/10 text-[#F3B94F] font-semibold">
            In Queue
          </span>
        </div>
      ) : isRejected || isRequiresInfo ? (
        <div className="panel p-6 border-[#F06464]/40 bg-[#F06464]/5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-[#F06464] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#F06464]">
                {isRequiresInfo ? "Additional Compliance Information Required" : "Verification Not Approved"}
              </h3>
              <p className="text-xs text-[#F5F7FA] mt-1 font-medium">
                Review Notes: {kycData?.rejection_reason || "The submitted documentation did not satisfy clarity or validity standards."}
              </p>
              <p className="text-xs text-[#A6B0BE] mt-1">
                Please correct the information and upload updated, legible government identification documents below.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel p-5 bg-[#151F2B]/40 border-white/10 flex items-start gap-3">
          <Info className="h-5 w-5 text-[#4388F5] shrink-0 mt-0.5" />
          <p className="text-xs text-[#A6B0BE] leading-relaxed">
            Horizon Equity enforces strict AML (Anti-Money Laundering) and KYC compliance. To safeguard client capital and enable automated withdrawals, submit your valid legal identification credentials below.
          </p>
        </div>
      )}

      {/* KYC Submission Form (Shown when not verified) */}
      {!isVerified && (
        <div className="panel p-6 sm:p-8 flex flex-col gap-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#4388F5]" />
              Submit Identity Documentation
            </h3>
            <p className="text-xs text-[#7D8998] mt-1">
              All documents are transmitted using 256-bit AES encryption and stored securely in air-gapped compliance vaults.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded bg-[#F06464]/10 border border-[#F06464]/30 text-xs text-[#F06464] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded bg-[#27C58B]/10 border border-[#27C58B]/30 text-xs text-[#27C58B] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Type */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                  Identification Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                >
                  <option value="passport">International Passport</option>
                  <option value="national_id">National Identity Card</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="residence_permit">Permanent Residence Card</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                  Document ID / Passport Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. A93847291"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                  Full Legal Name (as on document) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alexander Vance"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>

              {/* Nationality */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A6B0BE] block mb-1.5">
                  Issuing Country / Nationality *
                </label>
                <input
                  type="text"
                  placeholder="e.g. United Kingdom"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="input w-full bg-[#0B0F14] border-white/10 text-white text-xs h-10"
                  required
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D8998] mb-3">
                Document Scans & Photographic Verification
              </h4>
              <p className="text-xs text-[#A6B0BE] mb-4">
                Upload clear color photographs or scans. Ensure all 4 edges are visible, text is crisp, and no flash glare obscures personal details. Supported formats: JPG, PNG, PDF (Max 5MB each).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Front Document */}
                <div className="p-4 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col items-center text-center justify-between min-h-[170px]">
                  <UploadCloud className="h-7 w-7 text-[#4388F5] mb-2" />
                  <div>
                    <span className="text-xs font-bold text-white block">Front of Document *</span>
                    <span className="text-[11px] text-[#7D8998] block mt-0.5 truncate max-w-[200px]">
                      {frontDocName || "Photo page or front side"}
                    </span>
                  </div>
                  <label className="btn btn-secondary btn-sm text-xs cursor-pointer mt-3 w-full justify-center">
                    <span>{frontDocName ? "Replace File" : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, setFrontDocName, setFrontDocBase64)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Back Document */}
                <div className="p-4 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col items-center text-center justify-between min-h-[170px]">
                  <FileText className="h-7 w-7 text-[#7D8998] mb-2" />
                  <div>
                    <span className="text-xs font-bold text-white block">Back of Document</span>
                    <span className="text-[11px] text-[#7D8998] block mt-0.5 truncate max-w-[200px]">
                      {backDocName || "Optional for passports"}
                    </span>
                  </div>
                  <label className="btn btn-secondary btn-sm text-xs cursor-pointer mt-3 w-full justify-center">
                    <span>{backDocName ? "Replace File" : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, setBackDocName, setBackDocBase64)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Selfie Proof */}
                <div className="p-4 rounded-lg bg-[#0B0F14] border border-white/10 flex flex-col items-center text-center justify-between min-h-[170px]">
                  <UserCheck className="h-7 w-7 text-[#27C58B] mb-2" />
                  <div>
                    <span className="text-xs font-bold text-white block">Selfie with Document</span>
                    <span className="text-[11px] text-[#7D8998] block mt-0.5 truncate max-w-[200px]">
                      {selfieName || "Holding document clearly"}
                    </span>
                  </div>
                  <label className="btn btn-secondary btn-sm text-xs cursor-pointer mt-3 w-full justify-center">
                    <span>{selfieName ? "Replace File" : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setSelfieName, setSelfieBase64)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Compliance Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="rounded border-white/20 bg-[#0B0F14] text-[#4388F5] mt-0.5"
                />
                <span className="text-xs text-[#A6B0BE] leading-relaxed">
                  I hereby confirm that I am the legal owner of this identification document and that all information provided is accurate and authentic.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary font-semibold text-xs px-6 py-2.5 shadow-md flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Documentation...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Compliance Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
