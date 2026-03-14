import type { Order, PaymentResult } from 'goatx402-sdk'
import { config } from '../config'

interface OrderProof {
  orderId: string
  merchantId: string
  dappOrderId: string
  chainId: number
  tokenContract: string
  tokenSymbol: string
  fromAddress: string
  amountWei: string
  status: string
  txHash?: string
  confirmedAt?: string
}

interface PaymentStatusProps {
  order: Order | null
  result: PaymentResult | null
  status: OrderProof | null
  error: string | null
  onReset: () => void
}

export function PaymentStatus({ order, result, status, error, onReset }: PaymentStatusProps) {
  if (!order && !result && !error) {
    return null
  }

  function getStatusColor(value: string) {
    switch (value) {
      case 'PAYMENT_CONFIRMED':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      case 'PAYMENT_FAILED':
      case 'EXPIRED':
        return 'border-red-500/30 bg-red-500/10 text-red-200'
      default:
        return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
    }
  }

  function explorerUrl(chainId: number, txHash: string) {
    const chain = config.chains[chainId]
    return chain ? `${chain.explorerUrl}/tx/${txHash}` : null
  }

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6 text-stone-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-stone-50">Payment state</h2>
        <button onClick={onReset} className="text-sm text-amber-300 hover:text-amber-200">
          Reset
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Order ID</div>
              <div className="mt-2 break-all font-mono text-xs text-stone-200">{order.orderId}</div>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Flow</div>
              <div className="mt-2 text-stone-200">{order.flow}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Amount</div>
              <div className="mt-2 text-stone-200">
                {(Number(order.amountWei) / 1e6).toFixed(4)} {order.tokenSymbol}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Recipient</div>
              <div className="mt-2 break-all font-mono text-xs text-stone-200">{order.payToAddress}</div>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Wallet submission</div>
              <div className="mt-2 text-stone-200">
                {result.success ? 'Transaction submitted to the network.' : 'Wallet payment failed.'}
              </div>
              {result.txHash && (
                <a
                  className="mt-2 inline-block break-all font-mono text-xs text-amber-300 hover:text-amber-200"
                  href={explorerUrl(order.chainId, result.txHash) || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.txHash}
                </a>
              )}
            </div>
          )}

          {status && (
            <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Settlement</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusColor(status.status)}`}>
                  {status.status}
                </span>
              </div>

              {status.txHash && (
                <a
                  className="mt-3 inline-block break-all font-mono text-xs text-amber-300 hover:text-amber-200"
                  href={explorerUrl(status.chainId, status.txHash) || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {status.txHash}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
