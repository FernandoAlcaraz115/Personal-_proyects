import { useState } from 'react'
import useAnalysisStore from './store/useAnalysisStore'
import { translations } from './i18n'
import TextInput from './components/TextInput'
import ResultPanel from './components/ResultPanel'

export default function App() {
  const { language, setLanguage, mode, setMode } = useAnalysisStore()
  const t = translations[language] ?? translations.es
  const [showHow, setShowHow] = useState(false)

  const modesConfig = [
    { id: 'text', label: t.modeText, icon: '🌐', desc: t.modeTextDesc, color: '#38bdf8' },
    { id: 'code', label: t.modeCode, icon: '💻', desc: t.modeCodeDesc, color: '#a855f7' },
    { id: 'math', label: t.modeMath, icon: '🧮', desc: t.modeMathDesc, color: '#10b981' },
  ]

  const activeModeInfo = modesConfig.find(m => m.id === mode) ?? modesConfig[0]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Futuristic Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6, 7, 10, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 2rem', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))' }}>🧠</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.15rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              letterSpacing: '-0.02em', fontFamily: 'var(--font-display)',
            }}>
              {t.navTitle}
            </span>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {t.navSubtitle}
            </span>
          </div>

          <span style={{
            fontSize: 10, fontWeight: 700, color: '#38bdf8',
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 5, padding: '2px 8px', letterSpacing: '.06em', marginLeft: 6,
          }}>
            v2.0 PRO
          </span>
        </div>

        {/* Center Mode Switcher Pills */}
        <div style={{
          display: 'flex', background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 30, padding: 3, gap: 4,
        }}>
          {modesConfig.map(m => {
            const isActive = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.25))' : 'transparent',
                  border: isActive ? `1px solid ${m.color}66` : '1px solid transparent',
                  borderRadius: 24, padding: '5px 14px',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', transition: 'all .2s ease',
                  boxShadow: isActive ? `0 0 14px ${m.color}33` : 'none',
                }}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right action group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            style={{
              background: '#0d111a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, color: '#cbd5e1', fontSize: 11, fontWeight: 600,
              padding: '5px 9px', cursor: 'pointer', transition: 'all .15s ease',
            }}
          >
            {language === 'es' ? '🇲🇽 ES' : '🇺🇸 EN'}
          </button>

          <button
            onClick={() => setShowHow(true)}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: '#94a3b8', fontSize: 12,
              padding: '5px 12px', cursor: 'pointer', transition: 'all .15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#38bdf8'
              e.currentTarget.style.color = '#f8fafc'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            {t.navHowItWorks}
          </button>

          <p style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 8px #10b981',
            }} />
            {t.navStatus}
          </p>
        </div>
      </nav>

      {/* Main Content Container */}
      <main style={{ flex: 1, maxWidth: 1180, width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Hero Header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 30, padding: '4px 14px', marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '.06em' }}>
              {t.heroBadge}
            </span>
          </div>

          <h1 style={{
            fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc',
            letterSpacing: '-0.03em', marginBottom: 10, fontFamily: 'var(--font-display)',
          }}>
            {t.heroTitle}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            {activeModeInfo.desc}
          </p>

          <div style={{
            width: 80, height: 2,
            background: `linear-gradient(90deg, transparent, ${activeModeInfo.color}, transparent)`,
            margin: '20px auto 0',
          }} />
        </header>

        {/* Two-Column Workspace Layout */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
          alignItems: 'start',
        }}>

          {/* Left Column: Input Form */}
          <section className="glass-panel" style={{
            padding: '1.75rem', borderTop: `2px solid ${activeModeInfo.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={sectionTitleStyle}>
                {t.sectionInput}
              </h2>
              <span style={{
                fontSize: 11, fontWeight: 600, color: activeModeInfo.color,
                background: `${activeModeInfo.color}15`, border: `1px solid ${activeModeInfo.color}33`,
                borderRadius: 20, padding: '2px 9px',
              }}>
                {activeModeInfo.label}
              </span>
            </div>
            <TextInput />
          </section>

          {/* Right Column: Live Analysis */}
          <section className="glass-panel" style={{
            padding: '1.75rem', minHeight: 460,
            borderTop: '2px solid rgba(255,255,255,0.15)',
          }}>
            <h2 style={sectionTitleStyle}>
              {t.sectionAnalysis}
            </h2>
            <ResultPanel />
          </section>

        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', marginTop: '3.5rem', color: '#475569',
          fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p>
            🧠 <strong>HalluciDetect</strong> · Arquitectura de Auditoría Tripartita (Factual · AST Code · SymPy Math)
          </p>
          <p style={{ fontSize: 11 }}>
            Desarrollado para sistemas distribuidos y detección de alucinaciones en modelos de lenguaje de caja negra.
          </p>
        </footer>
      </main>

      {/* "How It Works" Architecture Modal */}
      {showHow && (
        <div
          onClick={() => setShowHow(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-panel"
            style={{
              padding: '2.2rem', maxWidth: 680, width: '100%',
              maxHeight: '88vh', overflowY: 'auto',
              borderTop: '2px solid #38bdf8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🧠</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                  {t.howTitle}
                </h2>
              </div>
              <button
                onClick={() => setShowHow(false)}
                style={{ color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              {t.howIntro}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: '🌐', color: '#38bdf8', title: 'Dimensión 1: Factual / Texto',
                  desc: 'Analiza señales léxicas de cobertura (hedging) y vaguedad, contrasta afirmaciones contra Wikipedia y calcula solapamiento de entidades para mitigar desinformación en lenguaje natural.',
                },
                {
                  icon: '💻', color: '#a855f7', title: 'Dimensión 2: Código & APIs',
                  desc: 'Inspecciona el código mediante análisis de AST en Python. Verifica si los paquetes importados existen en la librería estándar o en PyPI (detectando librerías alucinadas), y audita métodos inexistentes.',
                },
                {
                  icon: '🧮', color: '#10b981', title: 'Dimensión 3: Matemáticas con SymPy',
                  desc: 'Extrae igualdades y pasos aritméticos intermedios. SymPy calcula simbólicamente la diferencia formal entre el lado izquierdo y derecho, detectando errores de cálculo en segundos.',
                },
              ].map((pill, i) => (
                <div key={i} style={{
                  background: '#090d15', border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${pill.color}`,
                  borderRadius: 8, padding: '14px 16px',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    background: `${pill.color}15`, border: `1px solid ${pill.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {pill.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                      {pill.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{pill.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHow(false)}
              style={{
                marginTop: '1.75rem', width: '100%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px 0', color: '#f8fafc', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'background .15s ease',
              }}
            >
              {t.howClose}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

const sectionTitleStyle = {
  fontSize: 11, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '.1em',
}
