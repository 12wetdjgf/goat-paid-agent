import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { GoatX402Client } from 'goatx402-sdk-server'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())

const goatx402Client = new GoatX402Client({
  baseUrl: process.env.GOATX402_API_URL || 'http://localhost:8286',
  apiKey: process.env.GOATX402_API_KEY || '',
  apiSecret: process.env.GOATX402_API_SECRET || '',
})

const merchantId = process.env.GOATX402_MERCHANT_ID || 'demo_merchant'
const envAiBaseUrl = process.env.AI_BASE_URL?.replace(/\/$/, '')
const envAiApiKey = process.env.AI_API_KEY
const envAiModel = process.env.AI_MODEL || 'gpt-4.1-mini'
const publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000'

type MerchantToken = {
  symbol: string
  tokenContract: string
  chainId: number
}

type OrderStatus = {
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

type AiSettings = {
  baseUrl: string
  apiKey: string
  model: string
}

function buildMockReport(topic: string, objective?: string) {
  const mission = objective?.trim() || 'deliver a concise market brief'

  return [
    `# ${topic}`,
    '',
    '## Executive Summary',
    `${topic} can be packaged as a paid AI workflow on GOAT Network. The strongest demo angle is a short, valuable output that clearly unlocks only after x402 payment succeeds.`,
    '',
    '## Suggested User Flow',
    `1. User requests: ${mission}.`,
    '2. App creates an x402 order on GOAT Testnet3.',
    '3. User pays in USDC or USDT from MetaMask.',
    '4. Backend verifies PAYMENT_CONFIRMED before releasing the report.',
    '',
    '## Demo Talking Points',
    '- The agent has an ERC-8004 identity.',
    '- The task is monetized per action instead of via subscription.',
    '- Settlement is machine-readable and chain-verifiable.',
    '',
    '## Next Improvement',
    'Replace this mock report with a real LLM provider once you add AI credentials in `.env`.',
  ].join('\n')
}

function normalizeAiSettings(input?: Partial<AiSettings>): AiSettings {
  return {
    baseUrl: (input?.baseUrl || envAiBaseUrl || '').trim().replace(/\/$/, ''),
    apiKey: (input?.apiKey || envAiApiKey || '').trim(),
    model: (input?.model || envAiModel).trim(),
  }
}

async function generateAiReport(topic: string, objective?: string, input?: Partial<AiSettings>) {
  const aiSettings = normalizeAiSettings(input)

  if (!aiSettings.baseUrl || !aiSettings.apiKey) {
    return buildMockReport(topic, objective)
  }

  const response = await fetch(`${aiSettings.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiSettings.apiKey}`,
    },
    body: JSON.stringify({
      model: aiSettings.model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a hackathon demo agent. Write a concise, concrete markdown report with actionable sections and no filler.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\nObjective: ${objective || 'Provide a practical brief for a product demo.'}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI provider error: ${response.status} ${text}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('AI provider returned an empty response')
  }

  return content
}

app.get('/api/health', (_req, res) => {
  const aiSettings = normalizeAiSettings()
  res.json({
    status: 'ok',
    merchantId,
    aiConfigured: Boolean(aiSettings.baseUrl && aiSettings.apiKey),
  })
})

app.get('/api/config', async (_req, res) => {
  try {
    const merchant = await goatx402Client.getMerchant(merchantId)
    const chains: Record<
      number,
      {
        chainId: number
        name: string
        tokens: Array<{ symbol: string; contract: string }>
      }
    > = {}

    const chainNames: Record<number, string> = {
      97: 'BSC Testnet',
      137: 'Polygon',
      48816: 'GOAT Testnet3',
      11155111: 'Sepolia',
    }

    for (const token of merchant.supportedTokens as MerchantToken[]) {
      if (!chains[token.chainId]) {
        chains[token.chainId] = {
          chainId: token.chainId,
          name: chainNames[token.chainId] || `Chain ${token.chainId}`,
          tokens: [],
        }
      }
      chains[token.chainId].tokens.push({
        symbol: token.symbol,
        contract: token.tokenContract,
      })
    }

    res.json({
      merchantId: merchant.merchantId,
      merchantName: merchant.name || 'GOAT Paid Agent',
      publicAppUrl,
      registration: {
        chainId: 48816,
        contractAddress: '0x556089008Fc0a60cD09390Eca93477ca254A5522',
      },
      chains: Object.values(chains),
    })
  } catch (error) {
    console.error('Get config error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get config',
    })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const { chainId, tokenSymbol, tokenContract, fromAddress, amountWei, callbackCalldata } =
      req.body

    if (!chainId || !tokenSymbol || !tokenContract || !fromAddress || !amountWei) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const order = await goatx402Client.createOrder({
      dappOrderId: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      chainId,
      tokenSymbol,
      tokenContract,
      fromAddress,
      amountWei,
      callbackCalldata,
    })

    res.json({
      orderId: order.orderId,
      flow: order.flow,
      payToAddress: order.payToAddress,
      expiresAt: order.expiresAt,
      calldataSignRequest: order.calldataSignRequest,
      chainId,
      tokenSymbol,
      tokenContract,
      fromAddress,
      amountWei,
    })
  } catch (error: unknown) {
    console.error('Create order error:', error)
    const errObj = error as { status?: number; responseBody?: unknown }
    res.status(errObj.status || 500).json({
      error: error instanceof Error ? error.message : 'Failed to create order',
      details: errObj.responseBody,
    })
  }
})

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await goatx402Client.getOrderStatus(req.params.orderId)
    res.json(order)
  } catch (error: unknown) {
    console.error('Get order error:', error)
    const status = (error as { status?: number }).status || 500
    res.status(status).json({
      error: error instanceof Error ? error.message : 'Failed to get order',
    })
  }
})

app.post('/api/orders/:orderId/signature', async (req, res) => {
  try {
    const { signature } = req.body
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' })
    }

    await goatx402Client.submitCalldataSignature(req.params.orderId, signature)
    res.json({ success: true })
  } catch (error: unknown) {
    console.error('Submit signature error:', error)
    const status = (error as { status?: number }).status || 500
    res.status(status).json({
      error: error instanceof Error ? error.message : 'Failed to submit signature',
    })
  }
})

app.post('/api/agent/report', async (req, res) => {
  try {
    const { orderId, topic, objective, aiConfig } = req.body as {
      orderId?: string
      topic?: string
      objective?: string
      aiConfig?: Partial<AiSettings>
    }

    if (!orderId || !topic?.trim()) {
      return res.status(400).json({ error: 'orderId and topic are required' })
    }

    const order = (await goatx402Client.getOrderStatus(orderId)) as OrderStatus
    if (order.status !== 'PAYMENT_CONFIRMED') {
      return res.status(402).json({
        error: `Order ${orderId} is not confirmed yet`,
        status: order.status,
      })
    }

    const report = await generateAiReport(topic.trim(), objective?.trim(), aiConfig)

    res.json({
      orderId,
      topic: topic.trim(),
      objective: objective?.trim() || null,
      status: order.status,
      txHash: order.txHash || null,
      report,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate report',
    })
  }
})

app.listen(port, () => {
  console.log(`GOAT Paid Agent server running at http://localhost:${port}`)

  if (!process.env.GOATX402_API_KEY || !process.env.GOATX402_API_SECRET) {
    console.warn('Missing GOAT x402 credentials in .env')
  }
})
