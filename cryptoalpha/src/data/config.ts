export const TARGET_MULTIPLIER = 25;

export const MARKET_OVERVIEW_ROWS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    coingeckoId: "bitcoin",
    fallbackUsd: 98_432.12,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    coingeckoId: "ethereum",
    fallbackUsd: 3_421.88,
  },
  {
    symbol: "USDT",
    name: "Tether",
    coingeckoId: "tether",
    fallbackUsd: 1.0,
  },
  {
    symbol: "XRP",
    name: "XRP",
    coingeckoId: "ripple",
    fallbackUsd: 2.18,
  },
  {
    symbol: "BNB",
    name: "BNB",
    coingeckoId: "binancecoin",
    fallbackUsd: 612.4,
  },
  {
    symbol: "SOL",
    name: "Solana",
    coingeckoId: "solana",
    fallbackUsd: 142.33,
  },
] as const;
