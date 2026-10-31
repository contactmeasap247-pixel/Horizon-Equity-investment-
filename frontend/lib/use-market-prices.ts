"use client";

import { useEffect, useState, useCallback } from "react";

export interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  rawPrice: number;
  change: string;
  rawChange?: number;
  up: boolean;
  volume: string;
  marketType?: "crypto" | "stock" | "index" | "commodity" | "forex";
  marketStatus?: "open" | "closed";
  quoteType?: "realtime" | "delayed" | "close" | "reference";
  timestamp?: string;
  currency?: string;
}

export interface MarketCategory {
  name: string;
  description: string;
  items: MarketItem[];
}

export interface MarketRates {
  BTC: number;
  ETH: number;
  SOL: number;
  USDT: number;
  GOLD: number;
  SILVER: number;
  EUR_USD: number;
  GBP_USD: number;
  USD_JPY: number;
  CRUDE: number;
  SPX: number;
  NVDA: number;
  AAPL: number;
  TSLA: number;
  [key: string]: number;
}

const DEFAULT_RATES: MarketRates = {
  BTC: 77464.02,
  ETH: 2251.23,
  SOL: 95.68,
  USDT: 1.0,
  GOLD: 3898.9,
  SILVER: 49.28,
  EUR_USD: 1.1166,
  GBP_USD: 1.3385,
  USD_JPY: 157.49,
  CRUDE: 104.12,
  SPX: 7580.07,
  NVDA: 204.64,
  AAPL: 344.63,
  TSLA: 399.81,
};

export function useMarketPrices() {
  const [rates, setRates] = useState<MarketRates>(DEFAULT_RATES);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [ticker, setTicker] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/market-prices", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setRates((prev) => ({ ...prev, ...data.rates }));
        }
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.ticker)) {
          setTicker(data.ticker);
        }
        if (typeof data.is_stale === "boolean") {
          setIsStale(data.is_stale);
        }
        setLastUpdated(new Date(data.updated_at || Date.now()));
      }
    } catch (e) {
      console.warn("Market prices polling fallback active:", e);
      setIsStale(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    rates,
    categories,
    ticker,
    isLoading,
    isStale,
    lastUpdated,
    refresh: fetchPrices,
  };
}
