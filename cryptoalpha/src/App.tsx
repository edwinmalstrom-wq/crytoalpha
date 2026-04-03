import { useMemo } from "react";
import {
  ChevronDown,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AddHoldingForm } from "./components/AddHoldingForm";
import { EVM_CHAIN_LABELS, MultiWalletBar } from "./components/MultiWalletBar";
import { Badge } from "./components/Badge";
import { Card } from "./components/Card";
import { ProgressBar } from "./components/ProgressBar";
import { useDashboard } from "./hooks/useDashboard";
import { useStoredPortfolio } from "./hooks/useStoredPortfolio";

function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return formatUsd(n);
}

function fearGreedVisual(value: number) {
  if (value <= 24) {
    return {
      border: "border-danger",
      text: "text-danger",
      glow: "rgba(255, 77, 77, 0.35)",
      barFrom: "from-danger/50",
    };
  }
  if (value <= 44) {
    return {
      border: "border-orange-600",
      text: "text-orange-400",
      glow: "rgba(234, 88, 12, 0.3)",
      barFrom: "from-orange-600/50",
    };
  }
  if (value <= 55) {
    return {
      border: "border-amber-500",
      text: "text-amber-300",
      glow: "rgba(245, 158, 11, 0.25)",
      barFrom: "from-amber-500/40",
    };
  }
  if (value <= 74) {
    return {
      border: "border-teal/80",
      text: "text-teal",
      glow: "rgba(0, 255, 163, 0.25)",
      barFrom: "from-teal/40",
    };
  }
  return {
    border: "border-teal",
    text: "text-teal",
    glow: "rgba(0, 255, 163, 0.45)",
    barFrom: "from-teal/60",
  };
}

