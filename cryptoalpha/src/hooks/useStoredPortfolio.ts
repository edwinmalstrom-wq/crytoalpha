import { useCallback, useEffect, useState } from "react";
import type { StoredHolding } from "../types/portfolio";

const STORAGE_KEY = "cryptoalpha-portfolio-v1";

function load(): StoredHolding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidHolding);
  } catch {
    return [];
  }
}

function isValidHolding(x: unknown): x is StoredHolding {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.coingeckoId === "string" &&
    typeof o.name === "string" &&
    typeof o.symbol === "string" &&
    typeof o.amount === "number" &&
    Number.isFinite(o.amount) &&
    typeof o.entryPrice === "number" &&
    Number.isFinite(o.entryPrice) &&
    o.amount >= 0 &&
    o.entryPrice >= 0
  );
}

function persist(holdings: StoredHolding[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

export function useStoredPortfolio() {
  const [holdings, setHoldings] = useState<StoredHolding[]>(() =>
    typeof window === "undefined" ? [] : load()
  );

  useEffect(() => {
    persist(holdings);
  }, [holdings]);

  const add = useCallback((h: Omit<StoredHolding, "id">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setHoldings((prev) => [...prev, { ...h, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clear = useCallback(() => setHoldings([]), []);

  return { holdings, add, remove, clear };
}
