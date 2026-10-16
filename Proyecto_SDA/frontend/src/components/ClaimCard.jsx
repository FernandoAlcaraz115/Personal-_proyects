import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

const RISK = {
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.25)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)' },
  high:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.35)'  },
}

export default function ClaimCard({ claim, index }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const { color, border, bg } = RISK[claim.risk_level] ?? RISK.medium

  return (
    <div style={{
      background: '#0d111a', border: `1px solid ${border}`,
      borderLeft: `3px solid ${color}`, borderRadius: 10,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform .15s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#f8fafc', lineHeight: 1.55, flex: 1 }}>
          <span style={{ color: '#475569', fontSize: 12, marginRight: 6, fontFamily: 'var(--font-mono)' }}>
            #{index + 1}
          </span>
          {claim.text}
        </p>
        <span style={{
          background: `${color}18`, color, border: `1px solid ${color}44`,
          borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)',
        }}>
          {Math.round(claim.confidence * 100)}%
        </span>
      </div>

      {/* Linguistic explanation */}
      <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5 }}>
        {claim.explanation}
      </p>

      {/* Linguistic tags */}
      {(claim.l1.hedge_phrases.length > 0 || claim.l1.vague_phrases.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {claim.l1.hedge_phrases.map(p => <Tag key={p} label={p} color="#f59e0b" />)}
          {claim.l1.vague_phrases.map(p => <Tag key={p} label={p} color="#64748b" />)}
        </div>
      )}

      {/* Wikipedia / web snippet */}
      {claim.l2 && (
        <div style={{
          fontSize: 12, color: '#94a3b8',
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, lineHeight: 1.5,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <strong style={{ color: '#38bdf8' }}>{claim.l2.source}</strong>
            {claim.l2.source_url && (
              <a
                href={claim.l2.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                {t.wikiLink}
              </a>
            )}
          </div>
          {claim.l2.snippet}
        </div>
      )}

      {/* Layer 4 — AI correction */}
      {claim.l4 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>{claim.l4.is_hallucination ? '⚠️' : '✅'}</span>
            <strong style={{
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em',
              color: claim.l4.is_hallucination ? '#f43f5e' : '#10b981',
            }}>
              {claim.l4.is_hallucination ? t.halluDetected : t.claimAccurate}
            </strong>
          </div>

          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
            {claim.l4.explanation}
          </p>

          {claim.l4.is_hallucination && claim.l4.corrected_claim.trim() !== claim.text.trim() && (
            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 6, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>
                {t.correctedLabel}
              </p>
              <p style={{ fontSize: 13, color: '#f8fafc', lineHeight: 1.5 }}>
                {claim.l4.corrected_claim}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span style={{
      background: `${color}14`, color, border: `1px solid ${color}33`,
      borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 500,
      fontFamily: 'var(--font-mono)',
    }}>
      {label}
    </span>
  )
}
