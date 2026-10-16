import { create } from 'zustand'
import { analyzeText } from '../api/client'

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

  setMode: (mode) => set({ mode, result: null, error: null }),
  setText: (text) => set({ text }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setLanguage: (language) => set({ language }),
  setUseExternal: (useExternal) => set({ useExternal }),
  setUseCorrection: (useCorrection) => set({ useCorrection }),
  setScSamples: (scSamples) => set({ scSamples }),

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
