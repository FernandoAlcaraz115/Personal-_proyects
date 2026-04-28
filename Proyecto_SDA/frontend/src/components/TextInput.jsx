import useAnalysisStore from '../store/useAnalysisStore'

export default function TextInput() {
  const { text, setText, provider, setProvider, model, setModel,
          useExternal, setUseExternal, scSamples, setScSamples,
          analyze, loading, reset } = useAnalysisStore()

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
          background: '#1e293b',
          border: '1.5px solid #334155',
          borderRadius: 8,
          color: '#f1f5f9',
          fontSize: 14,
          padding: '12px 14px',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = '#3b82f6'}
        onBlur={e  => e.target.style.borderColor = '#334155'}
      />

      {/* Options row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Select label="Provider" value={provider} onChange={setProvider}>
          <option value="ollama">Ollama (local)</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </Select>

        <Select label="SC samples" value={scSamples} onChange={v => setScSamples(Number(v))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </Select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useExternal}
            onChange={e => setUseExternal(e.target.checked)}
            style={{ accentColor: '#3b82f6', transform: 'scale(1.2)' }}
          />
          Wikipedia verification
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || text.trim().length < 10}
        style={{
          background: loading ? '#334155' : 'linear-gradient(90deg, #2563eb, #7c3aed)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 0',
          fontSize: 15,
          fontWeight: 600,
          boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,.35)',
          transition: 'all .2s',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Analyzing…' : 'Analyze text ⚡'}
      </button>
    </form>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 6,
          color: '#f1f5f9',
          fontSize: 13,
          padding: '5px 8px',
          outline: 'none',
        }}
      >
        {children}
      </select>
    </label>
  )
}
