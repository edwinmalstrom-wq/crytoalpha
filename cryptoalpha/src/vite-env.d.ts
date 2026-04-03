/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** CoinGecko Demo API key → sent as `x-cg-demo-api-key` */
  readonly VITE_COINGECKO_API_KEY?: string;
  /** Override API root, e.g. `https://pro-api.coingecko.com/api/v3` */
  readonly VITE_COINGECKO_API_BASE?: string;
  /** Etherscan API key for accurate Ethereum gas tiers (optional). */
  readonly VITE_ETHERSCAN_API_KEY?: string;
  /** WalletConnect Cloud project id — enables WalletConnect + Ledger in RainbowKit. */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  /** Optional Solana RPC (default: public mainnet-beta). */
  readonly VITE_SOLANA_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
