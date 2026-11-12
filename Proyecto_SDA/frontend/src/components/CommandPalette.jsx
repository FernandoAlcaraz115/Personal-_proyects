import React, { useState, useEffect } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import { 
  Search, 
  FileText, 
  Code2, 
  Calculator, 
  History, 
  Scale, 
  Globe, 
  Sparkles, 
  Play, 
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

export default function CommandPalette({ isOpen, onClose }) {
  const { 
    setMode, 
    language, 
    setLanguage, 
    analyze, 
    reset, 
    setIsHistoryOpen, 
    setIsCompareOpen,
    useExternal,
    setUseExternal,
    useCorrection,
    setUseCorrection,
    loading
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const commands = [
    {
      id: 'analyze',
      category: 'Acción Principal',
      title: 'Ejecutar Auditoría Formal',
      subtitle: 'Comprobar alucinaciones en el texto activo',
      shortcut: '↵',
      icon: Play,
      action: () => {
        analyze()
        onClose()
      },
    },
    {
      id: 'mode-text',
      category: 'Cambiar Motor',
      title: 'Motor Fáctico',
      subtitle: 'Auditoría de afirmaciones y grounding con Wikipedia',
      shortcut: '1',
      icon: FileText,
      action: () => {
        setMode('text')
        onClose()
      },
    },
    {
      id: 'mode-code',
      category: 'Cambiar Motor',
      title: 'Motor de Código Fuente',
      subtitle: 'Inspección de AST y verificación en PyPI',
      shortcut: '2',
      icon: Code2,
      action: () => {
        setMode('code')
        onClose()
      },
    },
    {
      id: 'mode-math',
      category: 'Cambiar Motor',
      title: 'Motor Matemático',
      subtitle: 'Verificación formal y simbólica con SymPy',
      shortcut: '3',
      icon: Calculator,
      action: () => {
        setMode('math')
        onClose()
      },
    },
    {
      id: 'toggle-external',
      category: 'Parámetros',
      title: `${useExternal ? 'Desactivar' : 'Activar'} Grounding Externo / PyPI`,
      subtitle: 'Contrastar contra fuentes en línea y registro oficial',
      shortcut: 'G',
      icon: Globe,
      action: () => {
        setUseExternal(!useExternal)
        onClose()
      },
    },
    {
      id: 'toggle-correction',
      category: 'Parámetros',
      title: `${useCorrection ? 'Desactivar' : 'Activar'} Corrección con IA`,
      subtitle: 'Solicitar parche y explicación al modelo',
      shortcut: 'C',
      icon: Sparkles,
      action: () => {
        setUseCorrection(!useCorrection)
        onClose()
      },
    },
    {
      id: 'history',
      category: 'Vistas',
      title: 'Abrir Historial de Análisis',
      subtitle: 'Examinar registros previos guardados localmente',
      shortcut: 'H',
      icon: History,
      action: () => {
        setIsHistoryOpen(true)
        onClose()
      },
    },
    {
      id: 'compare',
      category: 'Vistas',
      title: 'Abrir Comparador de Modelos',
      subtitle: 'Contrastar dos análisis lado a lado',
      shortcut: 'M',
      icon: Scale,
      action: () => {
        setIsCompareOpen(true)
        onClose()
      },
    },
    {
      id: 'lang',
      category: 'Sistema',
      title: language === 'es' ? 'Switch Language to English' : 'Cambiar Idioma a Español',
      subtitle: 'Alternar entre ES y EN',
      shortcut: 'L',
      icon: Globe,
      action: () => {
        setLanguage(language === 'es' ? 'en' : 'es')
        onClose()
      },
    },
    {
      id: 'reset',
      category: 'Acción',
      title: 'Limpiar Resultados Actuales',
      subtitle: 'Restablecer el panel de diagnóstico',
      shortcut: 'R',
      icon: RotateCcw,
      action: () => {
        reset()
        onClose()
      },
    },
  ]

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="raycast-window animate-pop"
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#121214',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-hairline)',
        }}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comando o busca acciones en Attestly…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <kbd style={{ fontSize: '10px' }}>ESC</kbd>
        </div>

        {/* Action List */}
        <div style={{
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
            }}>
              No se encontraron comandos para «{query}»
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex
              const CmdIcon = cmd.icon

              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <CmdIcon size={15} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isSelected ? '#ffffff' : 'var(--text-main)',
                      }}>
                        {cmd.title}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: isSelected ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      }}>
                        {cmd.subtitle}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {cmd.category}
                    </span>
                    <kbd>{cmd.shortcut}</kbd>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer info bar */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border-hairline)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
        }}>
          <span>Navegar con <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Ejecutar con <kbd>↵</kbd></span>
        </div>
      </div>
    </div>
  )
}

