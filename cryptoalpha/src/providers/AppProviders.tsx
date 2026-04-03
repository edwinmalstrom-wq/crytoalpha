import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { evmConfig } from "../lib/evmConfig";

const solanaEndpoint =
  import.meta.env.VITE_SOLANA_RPC_URL?.trim() ||
  "https://api.mainnet-beta.solana.com";

const { networkConfig: suiNetworkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const solanaWallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={evmConfig}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00ffa3",
            accentColorForeground: "#0a0a0a",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <ConnectionProvider endpoint={solanaEndpoint}>
            <SolanaWalletProvider wallets={solanaWallets} autoConnect>
              <WalletModalProvider>
                <SuiClientProvider
                  networks={suiNetworkConfig}
                  defaultNetwork="mainnet"
                >
                  <WalletProvider>{children}</WalletProvider>
                </SuiClientProvider>
              </WalletModalProvider>
            </SolanaWalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
