import { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

export default function MathResultView({ mathResult }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const [copied, setCopied] = useState(false)

  if (!mathResult) return null

  function handleCopy() {
    if (mathResult.corrected_solution) {
      navigator.clipboard.writeText(mathResult.corrected_solution)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary Card */}
      <div style={{
        background: mathResult.has_hallucinations ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
        border: `1px solid ${mathResult.has_hallucinations ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.25)'}`,
        borderRadius: 10, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{mathResult.has_hallucinations ? '⚠️' : '📐'}</span>
          <div>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: mathResult.has_hallucinations ? '#f43f5e' : '#10b981',
              letterSpacing: '.02em',
            }}>
              {mathResult.has_hallucinations ? t.mathErrorsFound : t.mathNoErrors}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>
              {mathResult.summary}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#10b981',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-mono)',
          }}>
            Válidas: {mathResult.valid_equations}
          </span>
          {mathResult.hallucinated_equations > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#f43f5e',
              background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)',
              borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-mono)',
            }}>
              Erróneas: {mathResult.hallucinated_equations}
            </span>
          )}
        </div>
      </div>

      {/* Step by Step Breakdown */}
      {mathResult.steps && mathResult.steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {t.mathAuditedEquations} ({mathResult.steps.length})
          </p>

          {mathResult.steps.map((step) => (
            <div key={step.step_number} style={{
              background: '#0d111a', border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `3px solid ${step.is_valid ? '#10b981' : '#f43f5e'}`,
              borderRadius: 8, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#94a3b8',
                  background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 7px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {t.mathStep} #{step.step_number}
                </span>

                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: step.is_valid ? '#10b981' : '#f43f5e',
                  background: step.is_valid ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.15)',
                  border: `1px solid ${step.is_valid ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.4)'}`,
                  borderRadius: 20, padding: '2px 9px',
                }}>
                  {step.is_valid ? '✅ Verificado (SymPy)' : '❌ Alucinación / Error'}
                </span>
              </div>

              {/* Raw Equation display */}
              <div style={{
                background: '#06080d', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 6, padding: '8px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 13, color: '#f8fafc',
              }}>
                {step.raw_expression}
              </div>

              {/* If invalid: show discrepancy breakdown */}
              {!step.is_valid && (
                <div style={{
                  background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {step.error_message && (
                    <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.4 }}>
                      ⚠️ {step.error_message}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {t.mathAffirmed}:
                      </span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                        {step.calculated_value ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {t.mathExpected}:
                      </span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {step.expected_value ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  {step.difference && step.difference !== '0' && (
                    <p style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4 }}>
                      Magnitud del error: <strong style={{ color: '#f59e0b' }}>{step.difference}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Formal Solution */}
      {mathResult.corrected_solution && (
        <div style={{
          background: '#090d14', border: '1px solid rgba(139,92,246,0.3)',
          borderTop: '2px solid #8b5cf6', borderRadius: 10, padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🤖📐</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {t.mathAiSolution}
              </p>
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 6, color: '#c084fc', fontSize: 11, fontWeight: 600,
                padding: '4px 10px', transition: 'all .15s',
              }}
            >
              {copied ? t.copiedTooltip : t.copyButton}
            </button>
          </div>

          {mathResult.ai_explanation && (
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
              {mathResult.ai_explanation}
            </p>
          )}

          <div style={{
            background: '#05070a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#38bdf8',
            fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6,
          }}>
            {mathResult.corrected_solution}
          </div>
        </div>
      )}

    </div>
  )
}
