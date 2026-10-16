import React from 'react';
import { 
  Users, 
  Wrench, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function CrewsView({ crews = [], reports = [], onSelectIncident }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Cuadrillas y Técnicos Municipales
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Supervisión del estado operativo y asignación de brigadas de obras públicas
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: '#34d399',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="pulse-dot" />
            {crews.filter(c => c.status === 'available').length} Disponibles para Despacho
          </div>
        </div>
      </div>

      {/* Grid of Crew Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {crews.map((crew) => {
          const assignedReports = reports.filter(r => r.assignedCrewId === crew.id && r.status !== 'resolved');
          const isAvailable = crew.status === 'available';

          return (
            <div
              key={crew.id}
              className="glass-panel"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'rgba(15, 23, 42, 0.65)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {crew.name}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#60a5fa', fontWeight: 600 }}>
                    {crew.department}
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isAvailable ? '#34d399' : '#fbbf24',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {isAvailable ? 'Disponible' : 'En Obra'}
                </span>
              </div>

              {/* Technician Info */}
              <div style={{
                background: 'rgba(10, 14, 23, 0.5)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  Jefe de brigada: <strong style={{ color: '#ffffff' }}>{crew.leadTechnician}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                  <Phone size={13} color="#38bdf8" />
                  <span>{crew.phone}</span>
                </div>
              </div>

              {/* Active Tasks List */}
              <div>
                <div style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: 'var(--text-dim)', 
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Incidencias asignadas activas</span>
                  <span style={{ color: '#ffffff' }}>{assignedReports.length}</span>
                </div>

                {assignedReports.length === 0 ? (
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                    color: 'var(--text-dim)',
                    fontSize: '0.75rem'
                  }}>
                    Sin reportes en curso actualmente
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {assignedReports.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => onSelectIncident(rep)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <span style={{ color: '#93c5fd', fontWeight: 600 }}>{rep.ticketNumber}</span>
                          <span style={{ color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                            {rep.title}
                          </span>
                        </div>
                        <span className={`badge badge-${rep.status}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          {rep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
