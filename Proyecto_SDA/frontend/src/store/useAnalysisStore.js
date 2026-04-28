import { create } from 'zustand'
import { analyzeText } from '../api/client'

const useAnalysisStore = create((set) => ({
  text: '',
  provider: 'ollama',
  model: 'llama3',
  useExternal: true,
  scSamples: 1,

  result: null,
  loading: false,
  error: null,

  setText:       (text)        => set({ text }),
  setProvider:   (provider)    => set({ provider }),
  setModel:      (model)       => set({ model }),
  setUseExternal:(useExternal) => set({ useExternal }),
  setScSamples:  (scSamples)   => set({ scSamples }),

  analyze: async () => {
    const { text, provider, model, useExternal, scSamples } = useAnalysisStore.getState()
    set({ loading: true, error: null, result: null })
    try {
      const data = await analyzeText({
        text,
        llm_provider: provider,
        model,
        use_external_verification: useExternal,
        self_consistency_samples: scSamples,
      })
      set({ result: data })
    } catch (err) {
      set({ error: err.response?.data?.detail ?? 'Connection error.' })
    } finally {
      set({ loading: false })
    }
  },

  reset: () => set({ result: null, error: null }),
}))

export default useAnalysisStore
