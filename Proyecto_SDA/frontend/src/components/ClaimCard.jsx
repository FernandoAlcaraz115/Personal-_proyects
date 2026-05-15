import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

const RISK = {
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.2)'  },
  medium: { color: '#f97316', bg: 'rgba(249,115,22,.08)', border: 'rgba(249,115,22,.2)' },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,.08)',  border: 'rgba(239,68,68,.2)'  },
}

export default function ClaimCard({ claim, index }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const { color, border } = RISK[claim.risk_level] ?? RISK.medium

  return (
    <div style={{
      background: '#111', border: `1px solid ${border}`,
      borderLeft: `3px solid ${color}`, borderRadius: 8,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.55, flex: 1 }}>
          <span style={{ color: '#333', fontSize: 12, marginRight: 6 }}>#{index + 1}</span>
          {claim.text}
        </p>
        <span style={{
          background: `${color}18`, color, border: `1px solid ${color}44`,
          borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {Math.round(claim.confidence * 100)}%
        </span>
      </div>

      {/* Linguistic explanation */}
      <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic', lineHeight: 1.5 }}>
        {claim.explanation}
      </p>

      {/* Linguistic tags */}
      {(claim.l1.hedge_phrases.length > 0 || claim.l1.vague_phrases.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {claim.l1.hedge_phrases.map(p => <Tag key={p} label={p} color="#f97316" />)}
          {claim.l1.vague_phrases.map(p => <Tag key={p} label={p} color="#555" />)}
        </div>
      )}

      {/* Wikipedia / web snippet */}
      {claim.l2 && (
        <div style={{
          fontSize: 12, color: '#444',
          borderTop: '1px solid #1e1e1e', paddingTop: 8, lineHeight: 1.5,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <strong style={{ color: '#555' }}>{claim.l2.source}</strong>
            {claim.l2.source_url && (
              <a
                href={claim.l2.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
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
        <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13 }}>{claim.l4.is_hallucination ? '⚠️' : '✅'}</span>
            <strong style={{
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em',
              color: claim.l4.is_hallucination ? '#ef4444' : '#22c55e',
            }}>
              {claim.l4.is_hallucination ? t.halluDetected : t.claimAccurate}
            </strong>
          </div>

          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
            {claim.l4.explanation}
          </p>

          {claim.l4.is_hallucination && claim.l4.corrected_claim.trim() !== claim.text.trim() && (
            <div style={{
              background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)',
              borderRadius: 6, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>
                {t.correctedLabel}
              </p>
              <p style={{ fontSize: 13, color: '#d4d4d4', lineHeight: 1.5 }}>
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
    }}>
      {label}
    </span>
  )
}
