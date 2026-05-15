import { useState } from 'react'
import useAnalysisStore from './store/useAnalysisStore'
import { translations } from './i18n'
import TextInput from './components/TextInput'
import ResultPanel from './components/ResultPanel'

export default function App() {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const [showHow, setShowHow] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0d0d0d', borderBottom: '1px solid #1e1e1e',
        padding: '0 2rem', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>🧠</span>
          <span style={{
            fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            letterSpacing: '-0.01em',
          }}>
            HalluciDetect
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#333',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 4, padding: '2px 7px', letterSpacing: '.05em', textTransform: 'uppercase',
          }}>
            v1.0
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setShowHow(true)}
            style={{
              background: 'none', border: '1px solid #2a2a2a',
              borderRadius: 6, color: '#666', fontSize: 12,
              padding: '5px 12px', cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#dc2626'; e.target.style.color = '#f0f0f0' }}
            onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#666' }}
          >
            {t.navHowItWorks}
          </button>
          <p style={{ fontSize: 12, color: '#2a2a2a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            {t.navStatus}
          </p>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1000, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#e0e0e0', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {t.heroTitle}
          </h1>
          <p style={{ color: '#444', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
            {t.heroSubtitle}
          </p>
          <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, #dc2626, transparent)', margin: '16px auto 0' }} />
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
          <section style={{ background: '#111', border: '1px solid #242424', borderTop: '2px solid #dc2626', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={sectionTitle}>{t.sectionInput}</h2>
            <TextInput />
          </section>
          <section style={{ background: '#111', border: '1px solid #242424', borderTop: '2px solid #333', borderRadius: 12, padding: '1.5rem', minHeight: 320 }}>
            <h2 style={sectionTitle}>{t.sectionAnalysis}</h2>
            <ResultPanel />
          </section>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '2.5rem', color: '#2a2a2a', fontSize: 11 }}>
          {t.footer}
        </footer>
      </main>

      {/* "How it works" modal */}
      {showHow && (
        <div
          onClick={() => setShowHow(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111', border: '1px solid #242424',
              borderTop: '2px solid #dc2626', borderRadius: 14,
              padding: '2rem', maxWidth: 620, width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>🧠</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f0f0' }}>{t.howTitle}</h2>
              </div>
              <button onClick={() => setShowHow(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: '#555', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              {t.howIntro}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {t.howLayers.map((layer, i) => (
                <div key={i} style={{
                  background: '#0a0a0a', border: '1px solid #1e1e1e',
                  borderLeft: `3px solid ${layer.color}`,
                  borderRadius: 8, padding: '14px 16px',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: `${layer.color}15`, border: `1px solid ${layer.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {layer.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 5 }}>
                      <span style={{ color: layer.color }}>Layer {i + 1}</span> — {layer.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65 }}>{layer.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.25rem', padding: '12px 16px',
              background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
            }}>
              {t.pipelineSteps.map((step, i) => (
                <span key={i} style={{ fontSize: 11, color: step === '→' ? '#333' : '#666', fontWeight: step === '→' ? 400 : 600 }}>
                  {step}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#2a2a2a', textAlign: 'center', marginTop: '1rem' }}>
              {t.howClose}
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

const sectionTitle = {
  fontSize: 11, fontWeight: 700, color: '#555',
  textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16,
}
