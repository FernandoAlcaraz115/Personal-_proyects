import React, { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  CheckCircle2, 
  XCircle, 
  PackageX, 
  Copy, 
  Check, 
  Code2, 
  AlertTriangle,
  Lightbulb,
  Sparkles
} from 'lucide-react'

export default function CodeResultView({ codeResult }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const [copied, setCopied] = useState(false)

  if (!codeResult) return null

  const isJS = codeResult.language === 'javascript'
  const langLabel = isJS ? 'JavaScript / TypeScript' : 'Python'
  const registryLabel = isJS ? 'npm' : 'PyPI'

  function handleCopy() {
    if (codeResult.corrected_code) {
      navigator.clipboard.writeText(codeResult.corrected_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* AST / Syntax Validation Status */}
      <div style={{
        background: codeResult.is_valid_syntax ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
        border: `1px solid ${codeResult.is_valid_syntax ? 'var(--status-success-border)' : 'var(--status-error-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {codeResult.is_valid_syntax ? (
            <CheckCircle2 size={18} color="var(--status-success-text)" />
          ) : (
            <XCircle size={18} color="var(--status-error-text)" />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: codeResult.is_valid_syntax ? 'var(--status-success-text)' : 'var(--status-error-text)',
              }}>
                {codeResult.is_valid_syntax ? t.codeSyntaxValid : t.codeSyntaxError}
              </p>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}>
                {langLabel}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {codeResult.is_valid_syntax 
                ? `Estructura sintáctica de ${langLabel} verificada sin errores gramaticales.` 
                : 'Se encontraron fallas gramaticales que impiden la compilación o ejecución del bloque.'}
            </p>
          </div>
        </div>

        {/* AST Metrics pills */}
        {codeResult.ast_metrics && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(codeResult.ast_metrics).map(([k, v]) => (
              <span key={k} style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 7px',
                fontFamily: 'var(--font-mono)',
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
          background: 'var(--status-error-bg)',
          border: '1px solid var(--status-error-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PackageX size={17} color="var(--status-error-text)" />
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--status-error-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {t.codeGhostWarning}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            El modelo importó módulos inexistentes que no forman parte de la biblioteca estándar ni del registro oficial de {registryLabel}:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {codeResult.hallucinated_packages.map(pkg => (
              <code key={pkg} style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 9px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}>
                import {pkg}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Issues Breakdown */}
      {codeResult.issues && codeResult.issues.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {t.codeIssuesFound} ({codeResult.issues.length})
          </span>

          {codeResult.issues.map((issue, idx) => {
            const isCritical = issue.severity === 'high'
            const issueBorder = isCritical ? 'var(--status-error-border)' : 'var(--status-warn-border)'
            const issueColor = isCritical ? 'var(--status-error-text)' : 'var(--status-warn-text)'

            return (
              <div key={idx} style={{
                background: 'var(--bg-subtle)',
                border: `1px solid ${issueBorder}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: issueColor,
                      background: `${issueColor}15`,
                      border: `1px solid ${issueColor}33`,
                      borderRadius: 'var(--radius-xs)',
                      padding: '2px 7px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {issue.category}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {issue.symbol}
                    </span>
                  </div>

                  {issue.line_number && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {t.codeLine} {issue.line_number}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {issue.message}
                </p>

                {issue.suggestion && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '11.5px',
                    color: 'var(--brand-text)',
                    marginTop: 2,
                  }}>
                    <Lightbulb size={13} />
                    <span>{issue.suggestion}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--status-success-bg)',
          border: '1px solid var(--status-success-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <CheckCircle2 size={18} color="var(--status-success-text)" />
          <span style={{ fontSize: '12.5px', color: 'var(--status-success-text)', fontWeight: 500 }}>
            Auditoría de código completada: no se detectaron llamadas alucinadas ni dependencias fantasma.
          </span>
        </div>
      )}

      {/* AI Patched Code Block */}
      {codeResult.corrected_code && (
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
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {t.codeAiPatched}
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

          {codeResult.ai_explanation && (
            <p style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {codeResult.ai_explanation}
            </p>
          )}

          <pre style={{
            padding: '14px',
            overflowX: 'auto',
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: '#e2e8f0',
            background: '#04060a',
          }}>
            <code>{codeResult.corrected_code}</code>
          </pre>
        </div>
      )}

    </div>
  )
}
