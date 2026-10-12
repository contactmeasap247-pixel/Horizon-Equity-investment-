"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Coins,
  ShieldCheck,
  Check,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";

interface AdminWallet {
  id: string;
  currency: string;
  wallet_address: string;
  label: string;
  is_active: boolean;
  is_primary: boolean;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingWallet, setEditingWallet] = useState<AdminWallet | null>(null);

  // Form states
  const [currency, setCurrency] = useState("BTC");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      const response = await api.get("/admin/wallets");
      setWallets(response.data || []);
    } catch (e) {
      console.error("Error loading admin wallets:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleEditInit = (w: AdminWallet) => {
    setEditingWallet(w);
    setCurrency(w.currency);
    setAddress(w.wallet_address);
    setLabel(w.label);
    setIsActive(w.is_active);
    setIsPrimary(w.is_primary);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingWallet(null);
    setCurrency("BTC");
    setAddress("");
    setLabel("");
    setIsActive(true);
    setIsPrimary(false);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !label) {
      setFormError("Please populate both the public wallet address and description label.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (editingWallet) {
        // Update wallet
        await api.put(`/admin/wallets/${editingWallet.id}`, {
          wallet_address: address.trim(),
          label: label.trim(),
          is_active: isActive,
          is_primary: isPrimary,
        });
        setFormSuccess(`Custodial address for ${currency} updated successfully.`);
      } else {
        // Create wallet
        await api.post("/admin/wallets", {
          currency,
          wallet_address: address.trim(),
          label: label.trim(),
          is_active: isActive,
          is_primary: isPrimary,
        });
        setFormSuccess(`New custodial deposit address for ${currency} registered.`);
      }

      handleCancelEdit();
      fetchWallets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Operation failed. Please verify address syntax.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm("Are you sure you want to delete this custodial address? Any pending user deposits targeted to this address will require manual reconciliation.")) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.delete(`/admin/wallets/${walletId}`);
      setFormSuccess("Custodial address removed from active routing.");
      fetchWallets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Address deletion failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-text-muted">Loading custodial addresses...</p>
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
              <Link
                href="/dashboard/admin"
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Clearing Terminal
              </Link>
            </div>
            <h1 className="t-page">Custodial Vault Addresses</h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Configure multi-currency deposit destination addresses presented to investors on the deposits terminal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge font-mono text-[10px]">
              {wallets.length} Addresses Configured
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Add/Edit Form */}
        <div className="lg:col-span-5 panel p-6 space-y-5">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" />
              {editingWallet ? `Edit ${currency} Address` : "Register New Deposit Address"}
            </h2>
          </div>

          {formError && (
            <div className="alert alert-danger text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}
          {formSuccess && (
            <div className="alert alert-success text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
              <div className="leading-relaxed">{formSuccess}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Currency selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Target Cryptocurrency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="select"
                required
                disabled={submitting || editingWallet !== null}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>

            {/* Wallet Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Public On-Chain Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste public deposit address or key"
                className="input font-mono text-xs"
                required
                disabled={submitting}
              />
            </div>

            {/* Wallet Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Internal Label / Description</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Fireblocks Vault 1, Main Cold Storage"
                className="input text-xs"
                required
                disabled={submitting}
              />
            </div>

            {/* Switches */}
            <div className="inset p-3.5 rounded-lg border border-border space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-text">Active Routing Status</div>
                  <div className="text-[10px] text-text-muted">Allow investors to generate and deposit to this address</div>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded"
                  disabled={submitting}
                />
              </label>

              <div className="pt-2 border-t border-border-subtle">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-text">Primary Default Address</div>
                    <div className="text-[10px] text-text-muted">Set as the primary deposit address displayed for {currency}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                    disabled={submitting}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {editingWallet && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary text-xs px-4 py-2"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary text-xs px-4 py-2 flex-1 justify-center"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingWallet ? (
                  "Update Vault Address"
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Register Address
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Addresses Listing Table */}
        <div className="lg:col-span-7 panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="t-title flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent" />
              Active System Addresses
            </h2>
            <span className="badge font-mono text-[10px]">
              {wallets.length} Active
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Vault Label &amp; Address</th>
                  <th>Asset</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-text-muted text-xs">
                      No system custodial addresses configured yet.
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <div className="font-semibold text-text text-xs">{w.label}</div>
                        <div className="font-mono text-[11px] text-text-faint truncate max-w-[200px] select-all">
                          {w.wallet_address}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-text text-xs">{w.currency}</span>
                          {w.is_primary && (
                            <span className="badge badge-accent text-[9px] uppercase font-mono py-0 px-1.5 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Primary
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {w.is_active ? (
                          <span className="badge badge-success text-[10px] uppercase font-mono">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-danger text-[10px] uppercase font-mono">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditInit(w)}
                            disabled={submitting}
                            className="btn btn-secondary btn-sm p-1.5"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(w.id)}
                            disabled={submitting}
                            className="btn btn-secondary btn-sm text-danger hover:bg-danger/15 p-1.5"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
