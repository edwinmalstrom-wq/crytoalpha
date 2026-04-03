export type GasOracleResult = {
  low: { gwei: number; eta: string };
  avg: { gwei: number; eta: string };
  fast: { gwei: number; eta: string };
  networkActivity: string;
  source: "etherscan" | "rpc";
};

function clampGwei(n: number) {
  return Math.max(1, Math.round(n * 10) / 10);
}

/** Etherscan Gas Oracle when `VITE_ETHERSCAN_API_KEY` is set; else public `eth_gasPrice` RPC. */
export async function fetchEthereumGasOracle(): Promise<GasOracleResult> {
  const key = import.meta.env.VITE_ETHERSCAN_API_KEY?.trim();
  if (key) {
    const url = new URL("https://api.etherscan.io/api");
    url.searchParams.set("module", "gastracker");
    url.searchParams.set("action", "gasoracle");
    url.searchParams.set("apikey", key);
    const res = await fetch(url.toString());
    if (res.ok) {
      const json = (await res.json()) as {
        status?: string;
        result?: {
          SafeGasPrice?: string;
          ProposeGasPrice?: string;
          FastGasPrice?: string;
        };
      };
      const r = json.result;
      if (json.status === "1" && r) {
        const safe = Number(r.SafeGasPrice);
        const propose = Number(r.ProposeGasPrice);
        const fast = Number(r.FastGasPrice);
        if (
          [safe, propose, fast].every((n) => Number.isFinite(n) && n > 0)
        ) {
          const avg = propose;
          return {
            low: { gwei: safe, eta: "~5 min" },
            avg: { gwei: propose, eta: "~2 min" },
            fast: { gwei: fast, eta: "~30s" },
            networkActivity: networkLabelFromGwei(avg),
            source: "etherscan",
          };
        }
      }
    }
  }

  const gwei = await fetchGasPriceRpc();
  const base = clampGwei(gwei);
  return {
    low: { gwei: clampGwei(base * 0.88), eta: "~5 min" },
    avg: { gwei: base, eta: "~2 min" },
    fast: { gwei: clampGwei(base * 1.18), eta: "~30s" },
    networkActivity: networkLabelFromGwei(base),
    source: "rpc",
  };
}

function networkLabelFromGwei(avg: number): string {
  if (avg >= 120) return "Network activity: Very high";
  if (avg >= 60) return "Network activity: Elevated";
  if (avg >= 35) return "Network activity: Busy";
  return "Network activity: Normal";
}

async function fetchGasPriceRpc(): Promise<number> {
  const endpoints = [
    "https://cloudflare-eth.com",
    "https://rpc.ankr.com/eth",
  ];
  const body = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_gasPrice",
    params: [],
    id: 1,
  });

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { result?: string };
      const hex = json.result;
      if (typeof hex === "string" && hex.startsWith("0x")) {
        const wei = Number(BigInt(hex));
        const gwei = wei / 1e9;
        if (Number.isFinite(gwei) && gwei > 0) return gwei;
      }
    } catch {
      /* try next */
    }
  }
  throw new Error("Gas: RPC unavailable");
}
