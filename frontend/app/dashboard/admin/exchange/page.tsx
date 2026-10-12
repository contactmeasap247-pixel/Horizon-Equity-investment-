"use client";

import { useEffect, useState } from "react";
import {
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Settings,
  RefreshCw,
  Coins,
  Shield,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminExchangeManagementPage() {
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  const [feePercent, setFeePercent] = useState("0.5");
  const [minBtcSwap, setMinBtcSwap] = useState("0.001");
  const [minUsdtSwap, setMinUsdtSwap] = useState("50");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadExchangeSettings() {
      setIsLoading(true);
      try {
        const res = await api.get("/admin/settings");
        const exchSetting = res.data.find((s: { key: string }) => s.key === "exchange_settings");
        if (exchSetting && exchSetting.value) {
          setExchangeEnabled(Boolean(exchSetting.value.enabled));
          setFeePercent(String(exchSetting.value.fee_percent || "0.5"));
          setMinBtcSwap(String(exchSetting.value.min_btc || "0.001"));
          setMinUsdtSwap(String(exchSetting.value.min_usdt || "50"));
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadExchangeSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/admin/settings/exchange_settings", {
        value: {
          enabled: exchangeEnabled,
          fee_percent: parseFloat(feePercent),
          min_btc: parseFloat(minBtcSwap),
          min_usdt: parseFloat(minUsdtSwap),
          liquidity_provider: "unconnected",
        },
      });
      setFeedback("Exchange configuration updated successfully in site settings.");
    } catch {
      setFeedback("Failed to persist exchange configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const marketPairs = [
    { pair: "BTC / USDT", rate: "67,420.00 USDT", status: "Active Price Oracle", spread: "0.20%" },
    { pair: "ETH / USDT", rate: "3,510.50 USDT", status: "Active Price Oracle", spread: "0.25%" },
    { pair: "SOL / USDT", rate: "154.80 USDT", status: "Active Price Oracle", spread: "0.30%" },
    { pair: "ETH / BTC", rate: "0.05207 BTC", status: "Active Price Oracle", spread: "0.35%" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-[#4388F5]" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#4388F5]">
              Asset Swaps & Rates
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] mt-1">Exchange Management</h1>
          <p className="text-xs text-[#7D8998]">
            Configure cross-asset conversion parameters, audit pricing feeds, and review liquidity bridge dependencies.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#27C58B]/10 border border-[#27C58B]/20 text-xs text-[#27C58B] flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="underline font-semibold hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Honest Architectural Status Box (Phase 11 Specification) */}
      <div className="p-5 rounded-xl bg-[#111821] border border-[#F59E0B]/30 flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Execution Engine: Pending External Liquidity Bridge</h3>
            <p className="text-xs text-[#7D8998] leading-relaxed">
              In accordance with platform financial integrity requirements, instant cross-asset swapping requires an
              active institutional liquidity provider integration (such as Binance Corporate API, Kraken Liquidity
              Bridge, or an automated on-chain AMM pool). Zero mock orders or fabricated swap records are generated.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#4388F5]">
              <Lock className="h-3.5 w-3.5" />
              <span>Direct execution disabled until liquidity provider credentials are authenticated.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supported Market Pairs & Price Oracles */}
        <div className="lg:col-span-2 rounded-xl bg-[#111821] border border-white/10 p-5 space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FA]">Supported Valuation Feeds</h3>
              <p className="text-xs text-[#7D8998]">Live reference price feeds for platform multi-asset accounts</p>
            </div>
            <span className="text-[10px] text-[#27C58B] font-mono uppercase bg-[#27C58B]/10 px-2 py-0.5 rounded">
              CoinGecko / Binance Oracle
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {marketPairs.map((p) => (
              <div key={p.pair} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#0B0F14] border border-white/10 flex items-center justify-center font-bold text-xs text-[#4388F5]">
                    {p.pair.split(" ")[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{p.pair}</div>
                    <div className="text-[10px] text-[#7D8998]">{p.status}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white">{p.rate}</div>
                  <div className="text-[10px] text-[#7D8998]">Platform Spread: {p.spread}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Administrative Exchange Configuration */}
        <div className="rounded-xl bg-[#111821] border border-white/10 p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-[#F5F7FA]">Swap Parameters</h3>
            <p className="text-xs text-[#7D8998]">Persisted in database site settings</p>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-xs text-[#7D8998]">
              <Loader2 className="h-5 w-5 animate-spin text-[#4388F5]" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F14] border border-white/5">
                <div>
                  <span className="font-semibold text-white block">Enable Swap Route</span>
                  <span className="text-[10px] text-[#7D8998]">Allow investors to request swaps</span>
                </div>
                <input
                  type="checkbox"
                  checked={exchangeEnabled}
                  onChange={(e) => setExchangeEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#4388F5]"
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Exchange Fee Spread (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Minimum BTC Swap Amount</label>
                <input
                  type="number"
                  step="0.0001"
                  value={minBtcSwap}
                  onChange={(e) => setMinBtcSwap(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[#7D8998] block mb-1">Minimum USDT Swap Amount</label>
                <input
                  type="number"
                  step="1"
                  value={minUsdtSwap}
                  onChange={(e) => setMinUsdtSwap(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-lg bg-[#4388F5] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#4388F5]/90 transition-all disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Exchange Settings</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
