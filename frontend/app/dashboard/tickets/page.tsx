"use client";

import { useEffect, useState, useRef } from "react";
import {
  HelpCircle,
  Plus,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronRight,
  User,
  Headphones,
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
      setTickets(response.data);
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
      setFormError("Please populate both Subject and Message fields.");
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

      setFormSuccess("Support ticket opened successfully!");
      setSubject("");
      setMessage("");
      
      setTimeout(() => {
        setOpenModal(false);
        setFormSuccess(null);
        fetchTicketsList();
        // Load this ticket directly
        fetchTicketDetails(response.data.id);
      }, 1500);
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Submission failed. Please verify fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
      });
      
      // Append reply to state
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
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start stagger-1 animate-slide-up h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Left side: Tickets listing */}
      <div className="lg:col-span-5 card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-gold-300" /> Support Conversations
          </h3>
          <button
            onClick={() => { setOpenModal(true); setFormError(null); setFormSuccess(null); }}
            className="btn-primary py-1.5 px-3 text-xs font-semibold"
          >
            Open Ticket <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted border border-dashed border-white/5 rounded-xl">
              No support tickets found. Click "Open Ticket" above to get assistance.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => fetchTicketDetails(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "border-gold-300 bg-gold-300/5 shadow-md shadow-gold-300/5"
                      : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-white truncate max-w-[200px]">{t.subject}</span>
                    <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                      t.status === "open" ? "badge-warning" : t.status === "in_progress" ? "badge-info" : "badge-success"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
                    <span>Category: {t.category}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Selected ticket messaging thread */}
      <div className="lg:col-span-7 card bg-[#0D2D4A]/85 border-white/10 p-6 flex flex-col gap-6 h-full">
        {selectedTicket ? (
          <div className="flex flex-col h-full justify-between">
            {/* Header info */}
            <div className="border-b border-white/5 pb-4 flex justify-between items-center">
              <div className="flex flex-col">
                <h4 className="font-bold text-base text-white">{selectedTicket.subject}</h4>
                <div className="flex items-center gap-3 text-[10px] text-text-secondary mt-1">
                  <span>Category: <span className="text-white font-medium">{selectedTicket.category}</span></span>
                  <span>Priority: <span className="text-gold-300 font-semibold uppercase">{selectedTicket.priority}</span></span>
                </div>
              </div>
              <span className={`badge uppercase text-xs py-0.5 px-2 ${
                selectedTicket.status === "open" ? "badge-warning" : selectedTicket.status === "in_progress" ? "badge-info" : "badge-success"
              }`}>
                {selectedTicket.status}
              </span>
            </div>

            {/* Conversation thread viewport */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 max-h-[360px] min-h-[220px]">
              {/* Initial message */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex gap-3.5 text-xs text-text-secondary leading-relaxed">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-text-secondary mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Alex Mercer (You)</span>
                    <span className="text-[10px] text-text-muted">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                  <p>{selectedTicket.message}</p>
                </div>
              </div>

              {/* Replies list */}
              {selectedTicket.replies?.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 border rounded-xl flex gap-3.5 text-xs leading-relaxed ${
                    rep.is_admin
                      ? "border-gold-300/20 bg-gold-300/[0.02]"
                      : "border-white/5 bg-white/[0.01]"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    rep.is_admin
                      ? "bg-gold-300/10 border-gold-300/20 text-gold-300"
                      : "bg-white/5 border-white/10 text-text-secondary"
                  }`}>
                    {rep.is_admin ? <Headphones className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${rep.is_admin ? "text-gold-300" : "text-white"}`}>
                        {rep.is_admin ? "Support Representative" : "Alex Mercer (You)"}
                      </span>
                      <span className="text-[10px] text-text-muted">{new Date(rep.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-text-secondary whitespace-pre-line">{rep.message}</p>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>

            {/* Input message form */}
            {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" ? (
              <form onSubmit={handleReplySubmit} className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response message..."
                  className="input flex-1"
                  required
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-gold-300 text-[#0A2540] hover:bg-gold-200 rounded-lg flex items-center justify-center gap-1 transition-colors font-bold text-xs"
                  disabled={submitting || !replyMessage.trim()}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Send</>}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-white/5 border border-white/5 text-center text-xs text-text-muted rounded-xl mt-4">
                This support ticket has been resolved or closed. You can open a new ticket for further questions.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-white">No Conversation Active</h4>
            <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
              Select an open ticket from the sidebar lists to view conversations and replies thread.
            </p>
          </div>
        )}
      </div>

      {/* Open Ticket Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal flex flex-col gap-6 border-white/10 max-w-[480px]">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gold-300 font-semibold uppercase tracking-wider">Help Desk</span>
                <h3 className="text-xl font-bold mt-0.5">Open Support Ticket</h3>
              </div>
              <button onClick={() => setOpenModal(false)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOpenTicketSubmit} className="flex flex-col gap-4">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="input font-semibold"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Category / Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="input-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input bg-[#0D2D4A] border-white/5"
                    disabled={submitting}
                  >
                    <option value="general">General Queries</option>
                    <option value="billing">Billing/Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="kyc">KYC Verification</option>
                    <option value="plans">Investments</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="input-label">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input bg-[#0D2D4A] border-white/5"
                    disabled={submitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Detailed Description *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your problem in detail..."
                  className="input min-h-[100px] leading-relaxed resize-y"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-3 disabled:opacity-50"
                disabled={submitting || formSuccess !== null}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Support Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
