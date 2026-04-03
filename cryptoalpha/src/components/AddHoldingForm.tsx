import { type FormEvent, useEffect, useState } from "react";
import { searchCoins, type CoinSearchHit } from "../services/coingecko";
import type { StoredHolding } from "../types/portfolio";

type Props = {
  onAdd: (h: Omit<StoredHolding, "id">) => void;
};

export function AddHoldingForm({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CoinSearchHit[]>([]);
  const [selected, setSelected] = useState<CoinSearchHit | null>(null);
  const [amount, setAmount] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = window.setTimeout(() => {
      void searchCoins(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 320);
    return () => window.clearTimeout(t);
  }, [query]);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const amt = Number(amount);
    const entry = Number(entryPrice);
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (!Number.isFinite(entry) || entry < 0) return;
    onAdd({
      coingeckoId: selected.id,
      name: selected.name,
      symbol: selected.symbol.toUpperCase(),
      thumb: selected.thumb,
      amount: amt,
      entryPrice: entry,
    });
    setSelected(null);
    setAmount("");
    setEntryPrice("");
    setQuery("");
    setResults([]);
  }

  return (
    <form
      onSubmit={handleAdd}
      className="rounded-xl border border-border bg-black/30 p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Add holding
      </p>
      <p className="mt-1 text-xs text-muted">
        Search CoinGecko, then enter size and average cost (USD).
      </p>

      <div className="relative mt-3">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Search coin (e.g. Bitcoin)"
          className="w-full rounded-lg border border-border bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-teal/30 placeholder:text-muted focus:ring-2"
          autoComplete="off"
        />
        {searching ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">
            …
          </span>
        ) : null}
        {results.length > 0 && !selected ? (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-panel py-1 shadow-xl">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(c);
                    setResults([]);
                    setQuery(`${c.name} (${c.symbol})`);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  {c.thumb ? (
                    <img
                      src={c.thumb}
                      alt=""
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">
                      {c.symbol.slice(0, 1)}
                    </span>
                  )}
                  <span>
                    {c.name}{" "}
                    <span className="text-muted">({c.symbol})</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            Amount ({selected.symbol})
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal/30 focus:ring-2"
              required
            />
          </label>
          <label className="block text-xs text-muted">
            Avg entry (USD)
            <input
              type="text"
              inputMode="decimal"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-border bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal/30 focus:ring-2"
              required
            />
          </label>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!selected}
        className="mt-4 w-full rounded-lg bg-teal py-2.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add to portfolio
      </button>
    </form>
  );
}
