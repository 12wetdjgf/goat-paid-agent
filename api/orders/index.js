import { goatx402Client } from '../_lib/goat.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { chainId, tokenSymbol, tokenContract, fromAddress, amountWei, callbackCalldata } =
      req.body || {}

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

    return res.status(200).json({
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
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error instanceof Error ? error.message : 'Failed to create order',
      details: error?.responseBody,
    })
  }
}
