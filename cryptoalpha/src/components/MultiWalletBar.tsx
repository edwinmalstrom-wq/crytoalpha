import { ConnectButton as SuiConnectButton } from "@mysten/dapp-kit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import { arbitrum, base, bsc, mainnet } from "wagmi/chains";

function shortAddr(s: string, n = 4) {
  if (s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n + 2)}…${s.slice(-n)}`;
}

export function MultiWalletBar() {
  const { publicKey, disconnect, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const evmConnected = ready && account;

          return (
            <div
              className="flex items-center gap-1.5"
              {...(!ready ? { "aria-hidden": true, style: { opacity: 0 } } : {})}
            >
              {evmConnected && chain ? (
                <>
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden max-h-9 items-center gap-1 rounded-lg border border-border bg-black/40 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted sm:flex"
                    title="Switch EVM network"
                  >
                    {chain.hasIcon && chain.iconUrl ? (
                      <img
                        alt={chain.name ?? "chain"}
                        src={chain.iconUrl}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : null}
                    <span className="max-w-[88px] truncate text-white">
                      {chain.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="flex max-h-9 items-center gap-2 rounded-lg border border-teal bg-teal-dim px-3 py-2 text-xs font-semibold text-teal"
                  >
                    <span className="hidden sm:inline">EVM</span>
                    <span className="tabular-nums">
                      {shortAddr(account.address)}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="flex max-h-9 items-center gap-2 rounded-lg border border-teal px-3 py-2 text-xs font-semibold text-teal transition hover:bg-teal-dim"
                >
                  <Wallet className="h-4 w-4 shrink-0" strokeWidth={2} />
                  EVM
                </button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {connected && publicKey ? (
        <button
          type="button"
          onClick={() => disconnect()}
          className="flex max-h-9 items-center gap-2 rounded-lg border border-teal bg-teal-dim px-3 py-2 text-xs font-semibold text-teal"
          title={wallet?.adapter.name ?? "Solana"}
        >
          <span className="hidden sm:inline">SOL</span>
          <span className="tabular-nums">{shortAddr(publicKey.toBase58())}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="flex max-h-9 items-center gap-2 rounded-lg border border-teal px-3 py-2 text-xs font-semibold text-teal transition hover:bg-teal-dim"
        >
          Solana
        </button>
      )}

      <div className="[&_button]:max-h-9 [&_button]:rounded-lg [&_button]:border [&_button]:border-teal [&_button]:bg-transparent [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:font-semibold [&_button]:text-teal [&_button]:hover:bg-teal-dim">
        <SuiConnectButton />
      </div>

      <p className="hidden w-full text-right text-[10px] leading-snug text-muted lg:block lg:w-auto lg:max-w-[320px]">
        Chains: ETH · Arbitrum · Base · BNB · Sol · Sui. WalletConnect + Ledger
        needs{" "}
        <code className="text-muted/80">VITE_WALLETCONNECT_PROJECT_ID</code>.
      </p>
    </div>
  );
}

/** Human-readable EVM chain list for copy in the app */
export const EVM_CHAIN_LABELS = [
  mainnet.name,
  arbitrum.name,
  base.name,
  bsc.name,
].join(" · ");
