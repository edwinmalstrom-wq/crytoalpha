import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MARKET_OVERVIEW_ROWS,
  TARGET_MULTIPLIER,
} from "../data/config";
import { fetchEthereumGasOracle, type GasOracleResult } from "../services/gasOracle";
import { fetchFearGreedIndex, type FearGreedResult } from "../services/fearGreed";
import {
  fetchSimplePrices,
  fetchTrendingCoins,
  type SimplePriceMap,
  type TrendingCoin,
} from "../services/coingecko";
import type { StoredHolding } from "../types/portfolio";

const REFRESH_MS = 30_000;

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type ComputedHolding = StoredHolding & {
  price: number;
  priceSource: "live" | "fallback";
  value: number;
  costBasis: number;
  pnl: number;
  pnlPct: number;
  multi: number;
};

export type MarketOverviewRow = (typeof MARKET_OVERVIEW_ROWS)[number] & {
  price: number;
  change24h: number;
  priceSource: "live" | "fallback";
};

export type TrendingRow = TrendingCoin & {
  priceUsd: number | null;
  change24h: number | null;
  priceSource: "live" | "fallback";
};

export function useDashboard(holdings: StoredHolding[]) {
  const [prices, setPrices] = useState<SimplePriceMap>({});
  const [trendingMeta, setTrendingMeta] = useState<TrendingCoin[]>([]);
  const trendingRef = useRef<TrendingCoin[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedResult | null>(null);
  const [gas, setGas] = useState<GasOracleResult | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const holdingsKey = useMemo(
    () =>
      holdings
        .map((h) => `${h.id}:${h.coingeckoId}:${h.amount}:${h.entryPrice}`)
        .join("|"),
    [holdings]
  );

  const load = useCallback(async () => {
    setIsRefreshing(true);

    const [fg, g, t] = await Promise.all([
      fetchFearGreedIndex().catch(() => null),
      fetchEthereumGasOracle().catch(() => null),
      fetchTrendingCoins().catch(() => null),
    ]);

    if (fg) setFearGreed(fg);
    if (g) setGas(g);

    const effectiveTrend =
      t && t.length > 0 ? t : trendingRef.current;
    if (t && t.length > 0) {
      trendingRef.current = t;
      setTrendingMeta(t);
    }
    const trendIds = effectiveTrend.map((c) => c.id);

    const holdingIds = holdings.map((h) => h.coingeckoId);
    const marketIds = MARKET_OVERVIEW_ROWS.map((r) => r.coingeckoId);
    const allIds = [...new Set([...holdingIds, ...marketIds, ...trendIds])];

    try {
      if (allIds.length > 0) {
        const next = await fetchSimplePrices(allIds);
        setPrices((prev) => ({ ...prev, ...next }));
      }
      setError(null);
      setHasLoadedOnce(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prices");
    }

    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, [holdingsKey, holdings]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const forceRefresh = useCallback(() => {
    void load();
  }, [load]);

  const computedHoldings = useMemo((): ComputedHolding[] => {
    return holdings.map((h) => {
      const live = prices[h.coingeckoId];
      const hasLive =
        live?.usd != null && Number.isFinite(live.usd) ? live.usd : null;
      const price = hasLive ?? h.entryPrice;
      const priceSource: "live" | "fallback" = hasLive != null ? "live" : "fallback";
      const value = h.amount * price;
      const costBasis = h.amount * h.entryPrice;
      const pnl = value - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      const multi = costBasis > 0 ? value / costBasis : 0;
      return {
        ...h,
        price,
        priceSource,
        value,
        costBasis,
        pnl,
        pnlPct,
        multi,
      };
    });
  }, [holdings, prices]);

  const portfolioValue = useMemo(
    () => computedHoldings.reduce((s, h) => s + h.value, 0),
    [computedHoldings]
  );

  const totalCostBasis = useMemo(
    () => computedHoldings.reduce((s, h) => s + h.costBasis, 0),
    [computedHoldings]
  );

  const targetValue = totalCostBasis * TARGET_MULTIPLIER;
  const progressPct =
    targetValue > 0 ? (portfolioValue / targetValue) * 100 : 0;
  const allTimePnl = portfolioValue - totalCostBasis;
  const allTimePnlPct =
    totalCostBasis > 0 ? (allTimePnl / totalCostBasis) * 100 : 0;

  const marketOverview = useMemo((): MarketOverviewRow[] => {
    return MARKET_OVERVIEW_ROWS.map((r) => {
      const live = prices[r.coingeckoId];
      const hasLive =
        live?.usd != null && Number.isFinite(live.usd) ? live.usd : null;
      const price = hasLive ?? r.fallbackUsd;
      const change24h =
        typeof live?.usd_24h_change === "number" &&
        Number.isFinite(live.usd_24h_change)
          ? live.usd_24h_change
          : 0;
      const priceSource: "live" | "fallback" = hasLive != null ? "live" : "fallback";
      return { ...r, price, change24h, priceSource };
    });
  }, [prices]);

  const trendingRows = useMemo((): TrendingRow[] => {
    return trendingMeta.map((c) => {
      const live = prices[c.id];
      const hasLive =
        live?.usd != null && Number.isFinite(live.usd) ? live.usd : null;
      const ch =
        typeof live?.usd_24h_change === "number" &&
        Number.isFinite(live.usd_24h_change)
          ? live.usd_24h_change
          : null;
      return {
        ...c,
        priceUsd: hasLive,
        change24h: ch,
        priceSource: hasLive != null ? "live" : "fallback",
      };
    });
  }, [trendingMeta, prices]);

  const liveHoldingsCount = computedHoldings.filter(
    (h) => h.priceSource === "live"
  ).length;
  const usingFallback =
    computedHoldings.length > 0 &&
    (liveHoldingsCount < computedHoldings.length ||
      marketOverview.some((m) => m.priceSource === "fallback"));

  return {
    holdings: computedHoldings,
    portfolioValue,
    totalCostBasis,
    targetValue,
    progressPct,
    allTimePnl,
    allTimePnlPct,
    marketOverview,
    trendingRows,
    fearGreed,
    gas,
    lastRefresh,
    forceRefresh,
    formatMoney,
    isRefreshing,
    hasLoadedOnce,
    error,
    usingFallback,
  };
}
