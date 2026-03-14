import { goatx402Client } from '../_lib/goat.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const orderId = String(req.query.orderId || '')
    const order = await goatx402Client.getOrderStatus(orderId)
    return res.status(200).json(order)
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error instanceof Error ? error.message : 'Failed to get order',
    })
  }
}
