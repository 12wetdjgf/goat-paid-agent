import { generateAiReport } from '../_lib/ai.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, objective, aiConfig } = req.body || {}

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ error: 'topic is required' })
    }

    const report = await generateAiReport(
      String(topic).trim(),
      objective ? String(objective).trim() : '',
      aiConfig
    )

    return res.status(200).json({
      orderId: null,
      topic: String(topic).trim(),
      objective: objective ? String(objective).trim() : null,
      status: 'FREE_UNLOCKED',
      txHash: null,
      report,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate report',
    })
  }
}
