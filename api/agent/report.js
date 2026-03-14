import { generateAiReport } from '../_lib/ai.js'
import { goatx402Client } from '../_lib/goat.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId, topic, objective, aiConfig } = req.body || {}

    if (!orderId || !topic || !String(topic).trim()) {
      return res.status(400).json({ error: 'orderId and topic are required' })
    }

    const order = await goatx402Client.getOrderStatus(orderId)
    if (order.status !== 'PAYMENT_CONFIRMED') {
      return res.status(402).json({
        error: `Order ${orderId} is not confirmed yet`,
        status: order.status,
      })
    }

    const report = await generateAiReport(String(topic).trim(), objective ? String(objective).trim() : '', aiConfig)

    return res.status(200).json({
      orderId,
      topic: String(topic).trim(),
      objective: objective ? String(objective).trim() : null,
      status: order.status,
      txHash: order.txHash || null,
      report,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate report',
    })
  }
}
