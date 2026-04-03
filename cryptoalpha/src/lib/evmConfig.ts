import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  phantomWallet,
  rainbowWallet,
  trustWallet,
  uniswapWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrum, base, bsc, mainnet } from "wagmi/chains";

/** Ethereum, Arbitrum, Base (Hyperliquid / L2 activity), BNB Chain */
export const evmChains = [mainnet, arbitrum, base, bsc] as const;

const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

/** Uniswap + WC + Ledger use WalletConnect and need a Cloud project id. */
const wallets = [
  metaMaskWallet,
  trustWallet,
  phantomWallet,
  rainbowWallet,
  coinbaseWallet,
  ...(wcProjectId
    ? [uniswapWallet, walletConnectWallet, ledgerWallet]
    : []),
];

export const evmConfig = createConfig({
  chains: evmChains,
  connectors: connectorsForWallets(
    [{ groupName: "Recommended", wallets }],
    {
      appName: "CryptoAlpha",
      projectId: wcProjectId || "00000000000000000000000000000000",
      chains: evmChains,
    }
  ),
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
  ssr: false,
});
