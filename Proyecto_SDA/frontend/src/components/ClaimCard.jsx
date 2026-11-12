import React, { useState } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  FileText, 
  Code, 
  Binary, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react'

export default function ClaimCard({ claim, index }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es

  // Semantic border & badge according to risk
  const isHighRisk = claim.risk_level === 'high'
  const isMedRisk = claim.risk_level === 'medium'

  const borderAccent = isHighRisk 
    ? 'var(--status-error-border)' 
    : isMedRisk 
    ? 'var(--status-warn-border)' 
    : 'var(--status-success-border)'

  const statusColor = isHighRisk 
    ? 'var(--status-error-text)' 
    : isMedRisk 
    ? 'var(--status-warn-text)' 
    : 'var(--status-success-text)'

  const statusBg = isHighRisk 
    ? 'var(--status-error-bg)' 
    : isMedRisk 
    ? 'var(--status-warn-bg)' 
    : 'var(--status-success-bg)'

  const StatusIcon = isHighRisk ? XCircle : isMedRisk ? AlertTriangle : CheckCircle2

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: `1px solid ${borderAccent}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      transition: 'border-color 0.15s ease, background 0.15s ease',
    }}>
      {/* Header Row: Claim Number + Text + Confidence Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            paddingTop: '2px',
          }}>
            #{String(index + 1).padStart(2, '0')}
          </span>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            lineHeight: 1.55,
            fontWeight: 500,
          }}>
            {claim.text}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: statusBg,
          border: `1px solid ${statusColor}33`,
          borderRadius: 'var(--radius-xs)',
          padding: '3px 8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <StatusIcon size={13} color={statusColor} />
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: statusColor,
            fontFamily: 'var(--font-mono)',
          }}>
            {Math.round(claim.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Scientific Explanation Summary */}
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        borderLeft: '2px solid var(--border-default)',
        paddingLeft: '10px',
      }}>
        {claim.explanation}
      </div>

      {/* Linguistic indicators if any */}
      {(claim.l1.hedge_phrases.length > 0 || claim.l1.vague_phrases.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Señales lingüísticas:
          </span>
          {claim.l1.hedge_phrases.map(phrase => (
            <span key={phrase} style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#fbbf24',
              borderRadius: 'var(--radius-xs)',
              padding: '1px 6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}>
              dubitativo: «{phrase}»
            </span>
          ))}
          {claim.l1.vague_phrases.map(phrase => (
            <span key={phrase} style={{
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-xs)',
              padding: '1px 6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}>
              vago: «{phrase}»
            </span>
          ))}
        </div>
      )}

      {/* External Evidence / Grounding Source */}
      {claim.l2 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--brand-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Fuente: {claim.l2.source}
            </span>
            {claim.l2.source_url && (
              <a
                href={claim.l2.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                }}
              >
                <span>{t.wikiLink}</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <p style={{ lineHeight: 1.5, color: 'var(--text-secondary)', fontStyle: 'normal' }}>
            «{claim.l2.snippet}»
          </p>
        </div>
      )}

      {/* Layer 4: AI Assisted Correction */}
      {claim.l4 && (
        <div style={{
          background: claim.l4.is_hallucination ? 'rgba(239, 68, 68, 0.04)' : 'rgba(16, 185, 129, 0.04)',
          border: `1px solid ${claim.l4.is_hallucination ? 'var(--status-error-border)' : 'var(--status-success-border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} color={claim.l4.is_hallucination ? '#f87171' : '#34d399'} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: claim.l4.is_hallucination ? '#f87171' : '#34d399',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {claim.l4.is_hallucination ? t.halluDetected : t.claimAccurate}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {claim.l4.explanation}
          </p>

          {claim.l4.is_hallucination && claim.l4.corrected_claim.trim() !== claim.text.trim() && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-xs)',
              padding: '8px 10px',
              marginTop: 4,
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--status-success-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: 3,
              }}>
                {t.correctedLabel}
              </span>
              <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {claim.l4.corrected_claim}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
