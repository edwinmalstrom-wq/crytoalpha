export type FearGreedResult = {
  value: number;
  label: string;
};

/** Alternative.me Crypto Fear & Greed Index (updates ~daily). */
export async function fetchFearGreedIndex(): Promise<FearGreedResult> {
  const res = await fetch("https://api.alternative.me/fng/?limit=1", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Fear & Greed HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    data?: { value?: string; value_classification?: string }[];
  };
  const row = data.data?.[0];
  const value = row?.value != null ? Number(row.value) : NaN;
  const label = (row?.value_classification ?? "—").toUpperCase();
  if (!Number.isFinite(value)) {
    throw new Error("Fear & Greed: invalid payload");
  }
  return { value: Math.min(100, Math.max(0, value)), label };
}
