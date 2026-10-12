"use client";

import { useEffect, useState, useCallback } from "react";
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
  Code,
  Tag,
  X,
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

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editor states
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [editText, setEditText] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");

  // Test Send Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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

  const handleSave = async () => {
    if (!currentTemplate) return;
    setIsSaving(true);
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
      setIsSaving(false);
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
        msg: `Test preview successfully dispatched to ${res.data.recipient}. Check your inbox or system logs.`,
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

  // Generate live preview by substituting sample values for template variables
  const getRenderedHtml = () => {
    if (!editHtml) return "";
    let rendered = editHtml;
    const samples: Record<string, string> = {
      user_name: "Alexander Vance",
      amount: "2,500.00",
      currency: "USDT",
      reference: "DEP-904838F",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      login_url: "https://horizonequity.io/login",
      support_email: "concierge@horizonequity.io",
      plan_name: "Apex Yield Tier",
      expected_return: "2,875.00",
      maturity_date: "Nov 15, 2026",
      tx_hash: "0x3f9a7b...8e1d",
      wallet_address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
      event_type: "Login from New IP",
      ip_address: "194.26.29.112",
      timestamp: new Date().toISOString(),
    };
    for (const [k, v] of Object.entries(samples)) {
      rendered = rendered.split(`{{${k}}}`).join(v);
    }
    return rendered;
  };

  const categories = ["ALL", "ACCOUNT", "TRANSACTIONS", "INVESTMENTS", "SECURITY AND SYSTEM"];

  const filteredTemplates = templates.filter(
    (t) => activeCategory === "ALL" || t.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Executive Communications
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Email Template Management</h1>
          <p className="text-xs text-[#7D8998]">
            Customize institutional email templates, preview cross-device responsiveness, and dispatch test sends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTestModalOpen(true)}
            disabled={!currentTemplate}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#151F2B] text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5 text-[#4388F5]" />
            <span>Send Test Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !currentTemplate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#4388F5] text-white hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Template</span>
          </button>
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
          <button type="button" onClick={() => setFeedback(null)} className="p-1 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Layout: Template Sidebar + Editor/Preview Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Selector List */}
        <div className="lg:col-span-4 rounded-xl bg-[#111821] border border-white/10 p-4 space-y-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all ${
                  activeCategory === c
                    ? "bg-[#4388F5] text-white font-medium"
                    : "text-[#7D8998] hover:text-white"
                }`}
              >
                {c === "SECURITY AND SYSTEM" ? "SECURITY" : c}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center text-xs text-[#7D8998]">
                <Loader2 className="h-5 w-5 animate-spin text-[#4388F5]" />
              </div>
            ) : (
              filteredTemplates.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => selectTemplate(t)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedKey === t.key
                      ? "bg-[#151F2B] border-[#4388F5] text-white shadow-sm"
                      : "bg-[#0B0F14]/50 border-white/5 text-[#7D8998] hover:border-white/10 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{t.name}</div>
                  <div className="text-[10px] text-[#7D8998] truncate mt-0.5">{t.subject}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#4388F5]">
                      {t.category}
                    </span>
                    <span className="text-[9px] text-[#27C58B]">Active</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Dual Editor & Preview */}
        <div className="lg:col-span-8 rounded-xl bg-[#111821] border border-white/10 overflow-hidden flex flex-col">
          {/* Editor Header Bar */}
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0B0F14]/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  activeTab === "preview"
                    ? "bg-[#4388F5] text-white font-medium"
                    : "text-[#7D8998] hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  activeTab === "edit"
                    ? "bg-[#4388F5] text-white font-medium"
                    : "text-[#7D8998] hover:text-white"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>Code Editor</span>
              </button>
            </div>

            {activeTab === "preview" && (
              <div className="flex items-center gap-1 bg-[#0B0F14] p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded ${
                    previewDevice === "desktop" ? "bg-[#151F2B] text-[#4388F5]" : "text-[#7D8998]"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded ${
                    previewDevice === "mobile" ? "bg-[#151F2B] text-[#4388F5]" : "text-[#7D8998]"
                  }`}
                  title="Mobile Viewport"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subject Line Bar */}
          <div className="p-4 border-b border-white/10 bg-[#0B0F14]/30 space-y-1">
            <label className="text-[10px] uppercase font-semibold text-[#7D8998] tracking-wider block">
              Email Subject Line
            </label>
            <input
              type="text"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#4388F5] font-medium"
            />
          </div>

          {/* Available Variables Bar */}
          {currentTemplate && currentTemplate.variables.length > 0 && (
            <div className="p-3 bg-[#0B0F14] border-b border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] text-[#7D8998] flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>Variables:</span>
              </span>
              {currentTemplate.variables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    const tag = `{{${v}}}`;
                    navigator.clipboard.writeText(tag);
                    setFeedback({ type: "success", msg: `Copied ${tag} to clipboard.` });
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#151F2B] border border-white/10 text-[#4388F5] hover:border-[#4388F5] transition-all"
                  title="Click to copy tag"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          )}

          {/* Tab Views */}
          {activeTab === "edit" ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[#7D8998] block mb-1 font-semibold">HTML Template Markup</label>
                <textarea
                  value={editHtml}
                  onChange={(e) => setEditHtml(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-[#F5F7FA] font-mono focus:outline-none focus:border-[#4388F5] h-80"
                />
              </div>

              <div>
                <label className="text-xs text-[#7D8998] block mb-1 font-semibold">Plain-Text Alternative</label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-3 text-xs text-[#F5F7FA] font-mono focus:outline-none focus:border-[#4388F5] h-24"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#0B0F14] flex justify-center min-h-[460px] overflow-y-auto">
              <div
                className={`transition-all ${
                  previewDevice === "mobile"
                    ? "w-[375px] border-4 border-slate-800 rounded-3xl p-3 shadow-2xl bg-[#0B0F14]"
                    : "w-full max-w-2xl"
                }`}
              >
                <div
                  className="rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: getRenderedHtml() }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TEST SEND MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111821] border border-white/10 rounded-xl p-5 space-y-4">
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
                template via the configured email provider.
              </p>

              <div>
                <label className="text-[#7D8998] block mb-1">Recipient Email Address:</label>
                <input
                  type="email"
                  placeholder="admin@horizonequity.io"
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
                  <span>Dispatch Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
