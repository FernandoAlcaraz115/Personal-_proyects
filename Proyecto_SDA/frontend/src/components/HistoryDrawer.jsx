import React from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  History, 
  Trash2, 
  ArrowUpRight, 
  Scale, 
  X, 
  FileText, 
  Code, 
  Calculator, 
  Clock,
  Inbox
} from 'lucide-react'

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
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es

  if (!isHistoryOpen) return null

  const handleSendToCompare = (item) => {
    setCompareItemA(item)
    setIsCompareOpen(true)
    setIsHistoryOpen(false)
  }

  const getRiskColor = (risk) => {
    if (risk === 'low') return 'var(--status-success-text)'
    if (risk === 'medium') return 'var(--status-warn-text)'
    return 'var(--status-error-text)'
  }

  const getModeIcon = (mode) => {
    if (mode === 'code') return <Code size={13} />
    if (mode === 'math') return <Calculator size={13} />
    return <FileText size={13} />
  }

  return (
    <div
      onClick={() => setIsHistoryOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100vh',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-subtle)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={16} color="var(--brand-text)" />
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {t.historyTitle}
              </h2>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {t.historySubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'var(--status-error-bg)',
                  border: '1px solid var(--status-error-border)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--status-error-text)',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Trash2 size={11} />
                <span>{t.historyClearAll}</span>
              </button>
            )}
            <button
              onClick={() => setIsHistoryOpen(false)}
              style={{
                color: 'var(--text-tertiary)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* History List Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {history.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60%',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              gap: 8,
            }}>
              <Inbox size={32} strokeWidth={1.5} color="var(--text-muted)" />
              <p style={{ fontSize: '13px', maxWidth: 260, lineHeight: 1.5 }}>
                {t.historyEmpty}
              </p>
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
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderLeft: `3px solid ${riskColor}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--brand-text)' }}>
                        {getModeIcon(item.mode)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-primary)',
                      }}>
                        {item.mode}
                      </span>
                      {item.model && (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          · {item.model}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: riskColor,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {Math.round(item.overall_score * 100)}%
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontFamily: item.mode === 'code' ? 'var(--font-mono)' : 'inherit',
                  }}>
                    {item.original_text}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 6,
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 8,
                  }}>
                    <button
                      onClick={() => handleSendToCompare(item)}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Scale size={11} />
                      <span>Comparar</span>
                    </button>

                    <button
                      onClick={() => loadFromHistory(item)}
                      style={{
                        background: 'var(--brand-subtle)',
                        border: '1px solid var(--brand-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--brand-text)',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ArrowUpRight size={11} />
                      <span>{t.historyLoad}</span>
                    </button>

                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      style={{
                        color: 'var(--text-muted)',
                        padding: '3px 6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={t.historyDelete}
                    >
                      <Trash2 size={12} />
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
