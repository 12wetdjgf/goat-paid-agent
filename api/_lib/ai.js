import { normalizeAiSettings } from './goat.js'

function buildMockReport(topic, objective) {
  const mission = (objective || '').trim() || 'deliver a concise market brief'

  return [
    `# ${topic}`,
    '',
    '## Executive Summary',
    `${topic} can be packaged as a paid AI workflow on GOAT Network. The strongest demo angle is a short, valuable output that clearly unlocks only after x402 payment succeeds.`,
    '',
    '## Suggested User Flow',
    `1. User requests: ${mission}.`,
    '2. App creates an x402 order on GOAT Testnet3.',
    '3. User pays in USDC or USDT from MetaMask.',
    '4. Backend verifies PAYMENT_CONFIRMED before releasing the report.',
    '',
    '## Demo Talking Points',
    '- The agent has an ERC-8004 identity.',
    '- The task is monetized per action instead of via subscription.',
    '- Settlement is machine-readable and chain-verifiable.',
    '',
    '## Next Improvement',
    'Replace this mock report with a real LLM provider once you add AI credentials.',
  ].join('\n')
}

export async function generateAiReport(topic, objective, input) {
  const aiSettings = normalizeAiSettings(input)

  if (!aiSettings.baseUrl || !aiSettings.apiKey) {
    return buildMockReport(topic, objective)
  }

  const response = await fetch(`${aiSettings.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiSettings.apiKey}`,
    },
    body: JSON.stringify({
      model: aiSettings.model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a hackathon demo agent. Write a concise, concrete markdown report with actionable sections and no filler.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\nObjective: ${objective || 'Provide a practical brief for a product demo.'}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI provider error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content || !String(content).trim()) {
    throw new Error('AI provider returned an empty response')
  }

  return String(content).trim()
}
