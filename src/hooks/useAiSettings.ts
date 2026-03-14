import { useEffect, useState } from 'react'

const STORAGE_KEY = 'goat-paid-agent.ai-settings'

export interface AiSettingsState {
  baseUrl: string
  model: string
  apiKey: string
  hasApiKey: boolean
}

const defaultState: AiSettingsState = {
  baseUrl: '',
  model: 'gpt-4.1-mini',
  apiKey: '',
  hasApiKey: false,
}

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettingsState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AiSettingsState>
        setSettings({
          baseUrl: parsed.baseUrl || '',
          model: parsed.model || defaultState.model,
          apiKey: parsed.apiKey || '',
          hasApiKey: Boolean(parsed.apiKey),
        })
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load AI settings')
    } finally {
      setLoading(false)
    }
  }, [])

  async function saveSettings() {
    try {
      setSaving(true)
      setError(null)
      setSavedMessage(null)

      const next = {
        baseUrl: settings.baseUrl.trim().replace(/\/$/, ''),
        model: settings.model.trim() || defaultState.model,
        apiKey: settings.apiKey.trim(),
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSettings({
        ...next,
        hasApiKey: Boolean(next.apiKey),
      })
      setSavedMessage('AI settings saved in this browser')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    savedMessage,
    saveSettings,
  }
}
