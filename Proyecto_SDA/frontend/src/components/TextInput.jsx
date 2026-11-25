import React, { useState, useRef } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  SlidersHorizontal, 
  Sparkles, 
  Play, 
  RotateCcw,
  Sliders,
  ChevronDown,
  UploadCloud,
  FileUp,
  FileText,
  X,
  Zap,
  MessageSquareText
} from 'lucide-react'

export default function TextInput() {
  const {
    mode, setMode, inputMode, setInputMode, prompt, setPrompt,
    text, setText, provider, setProvider,
    model, setModel, language, setLanguage,
    useExternal, setUseExternal,
    useCorrection, setUseCorrection,
    scSamples, setScSamples,
    analyze, liveAudit, loading, reset,
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [loadedFileName, setLoadedFileName] = useState(null)
  const fileInputRef = useRef(null)

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
    if (inputMode === 'live') {
      if (prompt.trim().length < 2) return
      reset()
      liveAudit()
      return
    }
    if (text.trim().length < 2) return
    reset()
    analyze()
  }

  function handleFiles(files) {
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target.result
      if (typeof content === 'string') {
        reset()
        setText(content)
        setLoadedFileName(file.name)

        // Auto-detect mode by file extension
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (['py', 'pyw', 'ipynb', 'sql'].includes(ext)) {
          setMode('code')
        } else if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(ext)) {
          setMode('code')
        } else if (['tex', 'latex', 'math'].includes(ext)) {
          setMode('math')
        } else if (['txt', 'md', 'json', 'csv'].includes(ext)) {
          setMode('text')
        }
      }
    }
    reader.readAsText(file)
  }

  function loadDemo(demoText) {
    reset()
    setLoadedFileName(null)
    setText(demoText)
  }

  function insertSymbol(sym) {
    setText(text + sym)
  }

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Input Mode Switcher: Manual Paste vs Live LLM Interceptor */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '8px',
        padding: '3px',
      }}>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: inputMode === 'manual' ? 600 : 400,
            color: inputMode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
            background: inputMode === 'manual' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: inputMode === 'manual' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          <MessageSquareText size={13} />
          <span>Pegar Respuesta</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('live')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: inputMode === 'live' ? 600 : 400,
            color: inputMode === 'live' ? '#ffffff' : 'var(--text-secondary)',
            background: inputMode === 'live' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
            border: inputMode === 'live' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          <Zap size={13} color={inputMode === 'live' ? '#34d399' : 'currentColor'} />
          <span>Preguntar al LLM en Vivo</span>
        </button>
      </div>

      {/* Live LLM Mode Prompt Box */}
      {inputMode === 'live' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interceptor LLM en Tiempo Real ({provider} · {model})
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                style={{
                  background: '#101012',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '5px',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  padding: '3px 7px',
                }}
              >
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
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
                  fontSize: '11px',
                  padding: '3px 7px',
                  fontFamily: 'var(--font-mono)',
                  width: 92,
                }}
              />
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={
              mode === 'code'
                ? 'Ej: Escribe un script en Python para encriptar contraseñas o una consulta SQL para actualizar usuarios…'
                : mode === 'math'
                  ? 'Ej: Resuelve paso a paso: ¿cuánto es 23 * 47 + 19 y verifica la identidad sin(x)^2 + cos(x)^2?'
                  : 'Ej: ¿Quién fundó Microsoft, en qué año y cuál es la capital de Australia?'
            }
            rows={3}
            style={{
              width: '100%',
              background: '#0e0e11',
              border: '1px solid var(--border-hairline)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '13px',
              padding: '10px 12px',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />

          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
            Attestly consulta al modelo directamente (sin copiar/pegar ni fórmulas corruptas) y audita su respuesta al instante usando tu pregunta como contexto.
          </p>
        </div>
      )}

      {/* Optional Prompt Context Field in Manual Mode */}
      {inputMode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{
            fontSize: '10.5px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Pregunta / Contexto Original (Opcional)
          </label>
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ej: ¿Cuándo se fundó Microsoft? (ayuda a resolver sujetos implícitos y contexto)"
            style={{
              width: '100%',
              background: '#111114',
              border: '1px solid var(--border-hairline)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '12px',
              padding: '8px 12px',
              outline: 'none',
            }}
          />
        </div>
      )}

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => handleFiles(e.target.files)}
              style={{ display: 'none' }}
              accept=".py,.pyw,.js,.ts,.tsx,.jsx,.sql,.txt,.md,.json,.csv,.tex"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                padding: '3px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
              }}
              title="Cargar archivo .py, .js, .sql, .txt, .json o .tex"
            >
              <UploadCloud size={12} />
              <span>Cargar Archivo</span>
            </button>

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
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
      >
        {isDragging && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(12, 12, 14, 0.92)',
            border: '2px dashed #ffffff',
            borderRadius: '10px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            backdropFilter: 'blur(4px)',
          }}>
            <FileUp size={28} color="#ffffff" />
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              Suelta el archivo aquí para auditarlo
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Detecta automáticamente Python, JavaScript, Matemáticas y Texto
            </p>
          </div>
        )}

        {/* Loaded File Pill */}
        {loadedFileName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-hairline)',
            borderRadius: '6px',
            padding: '3px 8px',
            marginBottom: 8,
            alignSelf: 'flex-start',
            fontSize: '11px',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-mono)',
          }}>
            <FileText size={12} color="var(--text-secondary)" />
            <span>{loadedFileName}</span>
            <button
              type="button"
              onClick={() => {
                setLoadedFileName(null)
                setText('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <textarea
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (loadedFileName) setLoadedFileName(null)
          }}
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
        disabled={loading || (inputMode === 'live' ? prompt.trim().length < 2 : text.trim().length < 2)}
        style={{
          background: loading ? 'rgba(255, 255, 255, 0.05)' : (inputMode === 'live' ? '#10b981' : '#ffffff'),
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
          boxShadow: loading ? 'none' : (inputMode === 'live' ? '0 2px 12px rgba(16, 185, 129, 0.3)' : '0 2px 10px rgba(255, 255, 255, 0.15)'),
        }}
        onMouseEnter={e => {
          const canRun = inputMode === 'live' ? prompt.trim().length >= 2 : text.trim().length >= 2
          if (!loading && canRun) {
            e.currentTarget.style.background = inputMode === 'live' ? '#34d399' : '#e6e6e6'
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.currentTarget.style.background = inputMode === 'live' ? '#10b981' : '#ffffff'
          }
        }}
      >
        {inputMode === 'live' ? <Zap size={13} fill={loading ? 'transparent' : '#000000'} /> : <Play size={13} fill={loading ? 'transparent' : '#000000'} />}
        <span>
          {loading
            ? t.btnAnalyzing
            : (inputMode === 'live' ? 'Generar y Auditar en Vivo ⚡' : t.btnAnalyze)}
        </span>
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
