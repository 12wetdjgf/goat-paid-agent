interface ConnectWalletProps {
  isConnected: boolean
  address: string | null
  chainId: number | null
  loading: boolean
  error: string | null
  onConnect: () => void
  onDisconnect: () => void
}

export function ConnectWallet({
  isConnected,
  address,
  chainId,
  loading,
  error,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  function formatAddress(value: string) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`
  }

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6 text-stone-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-50">Wallet</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Connect the same account you plan to use for GOAT Testnet3 payment and ERC-8004 registration.
          </p>

          {isConnected && address && (
            <div className="mt-4 rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-sm">
              <div className="font-mono text-stone-200">{formatAddress(address)}</div>
              <div className="mt-1 text-xs text-stone-500">Chain ID: {chainId ?? 'unknown'}</div>
            </div>
          )}
        </div>

        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={loading}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  )
}
