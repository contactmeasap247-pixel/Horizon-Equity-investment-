"use client";

import { useEffect, useState } from "react";
import {
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
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

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `/transactions?skip=${skip}&limit=${limit}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;

      const response = await api.get(url);
      setTransactions(response.data);
    } catch (e) {
      console.error("Error loading transactions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, selectedType, selectedStatus]);

  // Handle filters toggle
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  return (
    <div className="card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-6 stagger-1 animate-slide-up">
      {/* Header and filters controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
        <h3 className="font-extrabold text-base flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-gold-300" /> Account Audit Ledgers
        </h3>

        {/* Filters options row */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Type selection */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted flex items-center gap-1">
              <Filter className="h-3 w-3" /> Type:
            </span>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="input py-1.5 px-3 bg-[#0A2540] border-white/5 rounded-lg w-auto text-xs"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="investment">Investments</option>
              <option value="return">Yield Returns</option>
              <option value="referral">Referral Bonus</option>
              <option value="adjustment">Adjustments</option>
            </select>
          </div>

          {/* Status selection */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="input py-1.5 px-3 bg-[#0A2540] border-white/5 rounded-lg w-auto text-xs"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main transactions audit table */}
      {isLoading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-300" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
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
                    <td colSpan={7} className="text-center py-8 text-text-muted">
                      No matching transaction entries logged in the system.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    const amountText = isCredit ? `+${tx.amount.toFixed(6)}` : tx.amount.toFixed(6);
                    const amountClass = isCredit ? "text-green-400" : "text-[#ff6b6b]";

                    return (
                      <tr key={tx.id}>
                        <td className="text-text-secondary whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="font-mono text-xs text-text-muted uppercase">
                          {tx.reference}
                        </td>
                        <td>
                          <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                            tx.type === "deposit" || tx.type === "return" || tx.type === "referral"
                              ? "badge-gold"
                              : "badge-btc"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`font-extrabold whitespace-nowrap ${amountClass}`}>
                          {amountText}
                        </td>
                        <td className="font-bold text-gold-300">{tx.currency}</td>
                        <td className="text-text-secondary text-xs max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td>
                          <span className={`badge uppercase text-[8px] py-0.5 px-1.5 ${
                            tx.status === "completed" ? "badge-success" : tx.status === "pending" ? "badge-warning" : "badge-danger"
                          }`}>
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

          {/* Pagination controls footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-text-secondary">
            <span>Page {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8 px-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={transactions.length < limit}
                className="h-8 px-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
