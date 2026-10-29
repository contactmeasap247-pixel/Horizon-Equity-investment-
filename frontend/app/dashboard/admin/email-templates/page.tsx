"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Mail,
  Edit2,
  Eye,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Smartphone,
  Monitor,
  Tag,
  X,
  Users,
  FileText,
  Clock,
  Search,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";

interface EmailTemplate {
  key: string;
  name: string;
  category: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  updated_at?: string;
}

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  kyc_status?: string;
}

interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  template_key?: string;
  status: string;
  provider_message_id?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

interface SendResult {
  total: number;
  success_count: number;
  failed_count: number;
  successful: string[];
  failed: { email: string; reason: string }[];
  summary: string;
}

export default function AdminEmailManagementPage() {
  // Main tabs: "templates", "composer", "logs"
  const [activeMainTab, setActiveMainTab] = useState<"templates" | "composer" | "logs">("templates");

  // ==========================================
  // TAB 1: TEMPLATE CUSTOMIZER STATES
  // ==========================================
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [editText, setEditText] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [editorSubTab, setEditorSubTab] = useState<"edit" | "preview">("preview");

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // ==========================================
  // TAB 2: COMPOSER STATES
  // ==========================================
  const [composerMode, setComposerMode] = useState<"group" | "single" | "multiple" | "custom">("group");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [singleUserId, setSingleUserId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");
  const [composerSubject, setComposerSubject] = useState("");
  const [composerHtml, setComposerHtml] = useState("");
  const [composerText, setComposerText] = useState("");
  const [composerSelectedTemplate, setComposerSelectedTemplate] = useState("");
  const [composerPreviewDevice, setComposerPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [composerSubTab, setComposerSubTab] = useState<"compose" | "preview">("compose");

  // Recipient preview state
  const [recipientPreview, setRecipientPreview] = useState<{ count: number; recipients: { id: string; email: string; name: string }[] }>({ count: 0, recipients: [] });
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showRecipientListModal, setShowRecipientListModal] = useState(false);

  // Bulk confirmation modal & sending states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  // Registered users for dropdowns
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // ==========================================
  // TAB 3: LOGS STATES
  // ==========================================
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logStatusFilter, setLogStatusFilter] = useState("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ------------------------------------------
  // FETCH TEMPLATES
  // ------------------------------------------
  const fetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await api.get("/admin/email-templates");
      setTemplates(res.data);
      if (res.data.length > 0 && !selectedKey) {
        selectTemplate(res.data[0]);
      } else if (selectedKey) {
        const found = res.data.find((t: EmailTemplate) => t.key === selectedKey);
        if (found) selectTemplate(found);
      }
    } catch {
      setFeedback({ type: "error", msg: "Failed to load email templates from database." });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [selectedKey]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const selectTemplate = (tmpl: EmailTemplate) => {
    setSelectedKey(tmpl.key);
    setEditSubject(tmpl.subject);
    setEditHtml(tmpl.html_content);
    setEditText(tmpl.text_content);
  };

  const currentTemplate = templates.find((t) => t.key === selectedKey);

  // ------------------------------------------
  // FETCH REGISTERED USERS (FOR COMPOSER)
  // ------------------------------------------
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users?limit=200");
      setAllUsers(res.data.items || []);
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    if (activeMainTab === "composer") {
      fetchUsers();
    }
  }, [activeMainTab, fetchUsers]);

  // ------------------------------------------
  // RECIPIENT PREVIEW CALCULATION
  // ------------------------------------------
  const fetchRecipientPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    try {
      let url = `/admin/emails/recipients-preview?mode=${composerMode}`;
      if (composerMode === "group") {
        url += `&group=${selectedGroup}`;
      } else if (composerMode === "single") {
        url += singleUserId ? `&user_ids=${singleUserId}` : "";
      } else if (composerMode === "multiple") {
        url += selectedUserIds.length > 0 ? `&user_ids=${selectedUserIds.join(",")}` : "";
      } else if (composerMode === "custom") {
        url += customEmail ? `&custom_email=${encodeURIComponent(customEmail)}` : "";
      }
      const res = await api.get(url);
      setRecipientPreview(res.data);
    } catch {
      setRecipientPreview({ count: 0, recipients: [] });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [composerMode, selectedGroup, singleUserId, selectedUserIds, customEmail]);

  useEffect(() => {
    if (activeMainTab === "composer") {
      fetchRecipientPreview();
    }
  }, [activeMainTab, fetchRecipientPreview]);

  // ------------------------------------------
  // FETCH DELIVERY LOGS
  // ------------------------------------------
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      let url = "/admin/emails/logs?limit=50&offset=0";
      if (logStatusFilter !== "all") {
        url += `&status=${logStatusFilter}`;
      }
      if (logSearchQuery.trim()) {
        url += `&search=${encodeURIComponent(logSearchQuery.trim())}`;
      }
      const res = await api.get(url);
      setLogs(res.data.items || []);
      setTotalLogs(res.data.total || 0);
    } catch {
      setFeedback({ type: "error", msg: "Failed to load transactional delivery tracking logs." });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [logStatusFilter, logSearchQuery]);

  useEffect(() => {
    if (activeMainTab === "logs") {
      fetchLogs();
    }
  }, [activeMainTab, fetchLogs]);

  // ------------------------------------------
  // TEMPLATE SAVE & TEST SEND HANDLERS
  // ------------------------------------------
  const handleSave = async () => {
    if (!currentTemplate) return;
    setIsSavingTemplate(true);
    try {
      await api.put(`/admin/email-templates/${currentTemplate.key}`, {
        subject: editSubject,
        html_content: editHtml,
        text_content: editText,
      });
      setFeedback({ type: "success", msg: "Template changes saved persistently." });
      fetchTemplates();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to save template." });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate || !testRecipient.trim()) return;
    setIsSendingTest(true);
    try {
      const res = await api.post(`/admin/email-templates/${currentTemplate.key}/test-send`, {
        recipient_email: testRecipient.trim(),
      });
      setFeedback({
        type: "success",
        msg: `Test preview successfully dispatched to ${res.data.recipient} via Brevo.`,
      });
      setTestModalOpen(false);
      setTestRecipient("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to dispatch test email." });
    } finally {
      setIsSendingTest(false);
    }
  };

  // ------------------------------------------
  // COMPOSER TEMPLATE PRE-LOADER
  // ------------------------------------------
  const handleLoadTemplateIntoComposer = (templateKey: string) => {
    setComposerSelectedTemplate(templateKey);
    const tmpl = templates.find((t) => t.key === templateKey);
    if (tmpl) {
      setComposerSubject(tmpl.subject);
      setComposerHtml(tmpl.html_content);
      setComposerText(tmpl.text_content);
    }
  };

  // ------------------------------------------
  // COMPOSER DISPATCH
  // ------------------------------------------
  const handleExecuteSend = async () => {
    if (!composerSubject.trim() || !composerHtml.trim()) {
      setFeedback({ type: "error", msg: "Please enter both a subject and an email body." });
      return;
    }
    if (recipientPreview.count === 0) {
      setFeedback({ type: "error", msg: "No recipients selected for dispatch." });
      return;
    }

    setIsSendingBulk(true);
    try {
      const payload: {
        mode: string;
        group?: string;
        user_ids?: string[];
        custom_email?: string;
        subject: string;
        html_content: string;
        text_content?: string;
        template_key?: string;
      } = {
        mode: composerMode,
        subject: composerSubject.trim(),
        html_content: composerHtml,
        text_content: composerText || undefined,
        template_key: composerSelectedTemplate || undefined,
      };

      if (composerMode === "group") {
        payload.group = selectedGroup;
      } else if (composerMode === "single") {
        payload.user_ids = [singleUserId];
      } else if (composerMode === "multiple") {
        payload.user_ids = selectedUserIds;
      } else if (composerMode === "custom") {
        payload.custom_email = customEmail.trim();
      }

      const res = await api.post("/admin/emails/send", payload);
      setSendResult(res.data);
      setConfirmModalOpen(false);
      setFeedback({
        type: "success",
        msg: `Dispatched message to ${res.data.success_count} recipients successfully.`,
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to dispatch email batch." });
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Retry Failed
  const handleRetryFailed = async () => {
    if (!sendResult || sendResult.failed.length === 0) return;
    const failedEmails = sendResult.failed.map((f) => f.email);
    const matchedIds = allUsers.filter((u) => failedEmails.includes(u.email)).map((u) => u.id);

    setIsSendingBulk(true);
    try {
      const payload = {
        mode: matchedIds.length > 0 ? "multiple" : "custom",
        user_ids: matchedIds.length > 0 ? matchedIds : undefined,
        custom_email: matchedIds.length === 0 ? failedEmails[0] : undefined,
        subject: composerSubject.trim(),
        html_content: composerHtml,
        text_content: composerText || undefined,
        template_key: composerSelectedTemplate || undefined,
      };

      const res = await api.post("/admin/emails/send", payload);
      setSendResult(res.data);
      setFeedback({
        type: "success",
        msg: `Retry finished: ${res.data.success_count} succeeded, ${res.data.failed_count} failed.`,
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setFeedback({ type: "error", msg: e.response?.data?.detail || "Failed to retry email dispatch." });
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Live HTML Renderer for Composer
  const getRenderedComposerHtml = () => {
    if (!composerHtml) return "";
    let rendered = composerHtml;
    const samples: Record<string, string> = {
      user_name: "Valued Investor",
      email: customEmail || "investor@horizonequity.net",
      bonus_amount: "10.00",
      amount: "1,500.00",
      currency: "USDT",
      reference: "TX-78945",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      login_url: "https://horizon-equity-investment.vercel.app/auth/login",
      dashboard_url: "https://horizon-equity-investment.vercel.app/dashboard",
      rules_url: "https://horizon-equity-investment.vercel.app/dashboard/withdrawals",
      support_email: "support@horizonequity.net",
    };
    Object.entries(samples).forEach(([k, v]) => {
      rendered = rendered.split(`{{${k}}}`).join(v);
    });
    return rendered;
  };

  // Filtered users for multi-select
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return allUsers;
    const q = userSearchQuery.toLowerCase();
    return allUsers.filter((u) => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q));
  }, [allUsers, userSearchQuery]);

  // Categories for Template Library
  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => set.add(t.category));
    return ["ALL", ...Array.from(set)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "ALL") return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-[#4388F5]" />
            <h1 className="text-xl font-bold text-white tracking-wide">Email Communications Hub</h1>
          </div>
          <p className="text-xs text-[#7D8998] mt-1">
            Brevo transactional relay, recipient groups, direct composer, and live delivery auditing.
          </p>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex items-center gap-1 bg-[#111821] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveMainTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMainTab === "templates"
                ? "bg-[#4388F5] text-white shadow"
                : "text-[#7D8998] hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Templates</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("composer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMainTab === "composer"
                ? "bg-[#4388F5] text-white shadow"
                : "text-[#7D8998] hover:text-white"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Composer & Dispatch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("logs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMainTab === "logs"
                ? "bg-[#4388F5] text-white shadow"
                : "text-[#7D8998] hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Delivery Tracking</span>
          </button>
        </div>
      </div>

      {/* ALERT FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-[#27C58B]/10 border-[#27C58B]/30 text-[#27C58B]"
              : "bg-[#F06464]/10 border-[#F06464]/30 text-[#F06464]"
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
          <button type="button" onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EMAIL TEMPLATE LIBRARY & LIVE PREVIEW */}
      {/* ========================================================================= */}
      {activeMainTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: TEMPLATE LIST */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    activeCategory === cat
                      ? "bg-[#4388F5] text-white"
                      : "bg-[#111821] text-[#7D8998] hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {isLoadingTemplates ? (
                <div className="p-8 text-center text-[#7D8998] text-xs flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#4388F5]" />
                  <span>Loading templates...</span>
                </div>
              ) : (
                filteredTemplates.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => selectTemplate(t)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedKey === t.key
                        ? "bg-[#111821] border-[#4388F5] shadow-lg shadow-[#4388F5]/5"
                        : "bg-[#0B0F14] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#4388F5] uppercase tracking-wider">{t.category}</span>
                      <span className="text-[10px] text-[#64748B]">{t.variables.length} vars</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{t.name}</div>
                    <div className="text-[11px] text-[#7D8998] truncate mt-0.5">{t.subject}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: TEMPLATE EDITOR & PREVIEW */}
          <div className="lg:col-span-8 bg-[#111821] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0B0F14]/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{currentTemplate?.name || "Select Template"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4388F5]/10 text-[#4388F5] border border-[#4388F5]/20">
                  {currentTemplate?.key}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-[#111821] p-1 rounded-lg border border-white/10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorSubTab("preview")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      editorSubTab === "preview" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSubTab("edit")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      editorSubTab === "edit" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>HTML Editor</span>
                  </button>
                </div>

                {editorSubTab === "preview" && (
                  <div className="bg-[#111821] p-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1 rounded ${previewDevice === "desktop" ? "text-[#4388F5]" : "text-[#7D8998]"}`}
                      title="Desktop view"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1 rounded ${previewDevice === "mobile" ? "text-[#4388F5]" : "text-[#7D8998]"}`}
                      title="Mobile view"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-[#4388F5]/30 bg-[#4388F5]/10 text-[#4388F5] text-xs font-semibold hover:bg-[#4388F5]/20 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Test Send</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSavingTemplate}
                  className="px-4 py-1.5 rounded-lg bg-[#4388F5] text-white text-xs font-semibold hover:bg-[#3273DC] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* SUBJECT FIELD */}
            <div className="p-4 border-b border-white/10 bg-[#0B0F14]/20 space-y-1">
              <label className="text-[10px] font-bold text-[#7D8998] uppercase">Subject Line</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4388F5]"
              />
            </div>

            {/* VARIABLES PILLS */}
            {currentTemplate && currentTemplate.variables.length > 0 && (
              <div className="px-4 py-2 border-b border-white/5 bg-[#0B0F14]/40 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#7D8998] mr-1">Variables:</span>
                {currentTemplate.variables.map((v) => (
                  <span
                    key={v}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#94A3B8] border border-white/5"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}

            {/* CONTENT AREA */}
            {editorSubTab === "edit" ? (
              <div className="p-4 flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#7D8998] uppercase block mb-1">HTML Content</label>
                  <textarea
                    rows={16}
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7D8998] uppercase block mb-1">Plain Text Alternative</label>
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-[#94A3B8] font-mono focus:outline-none focus:border-[#4388F5]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#0B0F14] flex justify-center min-h-[500px] overflow-y-auto">
                <div
                  className={`transition-all ${
                    previewDevice === "mobile"
                      ? "w-[375px] border-4 border-slate-800 rounded-3xl p-3 shadow-2xl bg-[#0B0F14]"
                      : "w-full max-w-2xl"
                  }`}
                >
                  <div
                    className="rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: getRenderedComposerHtml() || editHtml }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DIRECT EMAIL COMPOSER & RECIPIENT GROUPS (PHASE 2) */}
      {/* ========================================================================= */}
      {activeMainTab === "composer" && (
        <div className="space-y-6">
          {/* RESULT STATUS BANNER (IF BULK DISPATCH COMPLETED) */}
          {sendResult && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#111821] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#27C58B]" />
                  <h3 className="text-sm font-bold text-white">Sending Results</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSendResult(null)}
                  className="text-xs text-[#7D8998] hover:text-white"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                  <div className="text-[10px] text-[#7D8998] uppercase">Total Recipients</div>
                  <div className="text-lg font-bold text-white mt-1">{sendResult.total}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0B0F14] border border-[#27C58B]/20">
                  <div className="text-[10px] text-[#27C58B] uppercase">Successful Dispatches</div>
                  <div className="text-lg font-bold text-[#27C58B] mt-1">{sendResult.success_count}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0B0F14] border border-[#F06464]/20">
                  <div className="text-[10px] text-[#F06464] uppercase">Failed Recipients</div>
                  <div className="text-lg font-bold text-[#F06464] mt-1">{sendResult.failed_count}</div>
                </div>
              </div>

              {sendResult.failed.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F06464]">Failed Recipients Details:</span>
                    <button
                      type="button"
                      onClick={handleRetryFailed}
                      disabled={isSendingBulk}
                      className="px-3 py-1 rounded-md bg-[#F06464] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-red-600 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retry Failed ({sendResult.failed.length})</span>
                    </button>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {sendResult.failed.map((f, i) => (
                      <div
                        key={i}
                        className="text-[11px] p-2 rounded bg-[#0B0F14] border border-[#F06464]/20 flex items-center justify-between text-[#94A3B8]"
                      >
                        <span className="font-mono text-white">{f.email}</span>
                        <span className="text-[#F06464]">{f.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPOSER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: AUDIENCE & RECIPIENT SELECTOR */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#111821] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#4388F5]" />
                    <h2 className="text-sm font-bold text-white">Target Audience</h2>
                  </div>
                  {/* RECIPIENT COUNT BADGE */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7D8998]">Selected:</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#4388F5]/20 text-[#4388F5] border border-[#4388F5]/30">
                      {isLoadingPreview ? "..." : `${recipientPreview.count} users`}
                    </span>
                  </div>
                </div>

                {/* MODE SELECTION TABS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0B0F14] p-1.5 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setComposerMode("group")}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      composerMode === "group" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    User Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerMode("single")}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      composerMode === "single" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    Single User
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerMode("multiple")}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      composerMode === "multiple" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    Multi-Select
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerMode("custom")}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      composerMode === "custom" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                    }`}
                  >
                    Custom Email
                  </button>
                </div>

                {/* MODE 1: USER GROUP SELECTOR */}
                {composerMode === "group" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#7D8998] block">Select Eligible Group:</label>
                    <div className="space-y-1.5">
                      {[
                        { key: "all", label: "All Active Users", desc: "Every active registered account" },
                        { key: "active_investors", label: "Active Investors", desc: "Users with ongoing portfolio contracts" },
                        { key: "unverified", label: "Unverified Users", desc: "Users requiring email verification" },
                        { key: "pending_kyc", label: "Pending KYC", desc: "Users with identity docs in review queue" },
                        { key: "with_deposits", label: "Verified Depositors", desc: "Users with at least one verified deposit" },
                        { key: "suspended", label: "Suspended Accounts", desc: "Temporarily locked user accounts" },
                      ].map((grp) => (
                        <button
                          key={grp.key}
                          type="button"
                          onClick={() => setSelectedGroup(grp.key)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                            selectedGroup === grp.key
                              ? "bg-[#4388F5]/10 border-[#4388F5] text-white"
                              : "bg-[#0B0F14] border-white/5 text-[#94A3B8] hover:border-white/20"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white">{grp.label}</div>
                            <div className="text-[10px] text-[#7D8998]">{grp.desc}</div>
                          </div>
                          {selectedGroup === grp.key && <Check className="h-4 w-4 text-[#4388F5]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODE 2: SINGLE USER SELECTOR */}
                {composerMode === "single" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#7D8998] block">Select Registered User:</label>
                    <select
                      value={singleUserId}
                      onChange={(e) => setSingleUserId(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#4388F5]"
                    >
                      <option value="">-- Choose registered investor --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || "User"} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* MODE 3: MULTI-SELECT CHECKLIST */}
                {composerMode === "multiple" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[#7D8998]">Select Multiple Recipients:</label>
                      <span className="text-[10px] text-[#4388F5] font-semibold">{selectedUserIds.length} checked</span>
                    </div>

                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-[#7D8998]" />
                      <input
                        type="text"
                        placeholder="Search name or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#4388F5]"
                      />
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto p-1 bg-[#0B0F14] rounded-xl border border-white/5">
                      {filteredUsers.slice(0, 50).map((u) => {
                        const isChecked = selectedUserIds.includes(u.id);
                        return (
                          <label
                            key={u.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                              isChecked ? "bg-[#4388F5]/10 text-white" : "text-[#94A3B8] hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate mr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUserIds((prev) => [...prev, u.id]);
                                  } else {
                                    setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
                                  }
                                }}
                                className="rounded text-[#4388F5] focus:ring-0"
                              />
                              <span className="truncate">{u.full_name || "Investor"}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B] truncate">{u.email}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MODE 4: CUSTOM RECIPIENT */}
                {composerMode === "custom" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#7D8998] block">Custom Recipient Email:</label>
                    <input
                      type="email"
                      placeholder="investor@example.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#4388F5]"
                    />
                    <p className="text-[10px] text-[#7D8998]">
                      Enter any valid email address to dispatch directly via Brevo relay.
                    </p>
                  </div>
                )}

                {/* VIEW MATCHING RECIPIENTS SAMPLE */}
                {recipientPreview.count > 0 && (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#7D8998]">
                      Targeting <strong className="text-white">{recipientPreview.count}</strong> confirmed recipients
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRecipientListModal(true)}
                      className="text-[#4388F5] hover:underline font-semibold"
                    >
                      View List Sample →
                    </button>
                  </div>
                )}
              </div>

              {/* TEMPLATE PRE-POPULATOR */}
              <div className="bg-[#111821] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#4388F5]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Template Pre-loader</h3>
                </div>
                <p className="text-[11px] text-[#7D8998]">
                  Select any system template to load subject, HTML, and fallback text automatically into the composer.
                </p>
                <select
                  value={composerSelectedTemplate}
                  onChange={(e) => handleLoadTemplateIntoComposer(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#4388F5]"
                >
                  <option value="">-- Choose template to load --</option>
                  {templates.map((t) => (
                    <option key={t.key} value={t.key}>
                      [{t.category}] {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RIGHT: MESSAGE COMPOSER & PREVIEW */}
            <div className="lg:col-span-7 bg-[#111821] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F14]/50">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#4388F5]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Message Content</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-[#111821] p-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setComposerSubTab("compose")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                        composerSubTab === "compose" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                      }`}
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Compose</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerSubTab("preview")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                        composerSubTab === "preview" ? "bg-[#4388F5] text-white" : "text-[#7D8998] hover:text-white"
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </div>

                  {composerSubTab === "preview" && (
                    <div className="bg-[#111821] p-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setComposerPreviewDevice("desktop")}
                        className={`p-1 rounded ${composerPreviewDevice === "desktop" ? "text-[#4388F5]" : "text-[#7D8998]"}`}
                        title="Desktop view"
                      >
                        <Monitor className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerPreviewDevice("mobile")}
                        className={`p-1 rounded ${composerPreviewDevice === "mobile" ? "text-[#4388F5]" : "text-[#7D8998]"}`}
                        title="Mobile view"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(true)}
                    disabled={recipientPreview.count === 0 || !composerSubject.trim() || !composerHtml.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[#4388F5] text-white text-xs font-semibold hover:bg-[#3273DC] flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-[#4388F5]/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch Email ({recipientPreview.count})</span>
                  </button>
                </div>
              </div>

              {/* SUBJECT INPUT */}
              <div className="p-4 border-b border-white/10 bg-[#0B0F14]/20 space-y-1">
                <label className="text-[10px] font-bold text-[#7D8998] uppercase">Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to Horizon Equity — Your $10 Welcome Bonus"
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4388F5]"
                />
              </div>

              {/* BODY AREA */}
              {composerSubTab === "compose" ? (
                <div className="p-4 flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-[#7D8998] uppercase">HTML Body Content</label>
                      <span className="text-[10px] text-[#7D8998]">Supports {"{{user_name}}"}, {"{{email}}"}</span>
                    </div>
                    <textarea
                      rows={14}
                      placeholder="<div style='font-family: sans-serif; background: #0B0F14; color: #fff; padding: 20px;'>...</div>"
                      value={composerHtml}
                      onChange={(e) => setComposerHtml(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#7D8998] uppercase block mb-1">
                      Plain-Text Alternative Fallback
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Plain text fallback for email clients that do not render HTML..."
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-[#94A3B8] font-mono focus:outline-none focus:border-[#4388F5]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#0B0F14] flex justify-center min-h-[460px] overflow-y-auto">
                  <div
                    className={`transition-all ${
                      composerPreviewDevice === "mobile"
                        ? "w-[375px] border-4 border-slate-800 rounded-3xl p-3 shadow-2xl bg-[#0B0F14]"
                        : "w-full max-w-2xl"
                    }`}
                  >
                    <div
                      className="rounded-lg overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: getRenderedComposerHtml() }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRANSACTIONAL DELIVERY TRACKING LOGS (PHASE 8) */}
      {/* ========================================================================= */}
      {activeMainTab === "logs" && (
        <div className="space-y-4">
          {/* LOGS FILTER BAR */}
          <div className="p-4 bg-[#111821] border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-[#7D8998]" />
                <input
                  type="text"
                  placeholder="Search recipient email or subject..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-[#0B0F14] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4388F5] w-64"
                />
              </div>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4388F5]"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="sent">Sent (Accepted by Relay)</option>
                <option value="delivered">Delivered (Webhook Confirmed)</option>
                <option value="opened">Opened</option>
                <option value="bounced">Bounced</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#7D8998]">{totalLogs} total log records</span>
              <button
                type="button"
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                className="px-3 py-1.5 rounded-lg bg-[#0B0F14] border border-white/10 text-xs text-[#7D8998] hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingLogs ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* LOGS TABLE */}
          <div className="bg-[#111821] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0F14] text-[#7D8998] uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Recipient</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Template</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Provider Message ID</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingLogs ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#7D8998]">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#4388F5]" />
                          <span>Loading email delivery audit logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#7D8998]">
                        No email log records found matching selection.
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-mono text-white">{l.recipient}</td>
                        <td className="p-3.5 text-white max-w-xs truncate">{l.subject}</td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                            {l.template_key || "custom"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              l.status === "delivered"
                                ? "bg-[#27C58B]/20 text-[#27C58B] border border-[#27C58B]/30"
                                : l.status === "opened"
                                ? "bg-[#4388F5]/20 text-[#4388F5] border border-[#4388F5]/30"
                                : l.status === "sent"
                                ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                                : "bg-[#F06464]/20 text-[#F06464] border border-[#F06464]/30"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] font-mono text-[#64748B] max-w-[140px] truncate">
                          {l.provider_message_id || "—"}
                        </td>
                        <td className="p-3.5 text-[11px] text-[#7D8998] whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIRM BULK SEND (REQUIREMENT 8) */}
      {/* ========================================================================= */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#F3B94F]" />
                <h3 className="text-sm font-bold text-white">Confirm Email Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#94A3B8]">
                You are about to execute a transactional email dispatch via the connected Brevo service with the
                following parameters:
              </p>

              <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Recipient Audience:</span>
                  <span className="font-semibold text-white capitalize">{composerMode.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Recipient Count:</span>
                  <span className="font-bold text-[#4388F5]">{recipientPreview.count} verified addresses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Subject:</span>
                  <span className="font-semibold text-white truncate max-w-xs">{composerSubject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D8998]">Provider Relay:</span>
                  <span className="text-[#27C58B]">Brevo API / SMTP Verified</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed">
                <strong>Important:</strong> A successful response indicates Brevo accepted the request for dispatch.
                Real-time inbox delivery will update in the Delivery Tracking tab as Brevo reports webhook events.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                disabled={isSendingBulk}
                className="px-5 py-2 rounded-lg bg-[#4388F5] text-white text-xs font-semibold hover:bg-[#3273DC] flex items-center gap-2 disabled:opacity-50"
              >
                {isSendingBulk && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Confirm & Dispatch ({recipientPreview.count})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECIPIENT LIST SAMPLE MODAL */}
      {/* ========================================================================= */}
      {showRecipientListModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">Targeted Recipients ({recipientPreview.count})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecipientListModal(false)}
                className="text-[#7D8998] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {recipientPreview.recipients.map((r, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#0B0F14] border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{r.name}</span>
                  <span className="font-mono text-[#7D8998] text-[11px]">{r.email}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowRecipientListModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#4388F5] text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TEST SEND PREVIEW MODAL */}
      {/* ========================================================================= */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#4388F5]" />
                <h3 className="text-sm font-bold text-white">Send Test Preview Email</h3>
              </div>
              <button type="button" onClick={() => setTestModalOpen(false)} className="text-[#7D8998] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTestSend} className="space-y-3 text-xs">
              <p className="text-[#7D8998]">
                Dispatches a live rendering of the <span className="text-white font-semibold">{currentTemplate?.name}</span>{" "}
                template via the configured Brevo email provider.
              </p>

              <div>
                <label className="text-[#7D8998] block mb-1">Recipient Email Address:</label>
                <input
                  type="email"
                  placeholder="admin@horizonequity.net"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4388F5]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B0F14] text-[#7D8998] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest || !testRecipient.trim()}
                  className="px-4 py-2 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSendingTest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Dispatch Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
