import React, { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Calculator, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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

  const hasErrors = mathResult.has_hallucinations

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* SymPy Verification Status Banner */}
      <div style={{
        background: hasErrors ? 'var(--status-error-bg)' : 'var(--status-success-bg)',
        border: `1px solid ${hasErrors ? 'var(--status-error-border)' : 'var(--status-success-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasErrors ? (
            <XCircle size={18} color="var(--status-error-text)" />
          ) : (
            <CheckCircle2 size={18} color="var(--status-success-text)" />
          )}
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: hasErrors ? 'var(--status-error-text)' : 'var(--status-success-text)',
            }}>
              {hasErrors ? t.mathErrorsFound : t.mathNoErrors}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {mathResult.summary}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--status-success-text)',
            background: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '3px 8px',
            fontFamily: 'var(--font-mono)',
          }}>
            Válidas: {mathResult.valid_equations}
          </span>
          {mathResult.hallucinated_equations > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--status-error-text)',
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
            }}>
              Erróneas: {mathResult.hallucinated_equations}
            </span>
          )}
        </div>
      </div>

      {/* Audited Mathematical Steps */}
      {mathResult.steps && mathResult.steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {t.mathAuditedEquations} ({mathResult.steps.length})
          </span>

          {mathResult.steps.map((step) => {
            const isErr = !step.is_valid
            return (
              <div key={step.step_number} style={{
                background: 'var(--bg-subtle)',
                border: `1px solid ${isErr ? 'var(--status-error-border)' : 'var(--status-success-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {t.mathStep} #{String(step.step_number).padStart(2, '0')}
                  </span>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isErr ? 'var(--status-error-text)' : 'var(--status-success-text)',
                    background: isErr ? 'var(--status-error-bg)' : 'var(--status-success-bg)',
                    border: `1px solid ${isErr ? 'var(--status-error-border)' : 'var(--status-success-border)'}`,
                    borderRadius: 'var(--radius-xs)',
                    padding: '2px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                    {isErr ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                    <span>{isErr ? 'Discrepancia confirmada' : 'Demostrado formalmente'}</span>
                  </span>
                </div>

                {/* Equation Expression */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                }}>
                  {step.raw_expression}
                </div>

                {/* Error comparison panel if invalid */}
                {isErr && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid var(--status-error-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}>
                    {step.error_message && (
                      <p style={{ fontSize: '12px', color: 'var(--status-error-text)', lineHeight: 1.4 }}>
                        {step.error_message}
                      </p>
                    )}

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-subtle)',
                    }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {t.mathAffirmed}
                        </span>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-error-text)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {step.calculated_value ?? 'N/A'}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {t.mathExpected}
                        </span>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-success-text)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {step.expected_value ?? 'N/A'}
                        </p>
                      </div>
                    </div>

                    {step.difference && step.difference !== '0' && (
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', paddingTop: 4 }}>
                        Delta numérico: <span style={{ color: 'var(--status-warn-text)', fontFamily: 'var(--font-mono)' }}>{step.difference}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI Formal Mathematical Resolution */}
      {mathResult.corrected_solution && (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--brand-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--brand-text)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t.mathAiSolution}
              </span>
            </div>

            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--brand-text)',
                background: 'var(--brand-subtle)',
                border: '1px solid var(--brand-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 8px',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? t.copiedTooltip : t.copyButton}</span>
            </button>
          </div>

          {mathResult.ai_explanation && (
            <p style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {mathResult.ai_explanation}
            </p>
          )}

          <div style={{
            padding: '14px',
            fontSize: '12.5px',
            color: '#e2e8f0',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            background: '#04060a',
          }}>
            {mathResult.corrected_solution}
          </div>
        </div>
      )}

    </div>
  )
}
