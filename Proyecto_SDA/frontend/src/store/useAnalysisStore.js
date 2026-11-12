import { create } from 'zustand'
import { analyzeText } from '../api/client'

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

  // History & Comparison
  history: loadInitialHistory(),
  compareItemA: null,
  compareItemB: null,
  isCompareOpen: false,
  isHistoryOpen: false,

  setMode: (mode) => set({ mode, result: null, error: null }),
  setText: (text) => set({ text }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setLanguage: (language) => set({ language }),
  setUseExternal: (useExternal) => set({ useExternal }),
  setUseCorrection: (useCorrection) => set({ useCorrection }),
  setScSamples: (scSamples) => set({ scSamples }),

  setIsHistoryOpen: (open) => set({ isHistoryOpen: open }),
  setIsCompareOpen: (open) => set({ isCompareOpen: open }),

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
      mode: item.mode || 'text',
      text: item.original_text,
      result: item,
      isHistoryOpen: false,
    })
  },

  analyze: async () => {
    const { text, mode, provider, model, language, useExternal, useCorrection, scSamples } = get()
    set({ loading: true, error: null, result: null })
    try {
      const data = await analyzeText({
        text,
        mode,
        llm_provider: provider,
        model,
        language,
        use_external_verification: useExternal,
        use_ai_correction: useCorrection,
        self_consistency_samples: scSamples,
      })

      const historyEntry = {
        ...data,
        timestamp: new Date().toISOString(),
        llm_provider: provider,
        model: model,
      }

      get().addToHistory(historyEntry)

      set({ result: data })
    } catch (err) {
      set({ error: err.response?.data?.detail ?? 'Error de conexión con el servidor.' })
    } finally {
      set({ loading: false })
    }
  },

  reset: () => set({ result: null, error: null }),
}))

export default useAnalysisStore
