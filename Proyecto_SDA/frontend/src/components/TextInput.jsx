import React, { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  SlidersHorizontal, 
  Sparkles, 
  Play, 
  RotateCcw,
  Sliders,
  ChevronDown
} from 'lucide-react'

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

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Raycast-style Presets bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '10.5px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Casos de Prueba
          </span>

          {mode === 'math' && (
            <div style={{ display: 'flex', gap: 3 }}>
              {['√', '^', '×', '÷', 'sin(x)', 'cos(x)', '='].map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  className="key-cap"
                  style={{
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                  title={`Insertar ${sym}`}
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {currentDemos.map(d => (
            <button
              key={d.label}
              type="button"
              onClick={() => loadDemo(d.text)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                padding: '4px 9px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.color = '#ffffff'
                  e.currentTarget.style.borderColor = 'var(--border-muted)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Surface */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={currentPlaceholder}
          rows={mode === 'code' ? 10 : 8}
          style={{
            width: '100%',
            background: mode === 'code' ? '#0a0a0c' : '#141416',
            border: '1px solid var(--border-hairline)',
            borderRadius: '10px',
            color: 'var(--text-main)',
            fontSize: mode === 'code' ? '12.5px' : '13px',
            fontFamily: mode === 'code' ? 'var(--font-mono)' : 'var(--font-sans)',
            padding: '14px 16px',
            resize: 'vertical',
            lineHeight: 1.6,
            transition: 'border-color 0.15s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--border-active)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border-hairline)'
          }}
        />

        {/* Character count & status line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 4px 0 4px',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span>{mode === 'code' ? 'AST Python v3.11' : mode === 'math' ? 'SymPy Parser' : 'Atomic Fact Claim Segmenter'}</span>
          <span>{charCount} chars · {wordCount} words</span>
        </div>
      </div>

      {/* Minimal Toggle Strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '8px',
        padding: '8px 12px',
        gap: 10,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <Toggle
            checked={useExternal}
            onChange={setUseExternal}
            label={mode === 'code' ? 'Verificar en PyPI' : mode === 'math' ? 'Motor SymPy' : t.labelWikipedia}
          />

          <Toggle
            checked={useCorrection}
            onChange={setUseCorrection}
            label={t.labelAICorrection}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            fontSize: '11px',
            color: showAdvanced ? '#ffffff' : 'var(--text-tertiary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <SlidersHorizontal size={12} />
          <span>{showAdvanced ? 'Ocultar ajustes' : 'Parámetros'}</span>
        </button>
      </div>

      {/* Advanced Parameters Drawer */}
      {showAdvanced && (
        <div style={{
          background: '#161619',
          border: '1px solid var(--border-hairline)',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
        }}>
          <Select label={t.labelProvider} value={provider} onChange={setProvider}>
            <option value="ollama">Ollama (Local)</option>
            <option value="openai">OpenAI (GPT-4o Mini)</option>
            <option value="gemini">Google Gemini 2.0</option>
          </Select>

          <Select label={t.labelLanguage} value={language} onChange={setLanguage}>
            <option value="es">Español (ES)</option>
            <option value="en">English (US)</option>
          </Select>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
            <span>{t.labelModel}</span>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="llama3.2"
              style={{
                background: '#101012',
                border: '1px solid var(--border-hairline)',
                borderRadius: '5px',
                color: 'var(--text-main)',
                fontSize: '11.5px',
                padding: '4px 8px',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                width: 105,
              }}
            />
          </label>

          <Select label={t.labelSC} value={scSamples} onChange={v => setScSamples(Number(v))}>
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'muestra (1x)' : 'muestras'}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Raycast Primary Action Button */}
      <button
        type="submit"
        disabled={loading || text.trim().length < 2}
        style={{
          background: loading ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
          color: loading ? 'var(--text-tertiary)' : '#000000',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: loading ? 'none' : '0 2px 10px rgba(255, 255, 255, 0.15)',
        }}
        onMouseEnter={e => {
          if (!loading && text.trim().length >= 2) {
            e.currentTarget.style.background = '#e6e6e6'
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.currentTarget.style.background = '#ffffff'
          }
        }}
      >
        <Play size={13} fill={loading ? 'transparent' : '#000000'} />
        <span>{loading ? t.btnAnalyzing : t.btnAnalyze}</span>
      </button>

    </form>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
      <span>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#101012',
          border: '1px solid var(--border-hairline)',
          borderRadius: '5px',
          color: 'var(--text-main)',
          fontSize: '11.5px',
          padding: '4px 8px',
          outline: 'none',
        }}
      >
        {children}
      </select>
    </label>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '11.5px',
      color: checked ? 'var(--text-main)' : 'var(--text-tertiary)',
      cursor: 'pointer',
      userSelect: 'none',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{
          accentColor: '#ffffff',
          width: 14,
          height: 14,
          cursor: 'pointer',
        }}
      />
      <span>{label}</span>
    </label>
  )
}
