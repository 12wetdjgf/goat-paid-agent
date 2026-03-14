import { goatx402Client } from '../../_lib/goat.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { signature } = req.body || {}
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' })
    }

    await goatx402Client.submitCalldataSignature(String(req.query.orderId || ''), signature)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error instanceof Error ? error.message : 'Failed to submit signature',
    })
  }
}
