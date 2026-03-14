export const config = {
  apiUrl: '/api',
  chains: {
    97: { name: 'BSC Testnet', explorerUrl: 'https://testnet.bscscan.com' },
    137: { name: 'Polygon', explorerUrl: 'https://polygonscan.com' },
    48816: { name: 'GOAT Testnet3', explorerUrl: 'https://explorer.testnet3.goat.network' },
    11155111: { name: 'Sepolia', explorerUrl: 'https://sepolia.etherscan.io' },
  } as Record<number, { name: string; explorerUrl: string }>,
}
