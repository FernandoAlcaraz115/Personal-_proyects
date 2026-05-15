import { useEffect, useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'
import ClaimCard from './ClaimCard'
import HighlightedText from './HighlightedText'

export default function ResultPanel() {
  const { result, error, loading, language } = useAnalysisStore()
  const t = translations[language] ?? translations.es

  if (loading) return <LayerProgress />

  if (error) return (
    <div style={{ border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.06)', borderRadius: 8, padding: '14px 16px' }}>
      <strong style={{ color: '#ef4444', fontSize: 13 }}>{t.errorLabel}</strong>
      <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{error}</p>
    </div>
  )

  if (!result) return (
    <div style={centerStyle}>
      <span style={{ fontSize: 36, filter: 'grayscale(1) opacity(.3)' }}>🔍</span>
      <p style={{ color: '#333', fontSize: 13 }}>{t.emptyHint}</p>
    </div>
  )

  const halluCount = result.claims.filter(c => c.l4?.is_hallucination || c.risk_level === 'high').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Summary card */}
      <div style={{
        background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 10,
        padding: '16px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <ScoreGauge score={result.overall_score} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <Label>{t.labelMethod}</Label>
          <p style={{ fontSize: 12, color: '#555', fontFamily: 'monospace', marginBottom: 12 }}>{result.method_used}</p>
          <Label>{t.labelClaimsCount}</Label>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f0' }}>{result.claims.length}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#333' }}>{result.processing_time_ms} ms</p>
          <p style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'monospace', marginTop: 4 }}>{result.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Hallucination summary bar */}
      <div style={{
        background: halluCount > 0 ? 'rgba(239,68,68,.07)' : 'rgba(34,197,94,.07)',
        border: `1px solid ${halluCount > 0 ? 'rgba(239,68,68,.2)' : 'rgba(34,197,94,.2)'}`,
        borderRadius: 8, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>{halluCount > 0 ? '⚠️' : '✅'}</span>
        <p style={{ fontSize: 13, color: halluCount > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
          {halluCount > 0
            ? t.halluFound(halluCount, result.claims.length)
            : t.halluNone(result.claims.length)
          }
        </p>
      </div>

      {/* Highlighted text */}
      <HighlightedText text={result.original_text} claims={result.claims} />

      {/* Claims list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {t.claimsBreakdown}
        </p>
        {result.claims.map((claim, i) => (
          <ClaimCard key={i} claim={claim} index={i} />
        ))}
      </div>

    </div>
  )
}

function LayerProgress() {
  const { language } = useAnalysisStore()
  const t = translations[language] ?? translations.es
  const [activeLayer, setActiveLayer] = useState(0)

  useEffect(() => {
    const delays = [900, 3200, 400]
    let idx = 0
    function advance() {
      idx++
      if (idx < t.layers.length) {
        setActiveLayer(idx)
        if (delays[idx]) setTimeout(advance, delays[idx])
      }
    }
    setTimeout(advance, delays[0])
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 0' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center' }}>
        {t.pipelineRunning}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {t.layers.map((layer, i) => {
          const done    = i < activeLayer
          const current = i === activeLayer
          const color   = done ? '#22c55e' : current ? '#dc2626' : '#2a2a2a'
          const textCol = done ? '#22c55e' : current ? '#f0f0f0' : '#333'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? '#22c55e18' : current ? 'rgba(220,38,38,.12)' : '#111',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color, flexShrink: 0, transition: 'all .4s',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {i < t.layers.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? '#22c55e44' : '#1e1e1e', transition: 'background .4s' }} />
                )}
              </div>
              <div style={{ paddingLeft: 12, paddingBottom: i < t.layers.length - 1 ? 16 : 0, paddingTop: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: textCol, transition: 'color .4s' }}>
                  Layer {i + 1}: {layer.name}
                </p>
                {current && <p style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{layer.detail}</p>}
                {done    && <p style={{ fontSize: 11, color: '#22c55e55', marginTop: 3 }}>{t.layerCompleted}</p>}
                {!done && !current && <p style={{ fontSize: 11, color: '#2a2a2a', marginTop: 3 }}>{t.layerWaiting}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
      {children}
    </p>
  )
}

const centerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 12, padding: '52px 0', textAlign: 'center',
}
