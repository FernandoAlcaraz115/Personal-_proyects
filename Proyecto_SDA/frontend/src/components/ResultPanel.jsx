import React, { useEffect, useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'
import ClaimCard from './ClaimCard'
import HighlightedText from './HighlightedText'
import CodeResultView from './CodeResultView'
import MathResultView from './MathResultView'
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Terminal,
  Activity,
  FileText,
  FileCode,
  Printer,
  Download
} from 'lucide-react'
import { downloadMarkdown, downloadJSON, printAuditReport } from '../utils/exporter'

export default function ResultPanel() {
  const { result, error, loading, language, mode, currentStreamStep } = useAnalysisStore()
  const t = translations[language] ?? translations.es

  if (loading) return <LayerProgress mode={mode} streamStep={currentStreamStep} />

  if (error) {
    return (
      <div style={{
        border: '1px solid var(--border-hairline)',
        background: 'var(--status-error-subtle)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} color="var(--status-error)" />
          <strong style={{ color: 'var(--status-error)', fontSize: '12.5px', textTransform: 'uppercase' }}>
            {t.errorLabel}
          </strong>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.5 }}>
          {error}
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px 20px',
        textAlign: 'center',
        border: '1px dashed var(--border-hairline)',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.01)',
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          marginBottom: 12,
        }}>
          <Terminal size={20} />
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '13.5px', fontWeight: 500, marginBottom: 4 }}>
          Panel de Auditoría en Espera
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', maxWidth: 280, lineHeight: 1.5 }}>
          Introduce una muestra y presiona <kbd>↵ Ejecutar</kbd> o abre los comandos con <kbd>⌘K</kbd>.
        </p>
      </div>
    )
  }

  const halluCount = result.claims?.filter(c => c.l4?.is_hallucination || c.risk_level === 'high').length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Overview Top Metric Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <ScoreGauge score={result.overall_score} size={95} />

        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {t.labelMethod}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {result.method_used}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Dominio
            </span>
            <p style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: 2 }}>
              {result.mode === 'code' ? 'Código Fuente (Python)' : result.mode === 'math' ? 'Álgebra Simbólica (SymPy)' : 'Hechos y Afirmaciones (NLP)'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '5px',
            padding: '2px 7px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Clock size={11} />
            {result.processing_time_ms} ms
          </span>

          <span style={{
            fontSize: '10.5px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>
            ID: {result.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Export & Actions Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '8px',
        fontSize: '11.5px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
          <Download size={13} />
          <span>Exportar Informe Oficial:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => downloadMarkdown(result)}
            title="Descargar informe completo en Markdown"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
            }}
          >
            <FileText size={12} />
            Markdown (.md)
          </button>

          <button
            onClick={() => downloadJSON(result)}
            title="Descargar payload en formato JSON"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
            }}
          >
            <FileCode size={12} />
            JSON (.json)
          </button>

          <button
            onClick={() => printAuditReport(result)}
            title="Imprimir o guardar como PDF"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
            }}
          >
            <Printer size={12} />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Mode-Specific Views */}
      {result.mode === 'code' && (
        <CodeResultView codeResult={result.code_result} />
      )}

      {result.mode === 'math' && (
        <MathResultView mathResult={result.math_result} />
      )}

      {result.mode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Factual Summary Bar */}
          <div style={{
            background: halluCount > 0 ? 'var(--status-error-subtle)' : 'var(--status-success-subtle)',
            border: `1px solid ${halluCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            {halluCount > 0 ? (
              <AlertCircle size={16} color="var(--status-error)" />
            ) : (
              <CheckCircle2 size={16} color="var(--status-success)" />
            )}
            <p style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: halluCount > 0 ? 'var(--status-error)' : 'var(--status-success)',
            }}>
              {halluCount > 0
                ? t.halluFound(halluCount, result.claims.length)
                : t.halluNone(result.claims.length)
              }
            </p>
          </div>

          <HighlightedText text={result.original_text} claims={result.claims} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {t.claimsBreakdown} ({result.claims.length})
            </span>
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function LayerProgress({ mode, streamStep }) {
  const [activeStep, setActiveStep] = useState(0)

  const stepsMap = {
    code: [
      { name: 'Análisis Sintáctico AST', detail: 'Parseando estructura de código…' },
      { name: 'Registro de Paquetes PyPI', detail: 'Auditando existencia de dependencias…' },
      { name: 'Firmas de APIs', detail: 'Comprobando métodos y llamadas estándar…' },
      { name: 'Corrección con IA', detail: 'Generando parche asistido…' },
    ],
    math: [
      { name: 'Extracción de Ecuaciones', detail: 'Segmentando igualdades matemáticas…' },
      { name: 'Evaluación SymPy', detail: 'Comprobando identidades simbólicas…' },
      { name: 'Delta Numérico', detail: 'Computando discrepancia formal…' },
      { name: 'Demostración', detail: 'Sintetizando pasos corregidos…' },
    ],
    text: [
      { name: 'Señales Lingüísticas', detail: 'Midiendo cobertura léxica y vaguedad…' },
      { name: 'Grounding Wikipedia', detail: 'Contrastando afirmaciones atómicas…' },
      { name: 'Scoring Adaptativo', detail: 'Ponderando índice de fiabilidad…' },
      { name: 'Auditoría IA', detail: 'Contrastando inconsistencias…' },
    ],
  }

  const steps = stepsMap[mode] ?? stepsMap.text

  useEffect(() => {
    if (streamStep?.layer !== undefined) {
      setActiveStep(streamStep.layer)
    }
  }, [streamStep])

  useEffect(() => {
    // Fallback timer if SSE is slow or offline
    if (streamStep?.layer === undefined) {
      const timer = setInterval(() => {
        setActiveStep(s => (s < steps.length - 1 ? s + 1 : s))
      }, 900)
      return () => clearInterval(timer)
    }
  }, [steps.length, streamStep])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '28px 16px',
      background: 'rgba(255, 255, 255, 0.01)',
      border: '1px solid var(--border-hairline)',
      borderRadius: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
        }} />
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Auditoría en Ejecución
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((st, i) => {
          const done = i < activeStep
          const current = i === activeStep
          const stepColor = done ? 'var(--status-success)' : current ? '#ffffff' : 'var(--text-muted)'
          const textCol = done ? 'var(--text-secondary)' : current ? 'var(--text-main)' : 'var(--text-muted)'

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 26 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: done ? 'var(--status-success-subtle)' : current ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: `1.5px solid ${stepColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: stepColor,
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 1,
                    flex: 1,
                    minHeight: 18,
                    background: done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-hairline)',
                    transition: 'background 0.25s ease',
                  }} />
                )}
              </div>

              <div style={{ paddingLeft: 10, paddingBottom: i < steps.length - 1 ? 12 : 0, paddingTop: 1 }}>
                <p style={{ fontSize: '12px', fontWeight: current ? 600 : 400, color: textCol }}>
                  {st.name}
                </p>
                {current && <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: 2 }}>{streamStep?.detail || st.detail}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
