import { useEffect, useState } from 'react'
import type { ChainInfo, TokenInfo } from '../hooks/useConfig'

interface PaymentFormProps {
  chains: ChainInfo[]
  currentChainId: number | null
  isConnected: boolean
  loading: boolean
  balance: string | null
  onPay: (
    chainId: number,
    tokenContract: string,
    tokenSymbol: string,
    amount: string,
    callbackCalldata?: string
  ) => void
  onTokenChange: (chainId: number, tokenContract: string) => void
}

export function PaymentForm({
  chains,
  currentChainId,
  isConnected,
  loading,
  balance,
  onPay,
  onTokenChange,
}: PaymentFormProps) {
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null)
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [amount, setAmount] = useState('1')
  const [callbackCalldata, setCallbackCalldata] = useState('')
  const [showCalldata, setShowCalldata] = useState(false)

  useEffect(() => {
    if (chains.length > 0 && selectedChainId === null) {
      setSelectedChainId(chains[0].chainId)
    }
  }, [chains, selectedChainId])

  useEffect(() => {
    if (selectedChainId === null) {
      return
    }

    const chain = chains.find((entry) => entry.chainId === selectedChainId)
    if (!chain?.tokens.length) {
      setSelectedToken(null)
      return
    }

    setSelectedToken(chain.tokens[0])
  }, [chains, selectedChainId])

  useEffect(() => {
    if (isConnected && selectedChainId !== null && selectedToken) {
      onTokenChange(selectedChainId, selectedToken.contract)
    }
  }, [isConnected, onTokenChange, selectedChainId, selectedToken])

  const selectedChain = chains.find((entry) => entry.chainId === selectedChainId)
  const isWrongChain = currentChainId !== null && currentChainId !== selectedChainId

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedChainId || !selectedToken || !amount || Number(amount) <= 0) {
      return
    }

    onPay(
      selectedChainId,
      selectedToken.contract,
      selectedToken.symbol,
      amount,
      callbackCalldata.trim() || undefined
    )
  }

  function shortenAddress(value: string) {
    return value.length < 18 ? value : `${value.slice(0, 10)}...${value.slice(-8)}`
  }

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6 text-stone-100">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-stone-50">Pay to unlock</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">
          This section creates the x402 order and sends the payment from MetaMask.
        </p>
      </div>

      {chains.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-950/40 p-5 text-sm text-stone-400">
          Waiting for merchant token configuration...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-300">Network</span>
            <select
              value={selectedChainId ?? ''}
              onChange={(event) => setSelectedChainId(Number(event.target.value))}
              className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
            >
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name} ({chain.chainId})
                </option>
              ))}
            </select>
            {isWrongChain && (
              <p className="mt-2 text-xs text-amber-300">
                Switch your wallet to {selectedChain?.name || `chain ${selectedChainId}`} before paying.
              </p>
            )}
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-stone-300">Token</span>
            <div className="grid grid-cols-2 gap-3">
              {selectedChain?.tokens.map((token) => (
                <button
                  key={token.contract}
                  type="button"
                  onClick={() => setSelectedToken(token)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedToken?.contract === token.contract
                      ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                      : 'border-stone-700 bg-stone-950 text-stone-300 hover:border-stone-500'
                  }`}
                >
                  <div className="text-base font-semibold">{token.symbol}</div>
                  <div className="mt-2 font-mono text-xs opacity-80">{shortenAddress(token.contract)}</div>
                </button>
              ))}
            </div>
            {balance !== null && selectedToken && (
              <p className="mt-2 text-xs text-stone-400">
                Wallet balance: <span className="font-mono text-stone-200">{balance}</span> {selectedToken.symbol}
              </p>
            )}
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-300">Price</span>
            <div className="flex gap-2">
              {['0.5', '1', '2'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    amount === value
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  }`}
                >
                  {value} {selectedToken?.symbol || ''}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
            />
          </label>

          <div className="rounded-2xl border border-stone-800 bg-stone-950/50 p-4">
            <button
              type="button"
              onClick={() => setShowCalldata((value) => !value)}
              className="text-sm text-amber-300 hover:text-amber-200"
            >
              {showCalldata ? 'Hide' : 'Show'} advanced callback calldata
            </button>
            {showCalldata && (
              <div className="mt-3">
                <textarea
                  value={callbackCalldata}
                  onChange={(event) => setCallbackCalldata(event.target.value)}
                  rows={3}
                  placeholder="0x... Optional. Only needed for advanced DELEGATE flows."
                  className="w-full rounded-2xl border border-stone-700 bg-black px-4 py-3 font-mono text-xs text-stone-200 outline-none transition focus:border-amber-400"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isConnected || loading || isWrongChain || !selectedToken || Number(amount) <= 0}
            className="w-full rounded-2xl bg-amber-400 px-4 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            {loading ? 'Creating x402 payment...' : `Pay ${amount || '0'} ${selectedToken?.symbol || ''}`}
          </button>
        </form>
      )}
    </div>
  )
}
