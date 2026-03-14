# GOAT Paid Agent

Pay-per-use AI agent for the GOAT Network hackathon.

This project combines:

- `x402` native payments
- `ERC-8004` agent identity
- `GOAT Testnet3` deployment
- a simple AI report workflow that unlocks only after payment

## Live Links

- App: `https://goat-paid-agent.vercel.app`
- Metadata: `https://goat-paid-agent.vercel.app/agent-metadata.json`
- ERC-8004 registration tx:
  `https://explorer.testnet3.goat.network/tx/0xcaf4150febe9d8c9119aa8dd4c1d41b476fc9a8472a05edc442e6b9967ebd634`

## What It Does

1. User enters a task
2. User pays with USDC or USDT on GOAT Testnet3
3. Backend verifies x402 order status
4. AI report is released only after `PAYMENT_CONFIRMED`
5. The agent is identified on-chain through ERC-8004

## Stack

- Frontend: React + Vite
- Payment: `goatx402-sdk` + `goatx402-sdk-server`
- Identity: ERC-8004 on GOAT Testnet3
- Deployment: Vercel static frontend + Vercel Functions

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```bash
copy .env.example .env
```

3. Fill these required values:

- `GOATX402_API_URL`
- `GOATX402_MERCHANT_ID`
- `GOATX402_API_KEY`
- `GOATX402_API_SECRET`

4. Start the app

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:3000`
- Local API: `http://localhost:3001`

## AI Configuration

The deployed app does not require server-side AI secrets.

Users can enter:

- `Base URL`
- `Model`
- `API key`

in the top settings panel. The values are saved in the browser and sent only when generating a report.

If no AI config is provided, the app returns a mock report so the payment flow can still be demonstrated.

## ERC-8004 Metadata

Metadata file:

- [public/agent-metadata.json](/C:/Users/14936/goat-paid-agent/public/agent-metadata.json)

Current deployed metadata:

```json
{
  "name": "goat_paid_agent",
  "description": "A pay-per-use AI research agent with x402 payments on GOAT Network.",
  "url": "https://goat-paid-agent.vercel.app",
  "wallet": "0x70DF7CE612969eCF39724256246169cFB8eCf98F"
}
```

## Main API Routes

- `GET /api/health`
- `GET /api/config`
- `POST /api/orders`
- `GET /api/orders/:orderId`
- `POST /api/orders/:orderId/signature`
- `POST /api/agent/report`

## Submission Checklist

- Live app URL
- Metadata URL
- ERC-8004 registration tx
- Source repo URL
- Short demo video or screenshots
- One-line project summary

## User Guide

For end-user instructions, see:

- [USER_GUIDE.md](/C:/Users/14936/goat-paid-agent/USER_GUIDE.md)
