# GOAT Paid Agent

Pay-per-use AI agent for the GOAT Network hackathon.

This project combines:

- `x402` native payments
- `ERC-8004` agent identity
- `GOAT Testnet3` deployment
- a simple AI report workflow that unlocks only after payment

  GOAT Paid Agent 使用教程

  这是一个“先付费、后解锁内容”的 AI Agent。
  你可以把它理解成：付一次钱，买一份 AI 生成的分析报告。

  网站地址

  - https://goat-paid-agent.vercel.app

  你能做什么
  这个网站可以帮你生成 3 种不同深度的 AI 报告：

  - Basic Brief：简短版，适合快速看思路
  - Market Analysis：标准版，适合演示和比赛展示
  - Investor Memo：深入版，适合讲商业价值和路线图

  使用前要准备什么
  你只需要准备 2 样东西：

  1. 一个装了 MetaMask 的浏览器
  2. GOAT Testnet3 上的测试代币和 gas

  第一步：打开网站
  进入：

  - https://goat-paid-agent.vercel.app

  第二步：填写 AI 接口
  页面最上面有 3 个输入框：

  - Base URL
  - Model
  - API key

  如果你有自己的 AI 接口，就填进去，然后点 Save AI settings。

  比如可以填：

  - Base URL：https://api.openai.com/v1
  - Model：gpt-4.1-mini
  - API key：你自己的 key

  如果你没有 AI key，也没关系。
  系统会用一个 mock 模式返回演示报告，你仍然可以完整演示支付流程。

  第三步：连接钱包
  点击页面上的 Connect MetaMask。

  连接后，页面会显示你的钱包地址和当前链。

  第四步：切换到 GOAT Testnet3
  钱包网络必须切到 GOAT Testnet3。

  如果你还没加这个网络，在 MetaMask 里手动添加：

  - Network Name: GOAT Testnet3
  - RPC URL: https://rpc.testnet3.goat.network
  - Chain ID: 48816
  - Currency Symbol: BTC
  - Block Explorer URL: https://explorer.testnet3.goat.network

  注意：
  虽然你用的是 0x... 以太坊格式地址，但这条链的 gas 代币名字叫 BTC，这是正常的。

  第五步：领取测试网 Gas
  去这个地址领取测试网 BTC：

  - https://bridge.testnet3.goat.network/faucet

  把你的 MetaMask 地址贴进去就行。

  第六步：选择你要购买的报告档位
  页面中部会有 3 个套餐：

  - Basic Brief
  - Market Analysis
  - Investor Memo

  每个套餐价格不同，内容深度也不同。

  你只需要点一个你想要的档位。

  第七步：填写任务内容
  在页面左边输入：

  - Topic：你想分析什么
  - Objective：你希望报告重点解决什么问题

  例如：

  Topic:
  Build a launch brief for an AI agent on GOAT Network

  Objective:
  Summarize the product angle, monetization logic, and 3 demo talking points

  第八步：选择支付代币
  在右侧支付区域中：

  1. 选择网络
  2. 选择代币：USDC 或 USDT
  3. 确认金额
  4. 点击支付按钮

  第九步：在 MetaMask 中确认交易
  点击支付后，MetaMask 会弹出确认框。
  你只需要确认交易。

  系统会创建 x402 支付订单，并等待链上确认。

  第十步：等待内容解锁
  支付完成后，页面会自动显示：

  - 订单信息
  - 交易状态
  - 支付证明
  - AI 报告内容

  也就是说，这个网站不是直接免费看，而是：
  链上确认支付成功之后，才解锁内容。

  页面里你还能看到什么
  除了报告本身，你还可以看到：

  - On-chain identity：这个 Agent 的链上身份信息
  - Metadata URL：Agent 的公开 metadata
  - ERC-8004 registration tx：Agent 的注册交易
  - Payment proof：支付证明，可复制

  如果你只想快速演示给别人看
  你可以用最简单的顺序：

  1. 打开网站
  2. 连接 MetaMask
  3. 选择套餐
  4. 输入任务
  5. 支付
  6. 展示报告解锁
  7. 再展示链上身份卡

  这样别人一看就能理解：
  这是一个有身份、能收费、能结算的 AI Agent。

  常见问题

  1. MetaMask not found
  说明你当前打开网页的浏览器里没有检测到 MetaMask。
  解决方法：

  - 确认浏览器装了 MetaMask
  - 刷新页面
  - 用普通 Chrome / Edge 打开，不要用 IDE 内置预览器

  2. 为什么是 BTC，不是 ETH？
  因为 GOAT Testnet3 是 EVM 兼容链，但 gas 代币名称叫 BTC。
  这不影响你继续用 0x... 地址和 MetaMask。

  3. 没有 AI key 能用吗？
  可以。
  没填 AI key 时会走 mock 模式，仍然可以演示支付闭环。

  4. 支付失败怎么办？
  先检查：

  - 是否已经切到 GOAT Testnet3
  - 钱包里是否有测试网 BTC
  - 钱包里是否有 USDC 或 USDT
  - MetaMask 当前账户是否正确




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
