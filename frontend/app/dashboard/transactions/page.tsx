"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  ReceiptText,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Share2,
  Sliders,
  Gift,
  Landmark,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  X,
  ArrowUpDown,
} from "lucide-react";
import { api } from "@/lib/api";
import { toNum, formatCrypto } from "@/lib/format";
import ReceiptModal from "@/app/components/ReceiptModal";

interface TransactionItem {
  id: string;
  type: string;
  subtype?: string;
  amount: number | string;
  fee: number | string;
  currency: string;
  status: string;
  reference?: string;
  description?: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceiptTxId, setSelectedReceiptTxId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Filtering, Searching & Pagination states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());
      params.append("order", sortOrder);

      if (selectedType) params.append("type", selectedType);
      if (selectedStatus) params.append("status", selectedStatus);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());

      const response = await api.get(`/transactions?${params.toString()}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (data && Array.isArray(data.items)) {
        setTransactions(data.items);
      } else {
        setTransactions([]);
      }
    } catch (err: unknown) {
      console.error("Error loading transactions:", err);
      const e = err as { response?: { data?: { detail?: string } } };
      setError(
        e.response?.data?.detail ||
          "Unable to load transaction records from the ledger. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedType, selectedStatus, debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedType("");
    setSelectedStatus("");
    setSortOrder("desc");
    setPage(1);
  };

  const handleCopyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(refText);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const getTypeBadge = (type: string, subtype?: string) => {
    const t = (type || "").toLowerCase();
    switch (t) {
      case "deposit":
        return (
          <span className="badge badge-success text-[10px] uppercase font-mono inline-flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-[#27C58B]" />
            Deposit
          </span>
        );
      case "withdrawal":
        return (
          <span className="badge badge-warning text-[10px] uppercase font-mono inline-flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-[#F59E0B]" />
            Withdrawal
          </span>
        );
      case "investment":
      case "reinvestment":
        return (
          <span className="badge badge-accent text-[10px] uppercase font-mono inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#4388F5]" />
            {t === "reinvestment" ? "Reinvestment" : "Investment"}
          </span>
        );
      case "return":
      case "daily_yield":
        return (
          <span className="badge text-[10px] uppercase font-mono inline-flex items-center gap-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            <TrendingUp className="w-3 h-3 text-[#10B981]" />
            Yield Return
          </span>
        );
      case "referral_bonus":
      case "referral":
      case "referral_commission":
        return (
          <span className="badge text-[10px] uppercase font-mono inline-flex items-center gap-1 bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
            <Share2 className="w-3 h-3 text-[#A78BFA]" />
            Referral Rebate
          </span>
        );
      case "registration_bonus":
      case "bonus":
        return (
          <span className="badge text-[10px] uppercase font-mono inline-flex items-center gap-1 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
            <Gift className="w-3 h-3 text-[#C5A059]" />
            Welcome Bonus
          </span>
        );
      case "loan_disbursement":
      case "loan_repayment":
      case "loan":
        return (
          <span className="badge text-[10px] uppercase font-mono inline-flex items-center gap-1 bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
            <Landmark className="w-3 h-3 text-[#38BDF8]" />
            Credit Facility
          </span>
        );
      case "adjustment":
      case "admin_credit":
      case "admin_debit":
        return (
          <span className="badge text-[10px] uppercase font-mono inline-flex items-center gap-1 bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30">
            <Sliders className="w-3 h-3 text-[#F43F5E]" />
            Adjustment
          </span>
        );
      default:
        return (
          <span className="badge badge-accent text-[10px] uppercase font-mono">
            {type.replace("_", " ")}
          </span>
        );
    }
  };

  const isFiltering = !!(selectedType || selectedStatus || debouncedSearch.trim());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent">Audit Log</span>
              <span className="text-xs text-text-faint font-mono">FINANCIAL LEDGER</span>
            </div>
            <h1 className="t-page">Account Audit &amp; Transactions</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Chronological double-entry record of custodial deposits, withdrawals, investment allocations, yield settlements, affiliate commissions, and bonuses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={isLoading}
              className="btn btn-secondary btn-sm px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono"
              title="Refresh ledger records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-accent" : ""}`} />
              <span>Sync Ledger</span>
            </button>
            <span className="badge font-mono text-[10px]">
              Page {page} &bull; 20 items/page
            </span>
          </div>
        </div>
      </div>

      {/* Main Ledger Panel */}
      <div className="panel p-6 space-y-6">
        {/* Controls: Search, Filters & Sorting */}
        <div className="space-y-4 pb-4 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search reference, asset, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 pr-8 py-1.5 text-xs w-full"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns and Sort Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-accent" />
                <label htmlFor="tx-type-filter" className="text-xs text-text-muted font-medium">Type:</label>
                <select
                  id="tx-type-filter"
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="select py-1.5 px-2.5 text-xs w-auto"
                >
                  <option value="">All Categories</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="investment">Investments &amp; Reinvestments</option>
                  <option value="return">Yield Distributions</option>
                  <option value="referral">Referral Rebates</option>
                  <option value="bonus">Promotional Bonuses</option>
                  <option value="loan">Credit &amp; Loans</option>
                  <option value="adjustment">Account Adjustments</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="tx-status-filter" className="text-xs text-text-muted font-medium">Status:</label>
                <select
                  id="tx-status-filter"
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="select py-1.5 px-2.5 text-xs w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed / Settled</option>
                  <option value="pending">Pending Verification</option>
                  <option value="failed">Failed / Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="btn btn-secondary btn-sm px-2.5 py-1.5 text-xs font-mono inline-flex items-center gap-1"
                title={`Sorted: ${sortOrder === "desc" ? "Newest first" : "Oldest first"}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
                <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
              </button>

              {isFiltering && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-accent hover:underline px-1 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-danger">Error Loading Transactions</p>
              <p className="text-text-muted mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchTransactions}
              className="btn btn-secondary btn-sm text-xs font-mono px-3 py-1 text-danger hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="min-h-[35vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-text-muted font-mono">Querying authoritative ledger records...</p>
          </div>
        ) : !error && (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Reference</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Asset</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-right">Official Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-text-muted text-xs">
                        <FileSpreadsheet className="w-10 h-10 text-text-faint mx-auto mb-3 opacity-60" />
                        {isFiltering ? (
                          <div>
                            <p className="font-semibold text-text text-sm">No Matching Records Found</p>
                            <p className="text-text-muted mt-1 max-w-sm mx-auto">
                              No financial records match your current filter and search parameters.
                            </p>
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="btn btn-secondary btn-sm text-xs mt-3 px-3 py-1"
                            >
                              Clear All Filters
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-text text-sm">No Financial Records Yet</p>
                            <p className="text-text-muted mt-1 max-w-sm mx-auto">
                              All inbound deposits, investments, returns, bonuses, and withdrawals will appear here chronologically with downloadable receipts.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const numAmt = toNum(tx.amount);
                      const isCredit = numAmt > 0;
                      const amountText = isCredit ? `+${formatCrypto(numAmt, 6)}` : formatCrypto(numAmt, 6);
                      const fullRef = tx.reference || `TX-${tx.id.slice(0, 8).toUpperCase()}`;

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="text-text-muted text-xs font-mono whitespace-nowrap">
                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-text font-semibold tracking-wide" title={fullRef}>
                                {fullRef.length > 14 ? `${fullRef.slice(0, 14)}...` : fullRef}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(fullRef)}
                                className="text-text-muted hover:text-accent p-0.5"
                                title="Copy full reference"
                              >
                                {copiedRef === fullRef ? (
                                  <Check className="w-3 h-3 text-success" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td>
                            {getTypeBadge(tx.type, tx.subtype)}
                          </td>
                          <td
                            className={`font-mono text-xs font-bold num whitespace-nowrap ${
                              isCredit ? "text-success" : "text-danger"
                            }`}
                          >
                            {amountText}
                          </td>
                          <td>
                            <span className="font-semibold text-text text-xs font-mono">
                              {tx.currency}
                            </span>
                          </td>
                          <td className="text-text-muted text-xs max-w-xs truncate" title={tx.description || ""}>
                            {tx.description || "—"}
                          </td>
                          <td>
                            <span
                              className={`badge text-[10px] uppercase font-mono ${
                                tx.status === "completed"
                                  ? "badge-success"
                                  : tx.status === "pending"
                                  ? "badge-warning"
                                  : "badge-danger"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptTxId(tx.id)}
                              className="btn btn-secondary btn-sm px-2.5 py-1 text-[11px] font-mono inline-flex items-center gap-1.5 text-[#C5A059] hover:text-white border-[#C5A059]/40 hover:border-[#C5A059]"
                              title="View and download authenticated receipt"
                            >
                              <ReceiptText className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border text-xs text-text-muted">
              <span>
                Current Page: <strong className="text-text font-mono">{page}</strong>
                {transactions.length > 0 && ` (${transactions.length} records shown)`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={transactions.length < limit}
                  className="btn btn-secondary btn-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal
        transactionId={selectedReceiptTxId}
        isOpen={!!selectedReceiptTxId}
        onClose={() => setSelectedReceiptTxId(null)}
      />
    </div>
  );
}
