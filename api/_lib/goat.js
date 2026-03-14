import { GoatX402Client } from 'goatx402-sdk-server'

const clean = (value, fallback = '') => (value || fallback).trim()

export const merchantId = clean(process.env.GOATX402_MERCHANT_ID, 'demo_merchant')
export const publicAppUrl = clean(process.env.PUBLIC_APP_URL, 'https://goat-paid-agent.vercel.app')
const envAiBaseUrl = clean(process.env.AI_BASE_URL).replace(/\/$/, '')
const envAiApiKey = clean(process.env.AI_API_KEY)
const envAiModel = clean(process.env.AI_MODEL, 'gpt-4.1-mini')

export const goatx402Client = new GoatX402Client({
  baseUrl: clean(process.env.GOATX402_API_URL, 'http://localhost:8286'),
  apiKey: clean(process.env.GOATX402_API_KEY),
  apiSecret: clean(process.env.GOATX402_API_SECRET),
})

export function normalizeAiSettings(input) {
  return {
    baseUrl: ((input && input.baseUrl) || envAiBaseUrl || '').trim().replace(/\/$/, ''),
    apiKey: ((input && input.apiKey) || envAiApiKey || '').trim(),
    model: ((input && input.model) || envAiModel).trim(),
  }
}
