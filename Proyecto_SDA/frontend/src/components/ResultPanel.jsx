import useAnalysisStore from '../store/useAnalysisStore'
import ScoreGauge from './ScoreGauge'
import ClaimCard from './ClaimCard'

export default function ResultPanel() {
  const { result, error, loading } = useAnalysisStore()

  if (loading) return (
    <div style={centerStyle}>
      <Spinner />
      <p style={{ color: '#555', fontSize: 13 }}>Running analysis pipeline…</p>
    </div>
  )

  if (error) return (
    <div style={{
      border: '1px solid rgba(239,68,68,.25)',
      background: 'rgba(239,68,68,.06)',
      borderRadius: 8,
      padding: '14px 16px',
    }}>
      <strong style={{ color: '#ef4444', fontSize: 13 }}>Error</strong>
      <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{error}</p>
    </div>
  )

  if (!result) return (
    <div style={centerStyle}>
      <span style={{ fontSize: 36, filter: 'grayscale(1) opacity(.3)' }}>🔍</span>
      <p style={{ color: '#333', fontSize: 13 }}>Results will appear here after analysis.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Summary card */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1e1e1e',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <ScoreGauge score={result.overall_score} />

        <div style={{ flex: 1, minWidth: 160 }}>
          <Label>Method</Label>
          <p style={{ fontSize: 12, color: '#555', fontFamily: 'monospace', marginBottom: 12 }}>
            {result.method_used}
          </p>
          <Label>Claims found</Label>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f0' }}>
            {result.claims.length}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#333' }}>{result.processing_time_ms} ms</p>
          <p style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'monospace', marginTop: 4 }}>
            {result.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Claims list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#333',
          textTransform: 'uppercase', letterSpacing: '.1em',
        }}>
          Claim-by-claim breakdown
        </p>
        {result.claims.map((claim, i) => (
          <ClaimCard key={i} claim={claim} index={i} />
        ))}
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

function Spinner() {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36">
      <circle cx={18} cy={18} r={14} fill="none" stroke="#1e1e1e" strokeWidth={4} />
      <circle
        cx={18} cy={18} r={14}
        fill="none"
        stroke="#dc2626"
        strokeWidth={4}
        strokeDasharray="60 28"
        strokeLinecap="round"
        style={{ transformOrigin: '18px 18px', animation: 'spin .9s linear infinite' }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}
