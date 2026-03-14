import { goatx402Client, merchantId, publicAppUrl } from './_lib/goat.js'

export default async function handler(_req, res) {
  try {
    const merchant = await goatx402Client.getMerchant(merchantId)
    const chains = {}

    const chainNames = {
      97: 'BSC Testnet',
      137: 'Polygon',
      48816: 'GOAT Testnet3',
      11155111: 'Sepolia',
    }

    for (const token of merchant.supportedTokens) {
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

    res.status(200).json({
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get config',
    })
  }
}
