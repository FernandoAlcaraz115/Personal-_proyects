import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  ShieldCheck
} from 'lucide-react';

export default function AnalyticsView({ reports = [], categories = [] }) {
  const total = reports.length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;

  // Breakdown by category
  const categoryStats = categories.map(cat => {
    const catReports = reports.filter(r => r.categoryId === cat.id);
    const catResolved = catReports.filter(r => r.status === 'resolved').length;
    const percentage = total > 0 ? Math.round((catReports.length / total) * 100) : 0;
    return {
      ...cat,
      count: catReports.length,
      resolved: catResolved,
      percentage
    };
  }).sort((a, b) => b.count - a.count);

  // Breakdown by neighborhood
  const neighborhoods = {};
  reports.forEach(r => {
    const n = r.neighborhood || 'Otras Zonas';
    neighborhoods[n] = (neighborhoods[n] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
          Métricas de Desempeño e Impacto Urbano
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Auditoría de cumplimiento de SLA, tiempo de respuesta y distribución de recursos municipales
        </p>
      </div>

      {/* Top Highlight Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '8px' }}>
            <Award size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Cumplimiento de SLA</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            91.4%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            De los reportes atendidos antes de su tiempo límite legal estipulado.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', marginBottom: '8px' }}>
            <Clock size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Tiempo Medio de Atención</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            18.5 hrs
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Desde que el ciudadano envía la foto hasta el inicio de obra.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', marginBottom: '8px' }}>
            <ShieldCheck size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Duplicados Prevenidos</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            114 tickets
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ahorrados gracias al algoritmo de detección por radio GPS en la app móvil.
          </p>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '20px'
      }}>
        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Distribución de Incidencias por Tipo de Infraestructura
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryStats.map((item) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <strong>{item.count}</strong> reportes ({item.percentage}%)
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '10px',
                  borderRadius: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: '5px',
                    transition: 'width 0.6s ease-in-out'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Neighborhood Distribution */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.7)' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Demanda por Colonia / Sector
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(neighborhoods).map(([colonia, count]) => (
              <div
                key={colonia}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {colonia}
                </span>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}>
                  {count} {count === 1 ? 'incidencia' : 'incidencias'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
