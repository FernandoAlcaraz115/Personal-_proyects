import { useEffect, useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'
import ClaimCard from './ClaimCard'
import HighlightedText from './HighlightedText'
import CodeResultView from './CodeResultView'
import MathResultView from './MathResultView'

export default function ResultPanel() {
  const { result, error, loading, language, mode } = useAnalysisStore()
  const t = translations[language] ?? translations.es

  if (loading) return <LayerProgress mode={mode} />

  if (error) return (
    <div style={{
      border: '1px solid rgba(244,63,94,0.35)', background: 'rgba(244,63,94,0.08)',
      borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <strong style={{ color: '#f43f5e', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.05em' }}>
        ⚠️ {t.errorLabel}
      </strong>
      <p style={{ color: '#cbd5e1', fontSize: 13 }}>{error}</p>
    </div>
  )

  if (!result) return (
    <div style={emptyContainerStyle}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>
        {mode === 'code' ? '💻' : mode === 'math' ? '🧮' : '🔍'}
      </div>
      <p style={{ color: '#64748b', fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>
        {t.emptyHint}
      </p>
    </div>
  )

  const halluCount = result.claims?.filter(c => c.l4?.is_hallucination || c.risk_level === 'high').length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Primary Summary Metric Card */}
      <div style={{
        background: '#090d15', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <ScoreGauge score={result.overall_score} />

        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={subHeaderLabel}>{t.labelMethod}</p>
          <p style={{ fontSize: 12, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            {result.method_used}
          </p>

          <p style={subHeaderLabel}>Dominio Auditado</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>
              {result.mode === 'code' ? '💻' : result.mode === 'math' ? '🧮' : '🌐'}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: '#f8fafc',
              textTransform: 'capitalize',
            }}>
              {result.mode === 'code' ? 'Código Fuente' : result.mode === 'math' ? 'Matemáticas' : 'Texto Fáctico'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#38bdf8',
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-mono)',
          }}>
            ⚡ {result.processing_time_ms} ms
          </span>
          <p style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
            ID: {result.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Render specialized view according to mode */}
      {result.mode === 'code' && (
        <CodeResultView codeResult={result.code_result} />
      )}

      {result.mode === 'math' && (
        <MathResultView mathResult={result.math_result} />
      )}

      {result.mode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hallucination status alert bar */}
          <div style={{
            background: halluCount > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${halluCount > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.25)'}`,
            borderRadius: 8, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{halluCount > 0 ? '⚠️' : '✅'}</span>
            <p style={{ fontSize: 13, color: halluCount > 0 ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
              {halluCount > 0
                ? t.halluFound(halluCount, result.claims.length)
                : t.halluNone(result.claims.length)
              }
            </p>
          </div>

          {/* Highlighted text visualizer */}
          <HighlightedText text={result.original_text} claims={result.claims} />

          {/* Claims breakdown list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              {t.claimsBreakdown} ({result.claims.length})
            </p>
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function LayerProgress({ mode }) {
  const [activeStep, setActiveStep] = useState(0)

  const stepsMap = {
    code: [
      { name: 'Análisis Sintáctico AST', detail: 'Parseando árbol de sintaxis abstracta…' },
      { name: 'Auditoría PyPI & Stdlib', detail: 'Buscando módulos en registro oficial…' },
      { name: 'Firmas de Funciones & APIs', detail: 'Verificando métodos y llamadas…' },
      { name: 'Generación de Parche IA', detail: 'Sintetizando código corregido…' },
    ],
    math: [
      { name: 'Extracción de Ecuaciones', detail: 'Identificando igualdades y cálculos…' },
      { name: 'Motor Simbólico SymPy', detail: 'Simplificando y evaluando expresiones…' },
      { name: 'Comprobación de Discrepancias', detail: 'Calculando diferencia numérica…' },
      { name: 'Resolución Paso a Paso', detail: 'Generando prueba formal…' },
    ],
    text: [
      { name: 'Análisis Lingüístico', detail: 'Detectando hedging y vaguedad…' },
      { name: 'Verificación Wikipedia', detail: 'Consultando enciclopedia y web…' },
      { name: 'Puntuación Adaptativa', detail: 'Calculando confianza final…' },
      { name: 'Corrección con IA', detail: 'Contrastando afirmaciones…' },
    ],
  }

  const steps = stepsMap[mode] ?? stepsMap.text

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(s => (s < steps.length - 1 ? s + 1 : s))
    }, 900)
    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 0' }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase',
        letterSpacing: '.1em', textAlign: 'center',
      }}>
        ⚡ DIAGNÓSTICO EN TIEMPO REAL
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((st, i) => {
          const done = i < activeStep
          const current = i === activeStep
          const color = done ? '#10b981' : current ? '#06b6d4' : '#1e293b'
          const textCol = done ? '#10b981' : current ? '#f8fafc' : '#475569'

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? 'rgba(16,185,129,0.15)' : current ? 'rgba(6,182,212,0.15)' : '#090d15',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color, flexShrink: 0, transition: 'all .4s ease',
                  boxShadow: current ? '0 0 12px rgba(6,182,212,0.4)' : 'none',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 22,
                    background: done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)',
                    transition: 'background .4s ease',
                  }} />
                )}
              </div>

              <div style={{ paddingLeft: 14, paddingBottom: i < steps.length - 1 ? 16 : 0, paddingTop: 3 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: textCol, transition: 'color .4s ease' }}>
                  {st.name}
                </p>
                {current && <p style={{ fontSize: 11, color: '#38bdf8', marginTop: 2 }}>{st.detail}</p>}
                {done && <p style={{ fontSize: 11, color: 'rgba(16,185,129,0.7)', marginTop: 2 }}>Completado</p>}
                {!done && !current && <p style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>En espera…</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const subHeaderLabel = {
  fontSize: 10, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4,
}

const emptyContainerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 14, padding: '56px 0', textAlign: 'center',
}
