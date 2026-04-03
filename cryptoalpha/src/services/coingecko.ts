/**
 * CoinGecko simple price API.
 * Optional `VITE_COINGECKO_API_KEY`: Demo → `x-cg-demo-api-key`; if `VITE_COINGECKO_API_BASE`
 * points at `pro-api.coingecko.com`, uses `x-cg-pro-api-key` instead.
 */
const DEFAULT_BASE = "https://api.coingecko.com/api/v3";

export type CoinPriceRow = {
  usd: number;
  usd_24h_change?: number;
};

export type SimplePriceMap = Record<string, CoinPriceRow>;

function apiBase(): string {
  const raw = import.meta.env.VITE_COINGECKO_API_BASE?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BASE;
}

export async function fetchSimplePrices(
  ids: string[]
): Promise<SimplePriceMap> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};

  const url = new URL(`${apiBase()}/simple/price`);
  url.searchParams.set("ids", unique.join(","));
  url.searchParams.set("vs_currencies", "usd");
  url.searchParams.set("include_24hr_change", "true");

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = import.meta.env.VITE_COINGECKO_API_KEY?.trim();
  if (key) {
    if (apiBase().includes("pro-api.coingecko.com")) {
      headers["x-cg-pro-api-key"] = key;
    } else {
      headers["x-cg-demo-api-key"] = key;
    }
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `CoinGecko HTTP ${res.status}${text ? `: ${text.slice(0, 160)}` : ""}`
    );
  }

  const data = (await res.json()) as Record<
    string,
    { usd?: number; usd_24h_change?: number | null }
  >;

  const out: SimplePriceMap = {};
  for (const id of unique) {
    const row = data[id];
    if (typeof row?.usd === "number" && Number.isFinite(row.usd)) {
      out[id] = {
        usd: row.usd,
        usd_24h_change:
          typeof row.usd_24h_change === "number" &&
          Number.isFinite(row.usd_24h_change)
            ? row.usd_24h_change
            : undefined,
      };
    }
  }
  return out;
}

export type CoinSearchHit = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
};

export async function searchCoins(query: string): Promise<CoinSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL(`${apiBase()}/search`);
  url.searchParams.set("query", q);

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = import.meta.env.VITE_COINGECKO_API_KEY?.trim();
  if (key) {
    if (apiBase().includes("pro-api.coingecko.com")) {
      headers["x-cg-pro-api-key"] = key;
    } else {
      headers["x-cg-demo-api-key"] = key;
    }
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    coins?: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
    }[];
  };
  return (data.coins ?? []).slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    thumb: c.thumb,
  }));
}

export type TrendingCoin = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  marketCapRank: number | null;
  score: number;
};

export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  const url = `${apiBase()}/search/trending`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = import.meta.env.VITE_COINGECKO_API_KEY?.trim();
  if (key) {
    if (apiBase().includes("pro-api.coingecko.com")) {
      headers["x-cg-pro-api-key"] = key;
    } else {
      headers["x-cg-demo-api-key"] = key;
    }
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`CoinGecko trending HTTP ${res.status}`);
  const data = (await res.json()) as {
    coins?: {
      item: {
        id: string;
        name: string;
        symbol: string;
        thumb?: string;
        small?: string;
        market_cap_rank?: number | null;
        score?: number | null;
      };
    }[];
  };

  return (data.coins ?? []).slice(0, 8).map((c) => {
    const it = c.item;
    return {
      id: it.id,
      name: it.name,
      symbol: (it.symbol ?? "").toUpperCase(),
      thumb: it.small ?? it.thumb ?? "",
      marketCapRank:
        typeof it.market_cap_rank === "number" ? it.market_cap_rank : null,
      score: typeof it.score === "number" ? it.score : 0,
    };
  });
}
