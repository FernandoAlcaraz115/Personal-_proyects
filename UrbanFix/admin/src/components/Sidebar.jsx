import React from 'react';
import { 
  Map, 
  KanbanSquare, 
  TableProperties, 
  BarChart3, 
  Users, 
  Layers,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  categories = [],
  selectedCategory,
  setSelectedCategory,
  reports = []
}) {
  const navItems = [
    { id: 'map', label: 'Mapa Operativo', icon: Map, badge: reports.filter(r => r.status !== 'resolved').length },
    { id: 'kanban', label: 'Tablero de Despacho', icon: KanbanSquare },
    { id: 'table', label: 'Incidencias & Filtros', icon: TableProperties, count: reports.length },
    { id: 'stats', label: 'Métricas & Impacto', icon: BarChart3 },
    { id: 'crews', label: 'Cuadrillas de Campo', icon: Users }
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      padding: '20px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'calc(100vh - 110px)',
      position: 'sticky',
      top: '90px'
    }}>
      {/* Navigation Links */}
      <div>
        <span style={{ 
          fontSize: '0.68rem', 
          fontWeight: 700, 
          color: 'var(--text-dim)', 
          letterSpacing: '0.08em', 
          textTransform: 'uppercase',
          padding: '0 12px',
          display: 'block',
          marginBottom: '10px'
        }}>
          Navegación
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Quick Filter */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 12px',
          marginBottom: '10px'
        }}>
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-dim)', 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase'
          }}>
            Categorías
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: selectedCategory === null ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: selectedCategory === null ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: selectedCategory === null ? 600 : 400
            }}
          >
            <span>Todas las categorías</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {reports.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const count = reports.filter(r => r.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isCatActive ? null : cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isCatActive ? `${cat.color}22` : 'transparent',
                  color: isCatActive ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: isCatActive ? 600 : 400,
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                    boxShadow: isCatActive ? `0 0 8px ${cat.color}` : 'none'
                  }} />
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '150px' 
                  }}>
                    {cat.name.split('/')[0].trim()}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Pill at bottom */}
      <div style={{
        background: 'rgba(10, 14, 23, 0.6)',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
          Tiempo Promedio de Respuesta
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>14.2</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>horas</span>
        </div>
        <div style={{ 
          fontSize: '0.68rem', 
          color: '#34d399', 
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ↓ 22% más rápido que el mes pasado
        </div>
      </div>
    </aside>
  );
}
