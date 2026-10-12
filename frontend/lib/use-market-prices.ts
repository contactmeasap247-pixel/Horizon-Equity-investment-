"use client";

import { useEffect, useState, useCallback } from "react";

export interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  rawPrice: number;
  change: string;
  up: boolean;
  volume: string;
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
  BTC: 82650.0,
  ETH: 2530.0,
  SOL: 110.0,
  USDT: 1.0,
  GOLD: 4160.0,
  SILVER: 49.4,
  EUR_USD: 1.1203,
  GBP_USD: 1.3234,
  USD_JPY: 158.2,
  CRUDE: 74.85,
  SPX: 5865.4,
  NVDA: 138.25,
  AAPL: 229.4,
  TSLA: 258.9,
};

export function useMarketPrices() {
  const [rates, setRates] = useState<MarketRates>(DEFAULT_RATES);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn("Market prices polling fallback active:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    rates,
    categories,
    isLoading,
    lastUpdated,
    refresh: fetchPrices,
  };
}
