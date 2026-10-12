"use client";

import { useEffect, useState, useRef } from "react";
import {
  HelpCircle,
  Plus,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Headphones,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface TicketReply {
  id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  replies?: TicketReply[];
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");

  // Reply input state
  const [replyMessage, setReplyMessage] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketsList = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data || []);
    } catch (e) {
      console.error("Error loading tickets list:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsList();
  }, []);

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (e) {
      console.error("Error loading ticket detail:", e);
    }
  };

  // Scroll to thread bottom on message loading
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.replies]);

  const handleOpenTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      setFormError("Please populate both the subject and the message details.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await api.post("/tickets", {
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });

      setFormSuccess("Support ticket registered successfully. An account officer has been assigned.");
      setSubject("");
      setMessage("");

      setTimeout(() => {
        setOpenModal(false);
        setFormSuccess(null);
        fetchTicketsList();
        fetchTicketDetails(response.data.id);
      }, 1500);
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Ticket submission failed. Please verify inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
      });

      setReplyMessage("");
      fetchTicketDetails(selectedTicket.id);
    } catch (error) {
      console.error("Error submitting ticket reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading support desk tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Help Desk</span>
              <span className="text-xs text-text-faint font-mono">PRIORITY RESOLUTION</span>
            </div>
            <h1 className="t-page">Client Support Desk</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Direct access to our 24/7 institutional trading desk, custody verification specialists, and compliance officers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpenModal(true);
              setFormError(null);
              setFormSuccess(null);
            }}
            className="btn btn-primary px-4 py-2 flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Open Ticket
          </button>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Ticket Listing */}
        <div className="lg:col-span-5 panel p-5 space-y-4 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="t-title flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              Your Tickets
            </h3>
            <span className="badge font-mono text-[10px]">
              {tickets.length} Registered
            </span>
          </div>

          <div className="space-y-2.5">
            {tickets.length === 0 ? (
              <div className="p-8 text-center inset rounded-lg border border-dashed border-border">
                <HelpCircle className="w-8 h-8 text-text-faint mx-auto mb-2" />
                <p className="text-xs text-text-muted">
                  No support tickets found. Click &ldquo;Open Ticket&rdquo; to connect with our trading desk.
                </p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => fetchTicketDetails(t.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-surface-raised hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-text truncate max-w-[220px]">
                        {t.subject}
                      </div>
                      <span
                        className={`badge text-[10px] uppercase font-mono ${
                          t.status === "open"
                            ? "badge-warning"
                            : t.status === "in_progress"
                            ? "badge-accent"
                            : "badge-success"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>Category: <strong className="text-text font-normal capitalize">{t.category}</strong></span>
                      <span className="font-mono text-text-faint">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div className="lg:col-span-7 panel p-6 flex flex-col min-h-[500px] max-h-[700px] justify-between">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              {/* Ticket Top Meta */}
              <div className="border-b border-border pb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-text">{selectedTicket.subject}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1.5">
                    <span>Category: <strong className="text-text capitalize">{selectedTicket.category}</strong></span>
                    <span>Priority: <span className="text-accent font-semibold uppercase">{selectedTicket.priority}</span></span>
                    <span className="font-mono text-text-faint">Opened: {new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span
                  className={`badge text-[10px] uppercase font-mono ${
                    selectedTicket.status === "open"
                      ? "badge-warning"
                      : selectedTicket.status === "in_progress"
                      ? "badge-accent"
                      : "badge-success"
                  }`}
                >
                  {selectedTicket.status.replace("_", " ")}
                </span>
              </div>

              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2 max-h-[440px]">
                {/* Initial Client Message */}
                <div className="inset p-4 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-text-muted">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-text">You</span>
                    </div>
                    <span className="text-[11px] text-text-faint font-mono">
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap pl-8">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Replies Thread */}
                {selectedTicket.replies?.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-lg border space-y-2 ${
                      rep.is_admin
                        ? "bg-accent/5 border-accent/25"
                        : "inset border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center border ${
                            rep.is_admin
                              ? "bg-accent/15 border-accent/40 text-accent"
                              : "bg-surface border-border text-text-muted"
                          }`}
                        >
                          {rep.is_admin ? (
                            <Headphones className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span
                          className={`font-semibold ${
                            rep.is_admin ? "text-accent" : "text-text"
                          }`}
                        >
                          {rep.is_admin ? "Horizon Support Officer" : "You"}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-faint font-mono">
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-text leading-relaxed whitespace-pre-wrap pl-8">
                      {rep.message}
                    </p>
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>

              {/* Reply Input Form */}
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" ? (
                <form onSubmit={handleReplySubmit} className="pt-3 border-t border-border flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message reply..."
                    className="input flex-1 text-xs"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyMessage.trim()}
                    className="btn btn-primary px-4 py-2 text-xs flex items-center gap-1.5 flex-shrink-0"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-3 inset border border-border text-center text-xs text-text-muted rounded-lg">
                  This support ticket is resolved. Please open a new ticket if you have another query.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-faint">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-text">No Ticket Selected</h4>
              <p className="text-xs text-text-muted max-w-sm">
                Select any open ticket from the sidebar to inspect conversation details or submit a response.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Open Ticket Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="panel p-6 max-w-lg w-full space-y-6 border border-border shadow-2xl animate-slide-up">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-accent font-mono uppercase tracking-wider font-semibold">
                  Institutional Support
                </span>
                <h3 className="text-lg font-bold text-text mt-0.5">Submit Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="btn btn-ghost p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
                <div className="leading-relaxed">{formError}</div>
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                <div className="leading-relaxed">{formSuccess}</div>
              </div>
            )}

            <form onSubmit={handleOpenTicketSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Subject / Summary *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of your inquiry or issue"
                  className="input"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select"
                    disabled={submitting}
                  >
                    <option value="general">General Queries</option>
                    <option value="billing">Deposit &amp; Funding</option>
                    <option value="withdrawal">Withdrawal &amp; Custody</option>
                    <option value="kyc">KYC &amp; Verification</option>
                    <option value="plans">Investment Contracts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Urgency / Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="select"
                    disabled={submitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Detailed Inquiry *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide complete details including transaction hashes, wallet addresses, or contract IDs if applicable..."
                  className="textarea min-h-[120px]"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || formSuccess !== null}
                  className="btn btn-primary w-full justify-center py-2.5 text-xs font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Assigning Support Officer...
                    </>
                  ) : (
                    "Submit Ticket to Desk"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
