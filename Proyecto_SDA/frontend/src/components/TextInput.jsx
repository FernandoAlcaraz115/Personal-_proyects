import { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

export default function TextInput() {
  const {
    mode, text, setText, provider, setProvider,
    model, setModel, language, setLanguage,
    useExternal, setUseExternal,
    useCorrection, setUseCorrection,
    scSamples, setScSamples,
    analyze, loading, reset,
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Select demo list based on mode
  let currentDemos = t.demosText
  let currentPlaceholder = t.placeholderText
  if (mode === 'code') {
    currentDemos = t.demosCode
    currentPlaceholder = t.placeholderCode
  } else if (mode === 'math') {
    currentDemos = t.demosMath
    currentPlaceholder = t.placeholderMath
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim().length < 2) return
    reset()
    analyze()
  }

  function loadDemo(demoText) {
    reset()
    setText(demoText)
  }

  function insertSymbol(sym) {
    setText(text + sym)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Quick Presets for current mode */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {t.quickDemo}
          </p>
          {mode === 'math' && (
            <div style={{ display: 'flex', gap: 4 }}>
              {['√', '^', '×', '÷', 'sin(x)', 'cos(x)', '='].map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  style={{
                    background: '#121826', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4, color: '#38bdf8', fontSize: 10, padding: '2px 6px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {currentDemos.map(d => (
            <button
              key={d.label}
              type="button"
              onClick={() => loadDemo(d.text)}
              disabled={loading}
              style={{
                background: '#0d111a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 7, color: '#cbd5e1', fontSize: 11, fontWeight: 500,
                padding: '6px 11px', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .2s ease', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
                  e.currentTarget.style.color = '#38bdf8'
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(6,182,212,0.2)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#cbd5e1'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={currentPlaceholder}
          rows={mode === 'code' ? 9 : 6}
          style={{
            width: '100%',
            background: mode === 'code' ? '#070a10' : '#090d15',
            border: '1.5px solid rgba(255,255,255,0.09)',
            borderRadius: 10, color: '#f8fafc',
            fontSize: mode === 'code' ? 13 : 14,
            fontFamily: mode === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
            padding: '14px 16px', resize: 'vertical',
            lineHeight: 1.6, transition: 'all .2s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#06b6d4'
            e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.09)'
            e.target.style.boxShadow = 'none'
          }}
        />

        {mode === 'code' && (
          <span style={{
            position: 'absolute', top: 10, right: 12,
            fontSize: 10, fontWeight: 700, color: '#38bdf8',
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: 4, padding: '2px 6px', fontFamily: 'var(--font-mono)',
          }}>
            PYTHON AST
          </span>
        )}
      </div>

      {/* Primary Options Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Toggle
            checked={useExternal}
            onChange={setUseExternal}
            label={mode === 'code' ? 'Validar en PyPI' : mode === 'math' ? 'Motor SymPy' : t.labelWikipedia}
            accent="#06b6d4"
          />

          <Toggle
            checked={useCorrection}
            onChange={setUseCorrection}
            label={t.labelAICorrection}
            accent="#8b5cf6"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            fontSize: 11, fontWeight: 600, color: '#64748b',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          ⚙️ {showAdvanced ? 'Ocultar ajustes' : 'Ajustes LLM'}
        </button>
      </div>

      {/* Advanced Settings Drawer */}
      {showAdvanced && (
        <div style={{
          background: '#090d15', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 14,
        }}>
          <Select label={t.labelProvider} value={provider} onChange={setProvider}>
            <option value="ollama">Ollama (local)</option>
            <option value="openai">OpenAI (gpt-4o)</option>
            <option value="gemini">Google Gemini</option>
          </Select>

          <Select label={t.labelLanguage} value={language} onChange={setLanguage}>
            <option value="es">🇲🇽 Español</option>
            <option value="en">🇺🇸 English</option>
          </Select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            {t.labelModel}
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="llama3.2"
              style={{
                background: '#06080d', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, color: '#f8fafc', fontSize: 12,
                padding: '4px 8px', outline: 'none', width: 100, fontFamily: 'var(--font-mono)',
              }}
            />
          </label>

          <Select label={t.labelSC} value={scSamples} onChange={v => setScSamples(Number(v))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'muestra' : 'muestras'}</option>)}
          </Select>
        </div>
      )}

      {/* Main Execute Button */}
      <button
        type="submit"
        disabled={loading || text.trim().length < 2}
        style={{
          background: loading
            ? '#161b26'
            : 'linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #8b5cf6 100%)',
          color: loading ? '#64748b' : '#ffffff',
          borderRadius: 10, padding: '13px 0',
          fontSize: 15, fontWeight: 700, letterSpacing: '.03em',
          boxShadow: loading ? 'none' : '0 4px 24px rgba(6,182,212,0.3)',
          transition: 'all .25s ease', cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => {
          if (!loading && text.trim().length >= 2) {
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(99,102,241,0.5)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(6,182,212,0.3)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
      >
        {loading ? t.btnAnalyzing : t.btnAnalyze}
      </button>

    </form>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
      {label}:
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#06080d', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, color: '#f8fafc', fontSize: 12,
          padding: '4px 8px', outline: 'none',
        }}
      >
        {children}
      </select>
    </label>
  )
}

function Toggle({ checked, onChange, label, accent = '#06b6d4' }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
      color: checked ? '#f8fafc' : '#94a3b8', cursor: 'pointer', userSelect: 'none',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: accent, width: 16, height: 16, cursor: 'pointer' }}
      />
      {label}
    </label>
  )
}
