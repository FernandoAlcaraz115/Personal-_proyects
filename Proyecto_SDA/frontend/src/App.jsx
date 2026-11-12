import React, { useState, useEffect } from 'react'
import useAnalysisStore from './store/useAnalysisStore'
import { translations } from './i18n'
import TextInput from './components/TextInput'
import ResultPanel from './components/ResultPanel'
import HistoryDrawer from './components/HistoryDrawer'
import CompareModal from './components/CompareModal'
import CommandPalette from './components/CommandPalette'
import BenchmarkModal from './components/BenchmarkModal'
import { 
  ShieldCheck, 
  FileText, 
  Code2, 
  Calculator, 
  History, 
  Scale, 
  Languages, 
  HelpCircle,
  Command,
  Search,
  CheckCircle2,
  Terminal,
  X,
  Activity
} from 'lucide-react'

export default function App() {
  const { 
    language, 
    setLanguage, 
    mode, 
    setMode, 
    history, 
    setIsHistoryOpen, 
    setIsCompareOpen,
    isBenchmarkOpen,
    setIsBenchmarkOpen 
  } = useAnalysisStore()
  const t = translations[language] ?? translations.es
  const [showHow, setShowHow] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const modesConfig = [
    { 
      id: 'text', 
      label: t.modeText, 
      Icon: FileText, 
      desc: t.modeTextDesc, 
      tag: 'Factual NLP' 
    },
    { 
      id: 'code', 
      label: t.modeCode, 
      Icon: Code2, 
      desc: t.modeCodeDesc, 
      tag: 'Python AST' 
    },
    { 
      id: 'math', 
      label: t.modeMath, 
      Icon: Calculator, 
      desc: t.modeMathDesc, 
      tag: 'SymPy Logic' 
    },
  ]

  const activeModeInfo = modesConfig.find(m => m.id === mode) ?? modesConfig[0]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-desktop)',
      position: 'relative',
    }}>

      {/* macOS Raycast-Style Floating Main Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 11, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-hairline)',
        height: '52px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* macOS Window Controls + App Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Traffic Light Dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.85 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingLeft: 6,
          }}>
            <ShieldCheck size={16} color="var(--text-main)" strokeWidth={2.2} />
            <span style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
            }}>
              Attestly
            </span>
            <span style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1px 5px',
              borderRadius: '4px',
            }}>
              v2.1
            </span>
          </div>
        </div>

        {/* Center Engine Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '7px',
          padding: '2px',
          gap: 2,
        }}>
          {modesConfig.map(m => {
            const isActive = mode === m.id
            const IconCmp = m.Icon
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                <IconCmp size={13} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Tools & Raycast Command Search Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '11.5px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.borderColor = 'var(--border-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
            }}
          >
            <Search size={12} />
            <span>Comandos</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </div>
          </button>

          {/* Audit History */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <History size={13} />
            <span>{t.navHistory}</span>
            {history.length > 0 && (
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0 5px',
                fontFamily: 'var(--font-mono)',
              }}>
                {history.length}
              </span>
            )}
          </button>

          {/* Model Comparator */}
          <button
            onClick={() => setIsCompareOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Scale size={13} />
            <span>{t.navCompare}</span>
          </button>

          {/* Benchmark Suite */}
          <button
            onClick={() => setIsBenchmarkOpen(true)}
            title="Abrir panel de benchmarks y evaluación de métricas"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Activity size={13} />
            <span>Benchmark</span>
          </button>

          {/* Language */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              background: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <Languages size={12} />
            <span>{language === 'es' ? 'ES' : 'EN'}</span>
          </button>

          {/* Architecture / How it works */}
          <button
            onClick={() => setShowHow(true)}
            style={{
              color: 'var(--text-tertiary)',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            title={t.navHowItWorks}
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      {/* Floating Workstation Window Container */}
      <main style={{
        flex: 1,
        maxWidth: 1380,
        width: '100%',
        margin: '0 auto',
        padding: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>

        {/* Workstation Top Breadcrumb / Status Line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Estación de Trabajo
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {activeModeInfo.desc}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-success)' }} />
              Motor Activo
            </span>
            <span>·</span>
            <span>{activeModeInfo.tag}</span>
          </div>
        </div>

        {/* Two Floating macOS Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.15fr)',
          gap: '20px',
          alignItems: 'start',
        }}>

          {/* Left Panel: Input Surface */}
          <section className="raycast-window" style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border-hairline)',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {t.sectionInput}
              </span>

              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                Buffer de Análisis
              </span>
            </div>

            <TextInput />
          </section>

          {/* Right Panel: Diagnostic & Verification Surface */}
          <section className="raycast-window" style={{ padding: '20px', minHeight: 520 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border-hairline)',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {t.sectionAnalysis}
              </span>

              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                Certificación y Auditoría
              </span>
            </div>

            <ResultPanel />
          </section>

        </div>

        {/* Desktop Bottom Statusbar (Raycast Footer) */}
        <div style={{
          marginTop: 'auto',
          padding: '8px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>Attestly Desktop Experience</span>
            <span>·</span>
            <span>Atajo global: <kbd>⌘</kbd> <kbd>K</kbd></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Ejecutar: <kbd>↵</kbd></span>
            <span>Historial: <kbd>H</kbd></span>
          </div>
        </div>

      </main>

      {/* Raycast Architecture Dialog */}
      {showHow && (
        <div
          onClick={() => setShowHow(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 350,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="raycast-window animate-pop"
            style={{
              maxWidth: 640,
              width: '100%',
              maxHeight: '86vh',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: '#121214',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="var(--text-main)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                  {t.howTitle}
                </h3>
              </div>
              <button onClick={() => setShowHow(false)} style={{ color: 'var(--text-tertiary)' }}>
                <X size={17} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.howIntro}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                {
                  title: '1. Dimensión Factual (NLP & Grounding)',
                  desc: 'Aísla afirmaciones factuales y contrasta solapamiento léxico contra Wikipedia y fuentes web en tiempo real sin requerir acceso a los pesos internos del LLM.',
                },
                {
                  title: '2. Dimensión de Código (AST & PyPI)',
                  desc: 'Inspecciona la estructura de código fuente, validando sintaxis formal y consultando el índice oficial de PyPI para detectar dependencias inventadas o métodos inexistentes.',
                },
                {
                  title: '3. Dimensión Matemática (SymPy Symbolic)',
                  desc: 'Evalúa formalmente si LHS - RHS = 0 con álgebra simbólica exacta en SymPy, detectando alucinaciones aritméticas y pasos de deducción inválidos.',
                },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={() => setShowHow(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {t.howClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Drawers & Modals */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <HistoryDrawer />
      <CompareModal />
      <BenchmarkModal isOpen={isBenchmarkOpen} onClose={() => setIsBenchmarkOpen(false)} />

    </div>
  )
}
