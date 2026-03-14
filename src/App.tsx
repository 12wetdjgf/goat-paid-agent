import { useEffect, useRef, useState } from 'react'
import { ConnectWallet } from './components/ConnectWallet'
import { PaymentForm } from './components/PaymentForm'
import type { PricingPlan } from './components/PaymentForm'
import { PaymentStatus } from './components/PaymentStatus'
import { config } from './config'
import { useAiSettings } from './hooks/useAiSettings'
import { useConfig } from './hooks/useConfig'
import { useGoatX402 } from './hooks/useGoatX402'
import { useWallet } from './hooks/useWallet'

type ReportResponse = {
  orderId: string
  topic: string
  objective: string | null
  status: string
  txHash: string | null
  report: string
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'brief',
    name: 'Basic Brief',
    price: '0',
    tagline: 'Free positioning snapshot',
    deliverable: 'Short market angle, target user, and three judge-friendly talking points.',
  },
  {
    id: 'analysis',
    name: 'Market Analysis',
    price: '0',
    tagline: 'Free standard demo',
    deliverable: 'Structured analysis with monetization logic, positioning, and launch recommendations.',
  },
  {
    id: 'memo',
    name: 'Investor Memo',
    price: '0',
    tagline: 'Free deep dive',
    deliverable: 'Long-form memo with moat, GTM path, risks, and next-step roadmap.',
  },
]

