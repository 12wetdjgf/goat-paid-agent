# 使用教程

## 1. 打开网站

访问:

- `https://goat-paid-agent.vercel.app`

## 2. 填写 AI 接口

页面顶部有 3 个输入框:

- `Base URL`
- `Model`
- `API key`

如果你有 OpenAI 兼容接口, 直接填写并点击 `Save AI settings`。

示例:

- Base URL: `https://api.openai.com/v1`
- Model: `gpt-4.1-mini`
- API key: 你的 key

如果你不填, 系统会返回 mock 报告, 仍然可以演示支付流程。

## 3. 连接钱包

点击 `Connect MetaMask`。

请确认当前账户是:

- `0x70DF7CE612969eCF39724256246169cFB8eCf98F`

如果你想换成别的钱包地址, 需要同步更新 metadata。

## 4. 切换到 GOAT Testnet3

MetaMask 网络参数:

- Network Name: `GOAT Testnet3`
- RPC URL: `https://rpc.testnet3.goat.network`
- Chain ID: `48816`
- Currency Symbol: `BTC`
- Block Explorer URL: `https://explorer.testnet3.goat.network`

说明:

- 这是 EVM 链
- 地址还是 `0x...`
- 但是 gas 代币名称是 `BTC`

## 5. 领取测试网 Gas

前往 faucet:

- `https://bridge.testnet3.goat.network/faucet`

把你的 `0x...` 地址贴进去，领取测试网 BTC。

## 6. 支付并解锁报告

在页面里:

1. 输入任务主题
2. 输入目标说明
3. 选择 `USDC` 或 `USDT`
4. 输入金额
5. 点击支付
6. 在 MetaMask 中确认

支付确认后，页面会自动解锁报告。

## 7. 查看链上结果

支付成功后，你可以在 GOAT explorer 查看交易:

- `https://explorer.testnet3.goat.network`

## 8. ERC-8004 身份信息

当前 metadata 地址:

- `https://goat-paid-agent.vercel.app/agent-metadata.json`

当前注册交易:

- `https://explorer.testnet3.goat.network/tx/0xcaf4150febe9d8c9119aa8dd4c1d41b476fc9a8472a05edc442e6b9967ebd634`

## 9. 常见问题

### MetaMask not found

- 确认当前浏览器安装了 MetaMask
- 刷新页面
- 不要在 IDE 内置预览器里打开

### 没有 ETH 只有 BTC

这是正常的。

GOAT Testnet3 是 EVM 兼容链，但 gas 代币名称是 `BTC`，不是 `ETH`。

### 没填 AI key

也可以继续用，系统会返回 mock 报告。

### 支付失败

优先检查:

- 当前网络是否是 `GOAT Testnet3`
- 钱包里是否有测试网 BTC gas
- 钱包里是否有 `USDC` 或 `USDT`
