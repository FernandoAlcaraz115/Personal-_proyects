import { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

export default function CodeResultView({ codeResult }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const [copied, setCopied] = useState(false)

  if (!codeResult) return null

  function handleCopy() {
    if (codeResult.corrected_code) {
      navigator.clipboard.writeText(codeResult.corrected_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Syntax Status Banner */}
      <div style={{
        background: codeResult.is_valid_syntax ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.1)',
        border: `1px solid ${codeResult.is_valid_syntax ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.3)'}`,
        borderRadius: 10, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{codeResult.is_valid_syntax ? '✅' : '🛑'}</span>
          <div>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: codeResult.is_valid_syntax ? '#10b981' : '#f43f5e',
              letterSpacing: '.02em',
            }}>
              {codeResult.is_valid_syntax ? t.codeSyntaxValid : t.codeSyntaxError}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>
              {codeResult.is_valid_syntax ? 'El código compila correctamente en el árbol sintáctico (AST).' : 'Se encontraron errores de gramática en la estructura del código.'}
            </p>
          </div>
        </div>

        {/* AST Metrics pills */}
        {codeResult.ast_metrics && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(codeResult.ast_metrics).map(([k, v]) => (
              <span key={k} style={{
                fontSize: 10, fontWeight: 600, color: '#94a3b8',
                background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '3px 8px', fontFamily: 'var(--font-mono)',
              }}>
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ghost Packages Alert */}
      {codeResult.hallucinated_packages && codeResult.hallucinated_packages.length > 0 && (
        <div style={{
          background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.35)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>📦❌</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {t.codeGhostWarning}
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 10, lineHeight: 1.5 }}>
            El modelo importó librerías inexistentes que no se encuentran en la biblioteca estándar de Python ni en el índice oficial de PyPI:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {codeResult.hallucinated_packages.map(pkg => (
              <span key={pkg} style={{
                background: 'rgba(244,63,94,0.2)', color: '#fca5a5',
                border: '1px solid rgba(244,63,94,0.5)',
                borderRadius: 6, padding: '4px 10px', fontSize: 12,
                fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>
                import {pkg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues Breakdown */}
      {codeResult.issues && codeResult.issues.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {t.codeIssuesFound} ({codeResult.issues.length})
          </p>
          {codeResult.issues.map((issue, idx) => (
            <div key={idx} style={{
              background: '#0d111a', border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `3px solid ${issue.severity === 'high' ? '#f43f5e' : '#f59e0b'}`,
              borderRadius: 8, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: issue.severity === 'high' ? '#f43f5e' : '#f59e0b',
                  background: issue.severity === 'high' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                  borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--font-mono)',
                }}>
                  {issue.category}
                </span>
                {issue.line_number && (
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {t.codeLine} {issue.line_number}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
                {issue.message}
              </p>
              {issue.suggestion && (
                <p style={{ fontSize: 11, color: '#38bdf8', fontStyle: 'italic' }}>
                  💡 {issue.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, padding: '12px 14px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
            🎉 No se detectaron anomalías sintácticas ni librerías fantasma en este bloque de código.
          </p>
        </div>
      )}

      {/* AI Patched Code Card */}
      {codeResult.corrected_code && (
        <div style={{
          background: '#090d14', border: '1px solid rgba(139,92,246,0.3)',
          borderTop: '2px solid #8b5cf6', borderRadius: 10, padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🤖⚡</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {t.codeAiPatched}
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

          {codeResult.ai_explanation && (
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
              {codeResult.ai_explanation}
            </p>
          )}

          <pre style={{
            background: '#05070a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '12px 14px', overflowX: 'auto',
            fontSize: 13, color: '#38bdf8', lineHeight: 1.6,
          }}>
            <code>{codeResult.corrected_code}</code>
          </pre>
        </div>
      )}

    </div>
  )
}
