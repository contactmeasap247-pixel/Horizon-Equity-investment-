"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Coins,
  ShieldCheck,
  Check,
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
      setWallets(response.data);
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
      setFormError("Please populate both Address and Label fields.");
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
        setFormSuccess(`System wallet for ${currency} updated successfully!`);
      } else {
        // Create wallet
        await api.post("/admin/wallets", {
          currency,
          wallet_address: address.trim(),
          label: label.trim(),
          is_active: isActive,
          is_primary: isPrimary,
        });
        setFormSuccess(`New system wallet for ${currency} created successfully!`);
      }

      // Reset
      handleCancelEdit();
      fetchWallets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Operation failed. Check details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm("Are you sure you want to delete this system address? It will disrupt pending user deposits assigned to this address.")) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.delete(`/admin/wallets/${walletId}`);
      setFormSuccess("System address deleted successfully.");
      fetchWallets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || "Deletion failed.");
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
    <div className="grid lg:grid-cols-12 gap-8 items-start stagger-1 animate-slide-up">
      {/* Left Column: Form to create or update */}
      <div className="lg:col-span-5 card bg-[#0D2D4A]/85 border-white/10 p-6 flex flex-col gap-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Coins className="h-4.5 w-4.5 text-gold-300" />{" "}
            {editingWallet ? `Edit ${currency} Address` : "Add System Address"}
          </h3>
        </div>

        {formError && (
          <div className="flex gap-2.5 items-start p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-[#ff6b6b]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="flex gap-2.5 items-start p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-[#00d4aa]">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Select Currency */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Select Cryptocurrency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input bg-[#0D2D4A] border-white/5"
              required
              disabled={submitting || editingWallet !== null} // Lock currency during edit
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>

          {/* Wallet Address */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Public Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste public key address"
              className="input text-xs font-mono"
              required
              disabled={submitting}
            />
          </div>

          {/* Wallet Label */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Address Description Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Main Ledger Vault"
              className="input"
              required
              disabled={submitting}
            />
          </div>

          {/* Active and Primary switches */}
          <div className="flex flex-col gap-3 pt-2 bg-white/[0.01] rounded-xl p-3 border border-white/5">
            {/* Active switch */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Active Status</span>
                <span className="text-[9px] text-text-muted mt-0.5">Let users deposit to this address</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-gold-300 cursor-pointer"
                disabled={submitting}
              />
            </div>
            
            {/* Primary switch */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Set as Primary Address</span>
                <span className="text-[9px] text-text-muted mt-0.5">Auto-assigns to new deposit requests</span>
              </div>
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 accent-gold-300 cursor-pointer"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex gap-3 justify-end text-xs mt-2">
            {editingWallet && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 hover:bg-white/5 rounded-lg font-semibold"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary flex-1 justify-center disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingWallet ? (
                "Save Address"
              ) : (
                <>
                  Create Address <Plus className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Address listings */}
      <div className="lg:col-span-7 card bg-[#0D2D4A]/80 border-white/10 p-6 flex flex-col gap-4">
        <h3 className="font-extrabold text-base flex items-center gap-2">
          <Wallet className="h-4.5 w-4.5 text-gold-300" /> Active System Addresses
        </h3>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Details</th>
                <th>Currency</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-text-muted">
                    No system addresses configured. Use the form to add one.
                  </td>
                </tr>
              ) : (
                wallets.map((w) => (
                  <tr key={w.id}>
                    <td className="flex flex-col gap-1">
                      <span className="font-bold text-xs text-white">{w.label}</span>
                      <span className="font-mono text-[9px] text-text-muted select-all max-w-[200px] truncate">
                        {w.wallet_address}
                      </span>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-2">
                        <span className="font-bold text-gold-300 text-xs">{w.currency}</span>
                        {w.is_primary && (
                          <span className="badge badge-gold uppercase text-[8px] py-0.5 px-1.5 inline-flex items-center gap-0.5">
                            <Check className="h-2 w-2" /> Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {w.is_active ? (
                        <span className="badge badge-success uppercase text-[8px] py-0.5 px-2">
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-danger uppercase text-[8px] py-0.5 px-2">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEditInit(w)}
                          disabled={submitting}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded border border-white/5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          disabled={submitting}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] rounded border border-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
  );
}