export default function App() {
  const { holdings: stored, add, remove } = useStoredPortfolio();
  const {
    holdings,
    portfolioValue,
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
    totalCostBasis,
  } = useDashboard(stored);

  const fgStyle = useMemo(
    () => fearGreedVisual(fearGreed?.value ?? 50),
    [fearGreed?.value]
  );

  return (
    <div className="min-h-screen bg-surface px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <header className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CryptoAlpha
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            25x Portfolio Tracker
          </p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">
            EVM: MetaMask, Trust, Phantom (ETH), Coinbase, Rainbow — plus
            Uniswap Wallet, WalletConnect, and Ledger once you set{" "}
            <code className="text-muted/80">VITE_WALLETCONNECT_PROJECT_ID</code>
            . Solana (Phantom / Solflare) and Sui use their own connect buttons.
            Chains: {EVM_CHAIN_LABELS}, Solana, Sui.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:max-w-xl lg:items-end">
          <MultiWalletBar />
          <div
            className="flex flex-col items-end gap-0.5 text-xs font-medium uppercase tracking-wider"
            title={error ?? undefined}
          >
            <span className="flex items-center gap-2 text-muted">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  !hasLoadedOnce && isRefreshing
                    ? "animate-pulse bg-amber-500"
                    : error && !hasLoadedOnce
                      ? "bg-danger"
                      : usingFallback
                        ? "bg-amber-500"
                        : "bg-teal"
                }`}
                aria-hidden
              />
              {!hasLoadedOnce && isRefreshing
                ? "Loading markets…"
                : error && !hasLoadedOnce
                  ? "Feeds offline"
                  : usingFallback
                    ? "Some prices cached"
                    : "Live feeds"}
            </span>
            {error && hasLoadedOnce ? (
              <span className="text-[10px] normal-case text-amber-500/90">
                Prices: {error.slice(0, 48)}
                {error.length > 48 ? "…" : ""}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl space-y-10">
        <section className="grid gap-6 lg:grid-cols-5">
          <Card className="p-6 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Portfolio value
            </p>
            {stored.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Add your positions below (search CoinGecko). Your 25× target and
                multipliers use the amounts and average cost you enter—nothing
                here is paper demo data.
              </p>
            ) : (
              <>
                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-bold tabular-nums text-white sm:text-5xl">
                    {formatMoney(portfolioValue)}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-lg font-semibold ${
                      allTimePnlPct >= 0 ? "text-teal" : "text-danger"
                    }`}
                  >
                    {allTimePnlPct >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {totalCostBasis > 0
                      ? `${allTimePnlPct >= 0 ? "+" : ""}${allTimePnlPct.toFixed(2)}%`
                      : "—"}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    allTimePnl >= 0 ? "text-teal" : "text-danger"
                  }`}
                >
                  {totalCostBasis > 0 ? (
                    <>
                      {allTimePnl >= 0 ? "+" : ""}
                      {formatMoney(allTimePnl)} all time
                    </>
                  ) : (
                    "Enter cost basis on each holding for P&L."
                  )}
                </p>
                <div className="mt-8">
                  <ProgressBar
                    label="25x target"
                    sublabel={
                      totalCostBasis > 0
                        ? formatMoney(targetValue)
                        : "Add holdings"
                    }
                    percent={totalCostBasis > 0 ? progressPct : 0}
                    footer={
                      totalCostBasis > 0
                        ? `${progressPct.toFixed(2)}% achieved`
                        : "Based on your total cost basis × 25"
                    }
                  />
                </div>
              </>
            )}
          </Card>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card className="flex flex-1 flex-col items-center justify-center p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Fear &amp; greed index
              </p>
              <p className="mt-1 text-[10px] text-muted">
                Alternative.me · updates ~daily
              </p>
              {fearGreed ? (
                <>
                  <div
                    className={`relative mt-4 flex h-36 w-36 items-center justify-center rounded-full border-4 bg-gradient-to-b to-black ${fgStyle.border} ${fgStyle.barFrom}`}
                    style={{ boxShadow: `0 0 40px ${fgStyle.glow}` }}
                  >
                    <div className="text-center">
                      <span
                        className={`text-5xl font-bold tabular-nums ${fgStyle.text}`}
                      >
                        {fearGreed.value}
                      </span>
                      <p
                        className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${fgStyle.text}`}
                      >
                        {fearGreed.label}
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-5 h-2 w-full max-w-[220px] rounded-full bg-gradient-to-r from-danger via-amber-400 to-teal">
                    <div
                      className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-sm bg-white shadow"
                      style={{
                        left: `${fearGreed.value}%`,
                        marginLeft: -2,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-8 text-sm text-muted">Loading sentiment…</p>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Gas tracker
                </p>
                {gas ? (
                  <span className="text-[10px] uppercase text-muted">
                    {gas.source === "etherscan" ? "Etherscan" : "ETH RPC"}
                  </span>
                ) : null}
              </div>
              {gas ? (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["Low", gas.low],
                        ["Avg", gas.avg],
                        ["Fast", gas.fast],
                      ] as const
                    ).map(([tier, g]) => (
                      <div
                        key={tier}
                        className="rounded-lg border border-border bg-black/40 px-2 py-3 text-center"
                      >
                        <p className="text-[10px] uppercase text-muted">
                          {tier}
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-white">
                          {g.gwei}
                        </p>
                        <p className="text-[10px] text-muted">{g.eta}</p>
                      </div>
                    ))}
                  </div>
                  <p
                    className={`mt-3 text-center text-xs font-medium ${
                      gas.networkActivity.includes("Very high") ||
                      gas.networkActivity.includes("Elevated")
                        ? "text-amber-400"
                        : "text-teal"
                    }`}
                  >
                    {gas.networkActivity}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">Fetching gas…</p>
              )}
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted">
                    <th className="px-5 py-4">Asset</th>
                    <th className="px-3 py-4">Price</th>
                    <th className="px-3 py-4">Amount</th>
                    <th className="px-3 py-4">Value</th>
                    <th className="px-3 py-4">P&amp;L</th>
                    <th className="px-3 py-4 text-right">Multi</th>
                    <th className="w-12 px-2 py-4" aria-label="Remove" />
                  </tr>
                </thead>
                <tbody>
                  {holdings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm text-muted"
                      >
                        No holdings yet. Use{" "}
                        <span className="text-white">Add holding</span> under
                        this table.
                      </td>
                    </tr>
                  ) : (
                    holdings.map((h) => {
                      const pos = h.pnl >= 0;
                      return (
                        <tr
                          key={h.id}
                          className="border-b border-border/80 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {h.thumb ? (
                                <img
                                  src={h.thumb}
                                  alt=""
                                  className="h-9 w-9 rounded-full border border-border object-cover"
                                />
                              ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/5 text-sm font-bold text-white">
                                  {h.symbol.slice(0, 1)}
                                </span>
                              )}
                              <div>
                                <p className="font-semibold text-white">
                                  {h.name}
                                </p>
                                <p className="text-xs text-muted">
                                  {h.symbol}
                                  {h.priceSource === "fallback" ? (
                                    <span className="ml-1 text-amber-500/90">
                                      · est.
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 tabular-nums text-white">
                            {formatMoney(h.price)}
                          </td>
                          <td className="px-3 py-4 tabular-nums text-muted">
                            {h.amount.toLocaleString("en-US", {
                              maximumFractionDigits: 8,
                            })}{" "}
                            {h.symbol}
                          </td>
                          <td className="px-3 py-4 tabular-nums font-medium text-white">
                            {formatMoney(h.value)}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`font-semibold tabular-nums ${
                                pos ? "text-teal" : "text-danger"
                              }`}
                            >
                              {pos ? "+" : ""}
                              {formatMoney(h.pnl)}
                            </span>
                            <span
                              className={`ml-2 text-xs tabular-nums ${
                                pos ? "text-teal" : "text-danger"
                              }`}
                            >
                              ({pos ? "+" : ""}
                              {h.pnlPct.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <Badge variant={pos ? "positive" : "negative"}>
                              {h.multi.toFixed(2)}x
                            </Badge>
                          </td>
                          <td className="px-2 py-4">
                            <button
                              type="button"
                              onClick={() => remove(h.id)}
                              className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-danger"
                              aria-label={`Remove ${h.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div id="add-holding">
            <AddHoldingForm onAdd={add} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Section — Intelligence &amp; tools
          </h2>
          <div className="grid gap-4 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Alpha signals
                </h3>
                <span className="text-[10px] uppercase text-muted">
                  Live · Trending
                </span>
              </div>
              {trendingRows.length === 0 ? (
                <p className="mt-6 text-sm text-muted">Loading trending…</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {trendingRows.map((a) => {
                    const ch = a.change24h;
                    const hasCh = typeof ch === "number" && Number.isFinite(ch);
                    return (
                      <li
                        key={a.id}
                        className="rounded-lg border border-border bg-black/30 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {a.thumb ? (
                            <img
                              src={a.thumb}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium text-white">
                                {a.name}
                              </span>
                              <Badge variant="positive">Trending</Badge>
                            </div>
                            <p className="text-xs text-muted">
                              {a.symbol}
                              {a.marketCapRank != null
                                ? ` · #${a.marketCapRank} mcap`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          {a.priceUsd != null
                            ? `~${formatCompact(a.priceUsd)}`
                            : "Price loading…"}
                          {hasCh ? (
                            <span
                              className={
                                ch >= 0 ? " text-teal" : " text-danger"
                              }
                            >
                              {" "}
                              ({ch >= 0 ? "+" : ""}
                              {ch.toFixed(2)}% 24h)
                            </span>
                          ) : null}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white">
                Bridge &amp; swap
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Jumper (LI.FI) routes across the EVM networks you use here (
                {EVM_CHAIN_LABELS}) plus other chains. Connect in Jumper with
                MetaMask, Trust, Uniswap Wallet, WalletConnect, or Ledger.
              </p>
              <div className="mt-6 space-y-4 opacity-90">
                <FieldShell
                  label="From"
                  primary="ETH · Base · Arbitrum · BNB…"
                  secondary="Source chain / token"
                />
                <div className="flex justify-center">
                  <div className="rounded-full border border-border bg-panel p-2">
                    <ChevronDown className="h-4 w-4 text-muted" />
                  </div>
                </div>
                <FieldShell
                  label="To"
                  primary="Destination chain / token"
                  secondary="e.g. Base USDC for Hyperliquid"
                />
                <a
                  href="https://jumper.exchange/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal py-3 text-sm font-bold text-black transition hover:brightness-110"
                >
                  Open Jumper
                  <ExternalLink className="h-4 w-4" strokeWidth={2} />
                </a>
              </div>
              <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-muted">
                Powered by LI.FI
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white">
                Hyperliquid deposit
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Fund perps from the official app. Many flows use Arbitrum USDC;
                you also use Base—bridge with Jumper first if needed, then open
                Hyperliquid and connect the same wallet (incl. Ledger via WC /
                companion wallet).
              </p>
              <a
                href="https://app.hyperliquid.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-teal py-2.5 text-sm font-semibold text-teal transition hover:bg-teal-dim"
              >
                Open Hyperliquid
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
              </a>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white">
                Market overview
              </h3>
              <ul className="mt-4 space-y-2">
                {marketOverview.map((m) => {
                  const up = m.change24h >= 0;
                  return (
                    <li
                      key={m.symbol}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-black/20 px-3 py-2"
                    >
                      <div>
                        <span className="font-medium text-white">
                          {m.symbol}
                        </span>
                        <span className="ml-2 text-xs text-muted">
                          {m.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm tabular-nums text-white">
                          {formatCompact(m.price)}
                        </p>
                        <p
                          className={`text-xs font-medium tabular-nums ${
                            up ? "text-teal" : "text-danger"
                          }`}
                        >
                          {m.priceSource === "live"
                            ? `${up ? "+" : ""}${m.change24h.toFixed(2)}%`
                            : "—"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[10px] font-medium uppercase tracking-wider text-muted">
        <p>
          CoinGecko · Alternative.me · Ethereum gas · Not financial advice
        </p>
        <button
          type="button"
          onClick={forceRefresh}
          className="flex items-center gap-2 text-teal transition hover:opacity-80"
        >
          Refreshes every 30s
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="sr-only">
            {lastRefresh
              ? `Last refresh: ${lastRefresh.toLocaleTimeString()}`
              : "Not loaded yet"}
          </span>
        </button>
      </footer>

      <button
        type="button"
        onClick={() =>
          document
            .getElementById("add-holding")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-black shadow-lg shadow-teal/25 transition hover:scale-105 hover:brightness-110"
        aria-label="Scroll to add holding"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
      </button>
    </div>
  );
}

function FieldShell({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-black/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-white">{primary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </div>
      <p className="mt-1 text-xs text-muted">{secondary}</p>
    </div>
  );
}
