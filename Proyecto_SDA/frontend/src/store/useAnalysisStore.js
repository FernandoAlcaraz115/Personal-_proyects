import { create } from 'zustand'
import { analyzeText, analyzeTextStream, liveAudit as liveAuditApi, liveAuditStream } from '../api/client'

const STORAGE_KEY = 'attestly_history_v1'

const loadInitialHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Error loading history from localStorage:', e)
    return []
  }
}

const saveHistory = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
  } catch (e) {
    console.error('Error saving history to localStorage:', e)
  }
}

const useAnalysisStore = create((set, get) => ({
  mode: 'text', // 'text' | 'code' | 'math'
  inputMode: 'manual', // 'manual' | 'live'
  prompt: '',
  text: '',
  provider: 'ollama',
  model: 'llama3.2',
  language: 'es',
  useExternal: true,
  useCorrection: false,
  scSamples: 1,

  result: null,
  loading: false,
  error: null,
  currentStreamStep: null,

  // History & Comparison & Benchmarks
  history: loadInitialHistory(),
  compareItemA: null,
  compareItemB: null,
  isCompareOpen: false,
  isHistoryOpen: false,
  isBenchmarkOpen: false,

  setMode: (mode) => set({ mode, result: null, error: null }),
  setInputMode: (inputMode) => set({ inputMode, error: null }),
  setPrompt: (prompt) => set({ prompt }),
  setText: (text) => set({ text }),
  setProvider: (provider) => {
    const defaultModels = {
      ollama: 'llama3.2',
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.0-flash',
    }
    set({ provider, model: defaultModels[provider] || 'llama3.2' })
  },
  setModel: (model) => set({ model }),
  setLanguage: (language) => set({ language }),
  setUseExternal: (useExternal) => set({ useExternal }),
  setUseCorrection: (useCorrection) => set({ useCorrection }),
  setScSamples: (scSamples) => set({ scSamples }),

  setIsHistoryOpen: (open) => set({ isHistoryOpen: open }),
  setIsCompareOpen: (open) => set({ isCompareOpen: open }),
  setIsBenchmarkOpen: (open) => set({ isBenchmarkOpen: open }),

  setCompareItemA: (item) => set({ compareItemA: item }),
  setCompareItemB: (item) => set({ compareItemB: item }),

  addToHistory: (entry) => {
    const current = get().history
    const filtered = current.filter(h => h.id !== entry.id)
    const updated = [entry, ...filtered]
    saveHistory(updated)
    set({ history: updated })
  },

  deleteHistoryItem: (id) => {
    const current = get().history
    const updated = current.filter(h => h.id !== id)
    saveHistory(updated)
    const { compareItemA, compareItemB } = get()
    set({
      history: updated,
      compareItemA: compareItemA?.id === id ? null : compareItemA,
      compareItemB: compareItemB?.id === id ? null : compareItemB,
    })
  },

  clearHistory: () => {
    saveHistory([])
    set({ history: [], compareItemA: null, compareItemB: null })
  },

  loadFromHistory: (item) => {
    set({
      mode: item.mode === 'sql' ? 'code' : (item.mode || 'text'),
      prompt: item.prompt || '',
      text: item.original_text,
      result: item,
      isHistoryOpen: false,
    })
  },

  analyze: async () => {
    const { text, prompt, mode, provider, model, language, useExternal, useCorrection, scSamples } = get()
    set({ loading: true, error: null, result: null, currentStreamStep: { layer: 0 } })
    const payload = {
      text,
      prompt: prompt?.trim() ? prompt.trim() : null,
      mode,
      llm_provider: provider,
      model,
      language,
      use_external_verification: useExternal,
      use_ai_correction: useCorrection,
      self_consistency_samples: scSamples,
    }

    try {
      let data
      try {
        data = await analyzeTextStream(payload, (step) => {
          set({ currentStreamStep: step })
        })
      } catch (streamErr) {
        console.warn('Streaming SSE not available or failed, falling back to standard POST:', streamErr)
        data = await analyzeText(payload)
      }

      const historyEntry = {
        ...data,
        timestamp: new Date().toISOString(),
        llm_provider: provider,
        model: model,
      }

      get().addToHistory(historyEntry)
      set({ result: data })
    } catch (err) {
      set({ error: err.response?.data?.detail || err.message || 'Error de conexión con el servidor.' })
    } finally {
      set({ loading: false, currentStreamStep: null })
    }
  },

  liveAudit: async () => {
    const { prompt, mode, provider, model, language, useExternal, useCorrection, scSamples } = get()
    if (!prompt || prompt.trim().length < 2) return
    set({
      loading: true,
      error: null,
      result: null,
      text: '',
      currentStreamStep: { layer: 0, name: `Consultando ${provider}`, detail: `Generando respuesta en vivo con ${model}…` },
    })

    const payload = {
      prompt: prompt.trim(),
      mode,
      llm_provider: provider,
      model,
      language,
      use_external_verification: useExternal,
      use_ai_correction: useCorrection,
      self_consistency_samples: scSamples,
    }

    try {
      let data
      try {
        data = await liveAuditStream(
          payload,
          (step) => set({ currentStreamStep: step }),
          (gen) => {
            if (gen?.text) {
              set({ text: gen.text })
            }
          }
        )
      } catch (streamErr) {
        console.warn('Live SSE failed, trying standard POST:', streamErr)
        data = await liveAuditApi(payload)
        if (data?.original_text) set({ text: data.original_text })
      }

      const historyEntry = {
        ...data,
        timestamp: new Date().toISOString(),
        llm_provider: provider,
        model: model,
      }

      get().addToHistory(historyEntry)
      set({ result: data })
    } catch (err) {
      set({ error: err.response?.data?.detail || err.message || 'Error al consultar el LLM en vivo.' })
    } finally {
      set({ loading: false, currentStreamStep: null })
    }
  },

  reset: () => set({ result: null, error: null }),
}))

export default useAnalysisStore