function App() {
  const wallet = useWallet()
  const goatx402 = useGoatX402(wallet.signer)
  const { merchantConfig, loading: configLoading, error: configError } = useConfig()
  const aiSettings = useAiSettings()

  const [topic, setTopic] = useState(
    'Build a launch brief for an AI agent that charges per report on GOAT Network'
  )
  const [objective, setObjective] = useState(
    'Summarize the product angle, monetization logic, and 3 demo talking points for judges.'
  )
  const [selectedPlanId, setSelectedPlanId] = useState<string>('analysis')
  const [balance, setBalance] = useState<string | null>(null)
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const lastGeneratedOrderId = useRef<string | null>(null)

  const selectedPlan = PRICING_PLANS.find((plan) => plan.id === selectedPlanId) || PRICING_PLANS[1]

  useEffect(() => {
    if (selectedPlanId === 'brief') {
      setObjective('Give me a concise launch summary, target user, and three memorable demo points.')
    } else if (selectedPlanId === 'analysis') {
      setObjective('Summarize the product angle, monetization logic, and 3 demo talking points for judges.')
    } else if (selectedPlanId === 'memo') {
      setObjective('Write an investor-style memo with positioning, business model, moat, risks, and roadmap.')
    }
  }, [selectedPlanId])

  useEffect(() => {
    if (selectedPlan.price === '0') {
      return
    }

    const orderId = goatx402.order?.orderId
    const orderStatus = goatx402.orderStatus?.status

    if (!orderId || orderStatus !== 'PAYMENT_CONFIRMED' || lastGeneratedOrderId.current === orderId) {
      return
    }

    lastGeneratedOrderId.current = orderId

    const run = async () => {
      setReportLoading(true)
      setReportError(null)

      try {
        const response = await fetch(`${config.apiUrl}/agent/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            topic,
            objective,
            aiConfig: {
              baseUrl: aiSettings.settings.baseUrl,
              apiKey: aiSettings.settings.apiKey,
              model: aiSettings.settings.model,
            },
          }),
        })

        const data = (await response.json()) as ReportResponse | { error?: string }
        if (!response.ok) {
          throw new Error('error' in data ? data.error || `HTTP ${response.status}` : `HTTP ${response.status}`)
        }

        setReport(data as ReportResponse)
      } catch (error) {
        setReportError(error instanceof Error ? error.message : 'Failed to generate report')
      } finally {
        setReportLoading(false)
      }
    }

    void run()
  }, [
    aiSettings.settings.apiKey,
    aiSettings.settings.baseUrl,
    aiSettings.settings.model,
    goatx402.order?.orderId,
    goatx402.orderStatus?.status,
    objective,
    topic,
  ])

  async function handleTokenChange(_chainId: number, tokenContract: string) {
    if (!wallet.isConnected) {
      return
    }

    const nextBalance = await goatx402.getBalance(tokenContract)
    setBalance(nextBalance)
  }

  async function handlePay(
    chainId: number,
    tokenContract: string,
    tokenSymbol: string,
    amount: string,
    callbackCalldata?: string
  ) {
    setReport(null)
    setReportError(null)
    lastGeneratedOrderId.current = null

    if (Number(amount) === 0) {
      setReportLoading(true)
      try {
        const response = await fetch(`${config.apiUrl}/agent/free-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            objective,
            aiConfig: {
              baseUrl: aiSettings.settings.baseUrl,
              apiKey: aiSettings.settings.apiKey,
              model: aiSettings.settings.model,
            },
          }),
        })

        const data = (await response.json()) as ReportResponse | { error?: string }
        if (!response.ok) {
          throw new Error('error' in data ? data.error || `HTTP ${response.status}` : `HTTP ${response.status}`)
        }

        setReport(data as ReportResponse)
      } catch (error) {
        setReportError(error instanceof Error ? error.message : 'Failed to generate report')
      } finally {
        setReportLoading(false)
      }
      return
    }

    await goatx402.pay({ chainId, tokenContract, tokenSymbol, amount, callbackCalldata })
  }

  function handleReset() {
    goatx402.reset()
    setReport(null)
    setReportError(null)
    lastGeneratedOrderId.current = null
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="rounded-3xl border border-amber-500/30 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_30%),linear-gradient(135deg,_rgba(41,37,36,0.95),_rgba(12,10,9,0.98))] p-8 shadow-2xl shadow-amber-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">GOAT Network Hackathon</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-stone-50">
                Pay-per-use AI agent with x402 payments and ERC-8004 identity
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                This starter app charges before it releases an AI research report. The same agent can then be
                registered on GOAT Testnet3 as an ERC-8004 identity.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-stone-800 bg-black/30 p-4 text-sm text-stone-300">
              <div>
                <div className="text-stone-500">Track stack</div>
                <div className="font-medium text-stone-100">OpenClaw or any LLM + x402 + GOAT Testnet3</div>
              </div>
              <div>
                <div className="text-stone-500">ERC-8004 contract</div>
                <div className="font-mono text-xs text-amber-300">0x556089008Fc0a60cD09390Eca93477ca254A5522</div>
              </div>
              <div>
                <div className="text-stone-500">Current offer</div>
                <div className="font-medium text-stone-100">
                  {selectedPlan.name} {selectedPlan.price === '0' ? '(Free)' : `for ${selectedPlan.price} USDC/USDT`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-stone-50">0. Fill your AI API settings</h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  You can paste any OpenAI-compatible API here. The values are saved in your browser and sent only when
                  you request a report.
                </p>
              </div>
              <div className="rounded-full border border-stone-700 bg-stone-950/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-300">
                {aiSettings.loading
                  ? 'Loading AI settings'
                  : aiSettings.settings.hasApiKey
                    ? 'AI key saved'
                    : 'Using mock AI'}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr_0.6fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Base URL</span>
                <input
                  value={aiSettings.settings.baseUrl}
                  onChange={(event) =>
                    aiSettings.setSettings((current) => ({ ...current, baseUrl: event.target.value }))
                  }
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Model</span>
                <input
                  value={aiSettings.settings.model}
                  onChange={(event) =>
                    aiSettings.setSettings((current) => ({ ...current, model: event.target.value }))
                  }
                  placeholder="gpt-4.1-mini"
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">API key</span>
                <input
                  type="password"
                  value={aiSettings.settings.apiKey}
                  onChange={(event) =>
                    aiSettings.setSettings((current) => ({ ...current, apiKey: event.target.value }))
                  }
                  placeholder={aiSettings.settings.hasApiKey ? 'Saved locally. Enter to replace.' : 'sk-...'}
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => void aiSettings.saveSettings()}
                disabled={aiSettings.loading || aiSettings.saving}
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                {aiSettings.saving ? 'Saving...' : 'Save AI settings'}
              </button>
              {aiSettings.savedMessage && <span className="text-sm text-emerald-300">{aiSettings.savedMessage}</span>}
              {aiSettings.error && <span className="text-sm text-red-300">{aiSettings.error}</span>}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-stone-50">1. Define the paid task</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Keep the AI task simple. Judges should understand in one sentence what users pay for.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Topic</span>
                <textarea
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Objective</span>
                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                `${selectedPlan.name}: ${selectedPlan.deliverable}`,
                'Use GOAT Testnet3 USDC or USDT as the payment rail',
                'Registered as an ERC-8004 on-chain agent identity',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-sm text-stone-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <ConnectWallet
              isConnected={wallet.isConnected}
              address={wallet.address}
              chainId={wallet.chainId}
              loading={wallet.loading}
              error={wallet.error}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
            />

            {!configLoading && !configError && (
              <PaymentForm
                chains={merchantConfig?.chains || []}
                currentChainId={wallet.chainId}
                isConnected={wallet.isConnected}
                loading={goatx402.loading}
                balance={balance}
                plans={PRICING_PLANS}
                selectedPlanId={selectedPlanId}
                onPlanChange={setSelectedPlanId}
                onPay={handlePay}
                onTokenChange={handleTokenChange}
              />
            )}

            <PaymentStatus
              order={goatx402.order}
              result={goatx402.paymentResult}
              status={goatx402.orderStatus}
              error={goatx402.error}
              onReset={handleReset}
            />
          </section>
        </div>

        {(configLoading || configError) && (
          <section className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6">
            {configLoading ? (
              <p className="text-sm text-stone-300">Loading merchant configuration...</p>
            ) : (
              <p className="text-sm text-red-300">Failed to load merchant configuration: {configError}</p>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-50">2. Unlock the report</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                {selectedPlan.price === '0'
                  ? 'Free mode is active, so the report unlocks immediately after generation.'
                  : <>The backend only releases this section after the order reaches <span className="font-mono text-amber-300">PAYMENT_CONFIRMED</span>.</>}
              </p>
            </div>
            {reportLoading && (
              <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-300">
                Generating
              </div>
            )}
          </div>

          {reportError && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {reportError}
            </div>
          )}

          {!report && !reportLoading && !reportError && (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-700 bg-stone-950/40 p-8 text-sm leading-7 text-stone-400">
              Pay for the task first. Once payment is confirmed on-chain, the report appears here automatically.
            </div>
          )}

          {report && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Order</div>
                  <div className="mt-2 break-all font-mono text-xs text-stone-200">{report.orderId}</div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Status</div>
                  <div className="mt-2 text-sm font-medium text-emerald-300">{report.status}</div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Explorer</div>
                  <div className="mt-2 text-sm">
                    {report.txHash ? (
                      <a
                        className="text-amber-300 hover:text-amber-200"
                        href={`${config.chains[48816].explorerUrl}/tx/${report.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View transaction
                      </a>
                    ) : (
                      <span className="text-stone-400">No tx hash returned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Unlocked deliverable</div>
                <div className="mt-2 text-sm text-stone-200">
                  {selectedPlan.name}: {selectedPlan.deliverable}
                </div>
              </div>

              <article className="overflow-x-auto rounded-2xl border border-stone-800 bg-black/30 p-6">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-stone-200">
                  {report.report}
                </pre>
              </article>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6">
            <h2 className="text-xl font-semibold text-stone-50">3. On-chain identity</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              This agent already exposes a public metadata file and a registered GOAT Testnet3 identity.
            </p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Agent name</div>
                <div className="mt-2 text-stone-100">goat_paid_agent</div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Wallet</div>
                <div className="mt-2 break-all font-mono text-xs text-amber-300">
                  0x70DF7CE612969eCF39724256246169cFB8eCf98F
                </div>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Metadata URL</div>
                <a
                  className="mt-2 block break-all font-mono text-xs text-amber-300 hover:text-amber-200"
                  href={`${merchantConfig?.publicAppUrl || 'https://goat-paid-agent.vercel.app'}/agent-metadata.json`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {(merchantConfig?.publicAppUrl || 'https://goat-paid-agent.vercel.app')}/agent-metadata.json
                </a>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">ERC-8004 registration tx</div>
                <a
                  className="mt-2 block break-all font-mono text-xs text-amber-300 hover:text-amber-200"
                  href="https://explorer.testnet3.goat.network/tx/0xcaf4150febe9d8c9119aa8dd4c1d41b476fc9a8472a05edc442e6b9967ebd634"
                  target="_blank"
                  rel="noreferrer"
                >
                  0xcaf4150febe9d8c9119aa8dd4c1d41b476fc9a8472a05edc442e6b9967ebd634
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6">
            <h2 className="text-xl font-semibold text-stone-50">4. Demo script</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-stone-300">
              <li>Show the topic field and explain the paid action.</li>
              <li>Connect MetaMask on GOAT Testnet3.</li>
              <li>Pay with USDC or USDT via x402.</li>
              <li>Open the confirmed transaction in GOAT Explorer.</li>
              <li>Show the AI report unlocking only after payment.</li>
              <li>Finish by opening the ERC-8004 registration view.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
