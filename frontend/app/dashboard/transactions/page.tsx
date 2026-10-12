"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "@/lib/api";

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  reference: string;
  description: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering & Pagination states
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `/transactions?skip=${skip}&limit=${limit}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      const response = await api.get(url);
      setTransactions(response.data || []);
    } catch (e) {
      console.error("Error loading transactions:", e);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedType, selectedStatus]);

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
              Chronological, double-entry audit record of custodial deposits, withdrawals, yield settlements, affiliate rebates, and adjustments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge font-mono text-[10px]">
              Page {page} &bull; 20 items/page
            </span>
          </div>
        </div>
      </div>

      {/* Main Ledger Panel */}
      <div className="panel p-6 space-y-6">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              Filter Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="tx-type-filter" className="text-xs text-text-muted font-medium">Type:</label>
              <select
                id="tx-type-filter"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="select py-1.5 px-3 text-xs w-auto"
              >
                <option value="">All Operations</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="investment">Investments</option>
                <option value="return">Yield Returns</option>
                <option value="referral">Referral Rebates</option>
                <option value="adjustment">Adjustments</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="tx-status-filter" className="text-xs text-text-muted font-medium">Status:</label>
              <select
                id="tx-status-filter"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="select py-1.5 px-3 text-xs w-auto"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Table */}
        {isLoading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs text-text-muted">Querying audit records...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Asset</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-text-muted text-xs">
                        <FileSpreadsheet className="w-8 h-8 text-text-faint mx-auto mb-2" />
                        No matching transaction logs found for the applied filter parameters.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isCredit = tx.amount > 0;
                      const amountText = isCredit ? `+${tx.amount.toFixed(6)}` : tx.amount.toFixed(6);

                      return (
                        <tr key={tx.id}>
                          <td className="text-text-muted text-xs font-mono whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                          <td className="font-mono text-xs text-text-faint uppercase">
                            {tx.reference ? tx.reference.slice(0, 10) : "—"}
                          </td>
                          <td>
                            <span className="badge badge-accent text-[10px] uppercase font-mono">
                              {tx.type}
                            </span>
                          </td>
                          <td
                            className={`font-mono text-xs font-bold num whitespace-nowrap ${
                              isCredit ? "text-success" : "text-danger"
                            }`}
                          >
                            {amountText}
                          </td>
                          <td>
                            <span className="font-semibold text-text text-xs">
                              {tx.currency}
                            </span>
                          </td>
                          <td className="text-text text-xs max-w-xs truncate">
                            {tx.description}
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-muted">
              <span>Current Page: <strong className="text-text font-mono">{page}</strong></span>
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
    </div>
  );
}
