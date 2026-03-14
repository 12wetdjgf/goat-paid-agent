import { merchantId, normalizeAiSettings } from './_lib/goat.js'

export default function handler(_req, res) {
  const aiSettings = normalizeAiSettings()

  res.status(200).json({
    status: 'ok',
    merchantId,
    aiConfigured: Boolean(aiSettings.baseUrl && aiSettings.apiKey),
  })
}
