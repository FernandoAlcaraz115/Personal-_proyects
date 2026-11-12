import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

export default function HistoryDrawer() {
  const {
    history,
    isHistoryOpen,
    setIsHistoryOpen,
    loadFromHistory,
    deleteHistoryItem,
    clearHistory,
    language,
    setIsCompareOpen,
    setCompareItemA,
    setCompareItemB,
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es

  if (!isHistoryOpen) return null

  const handleSendToCompare = (item) => {
    setCompareItemA(item)
    setIsCompareOpen(true)
    setIsHistoryOpen(false)
  }

  const getRiskColor = (risk) => {
    if (risk === 'low') return '#10b981'
    if (risk === 'medium') return '#f59e0b'
    return '#f43f5e'
  }

  const getModeIcon = (mode) => {
    if (mode === 'code') return '💻'
    if (mode === 'math') return '🧮'
    return '🌐'
  }

  return (
    <div
      onClick={() => setIsHistoryOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100vh',
          background: '#090d15',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>📜</span>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {t.historyTitle}
              </h2>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {t.historySubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.25)',
                  borderRadius: 6,
                  color: '#f43f5e',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.historyClearAll}
              </button>
            )}
            <button
              onClick={() => setIsHistoryOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 20,
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60%',
                color: '#64748b',
                textAlign: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 36, opacity: 0.4 }}>📭</span>
              <p style={{ fontSize: 13, maxWidth: 260 }}>{t.historyEmpty}</p>
            </div>
          ) : (
            history.map((item) => {
              const riskColor = getRiskColor(item.risk_level)
              const dateStr = item.timestamp
                ? new Date(item.timestamp).toLocaleString(language === 'es' ? 'es-MX' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Reciente'

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#0d121c',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${riskColor}`,
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'border-color 0.2s ease, transform 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{getModeIcon(item.mode)}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.06em',
                          color: '#38bdf8',
                          background: 'rgba(56,189,248,0.1)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.mode}
                      </span>
                      {item.model && (
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {item.model}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: riskColor,
                          background: `${riskColor}15`,
                          border: `1px solid ${riskColor}40`,
                          borderRadius: 12,
                          padding: '2px 8px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {Math.round(item.overall_score * 100)}%
                      </span>
                      <span style={{ fontSize: 10, color: '#475569' }}>{dateStr}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: '#cbd5e1',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: item.mode === 'code' ? 'var(--font-mono)' : 'inherit',
                    }}
                  >
                    {item.original_text}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 6,
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      paddingTop: 8,
                      marginTop: 2,
                    }}
                  >
                    <button
                      onClick={() => handleSendToCompare(item)}
                      style={{
                        background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: 5,
                        color: '#c084fc',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      ⚖️ Comparar
                    </button>
                    <button
                      onClick={() => loadFromHistory(item)}
                      style={{
                        background: 'rgba(56,189,248,0.1)',
                        border: '1px solid rgba(56,189,248,0.25)',
                        borderRadius: 5,
                        color: '#38bdf8',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      {t.historyLoad}
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                      title={t.historyDelete}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

