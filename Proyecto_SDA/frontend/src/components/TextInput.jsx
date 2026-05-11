import useAnalysisStore from '../store/useAnalysisStore'

export default function TextInput() {
  const {
    text, setText, provider, setProvider,
    model, setModel,
    useExternal, setUseExternal,
    useCorrection, setUseCorrection,
    scSamples, setScSamples,
    analyze, loading, reset,
  } = useAnalysisStore()

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim().length < 10) return
    reset()
    analyze()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste or type any LLM-generated text here to check for hallucinations…"
        rows={7}
        style={{
          background: '#0a0a0a',
          border: '1.5px solid #242424',
          borderRadius: 8,
          color: '#f0f0f0',
          fontSize: 14,
          padding: '12px 14px',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          transition: 'border-color .2s, box-shadow .2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#dc2626'
          e.target.style.boxShadow  = '0 0 0 3px rgba(220,38,38,.12)'
        }}
        onBlur={e => {
          e.target.style.borderColor = '#242424'
          e.target.style.boxShadow  = 'none'
        }}
      />

      {/* Row 1: provider + model + SC samples */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <Select label="Provider" value={provider} onChange={setProvider}>
          <option value="ollama">Ollama (local)</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </Select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
          Model
          <input
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="llama3.2"
            style={{
              background: '#0a0a0a', border: '1px solid #2a2a2a',
              borderRadius: 6, color: '#f0f0f0', fontSize: 13,
              padding: '5px 8px', outline: 'none', width: 110,
            }}
            onFocus={e => e.target.style.borderColor = '#dc2626'}
            onBlur={e  => e.target.style.borderColor = '#2a2a2a'}
          />
        </label>

        <Select label="SC samples" value={scSamples} onChange={v => setScSamples(Number(v))}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </Select>
      </div>

      {/* Row 2: toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <Toggle
          checked={useExternal}
          onChange={setUseExternal}
          label="Wikipedia + Web"
        />
        <Toggle
          checked={useCorrection}
          onChange={setUseCorrection}
          label="AI correction"
          accent="#ef4444"
        />
      </div>

      <button
        type="submit"
        disabled={loading || text.trim().length < 10}
        style={{
          background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: loading ? '#444' : '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 0',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '.02em',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(220,38,38,.35)',
          transition: 'all .2s',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 6px 28px rgba(220,38,38,.5)' }}
        onMouseLeave={e => { if (!loading) e.target.style.boxShadow = '0 4px 20px rgba(220,38,38,.35)' }}
      >
        {loading ? 'Analyzing…' : 'Analyze text ⚡'}
      </button>
    </form>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#0a0a0a', border: '1px solid #2a2a2a',
          borderRadius: 6, color: '#f0f0f0', fontSize: 13,
          padding: '5px 8px', outline: 'none',
        }}
      >
        {children}
      </select>
    </label>
  )
}

function Toggle({ checked, onChange, label, accent = '#dc2626' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#666', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: accent, transform: 'scale(1.2)' }}
      />
      {label}
    </label>
  )
}
