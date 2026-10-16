import React from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Wrench, 
  CheckCircle2, 
  UserCheck,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function KanbanBoard({ 
  reports = [], 
  categories = [], 
  crews = [],
  onSelectIncident,
  onStatusChange 
}) {
  const columns = [
    { id: 'pending', title: 'Recibidos', color: '#f59e0b', description: 'Nuevos reportes sin procesar' },
    { id: 'in_review', title: 'En Revisión', color: '#a855f7', description: 'Validación en C5' },
    { id: 'assigned', title: 'Asignados', color: '#3b82f6', description: 'Con cuadrilla asignada' },
    { id: 'in_progress', title: 'En Obra', color: '#06b6d4', description: 'Cuadrilla laborando en sitio' },
    { id: 'resolved', title: 'Resueltos', color: '#10b981', description: 'Verificados y concluidos' }
  ];

  const getCategory = (catId) => categories.find(c => c.id === catId) || { name: 'General', color: '#3b82f6' };
  const getCrew = (crewId) => crews.find(c => c.id === crewId);

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'in_review';
      case 'in_review': return 'assigned';
      case 'assigned': return 'in_progress';
      case 'in_progress': return 'resolved';
      default: return null;
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
      gap: '16px',
      overflowX: 'auto',
      paddingBottom: '20px'
    }}>
      {columns.map((col) => {
        const columnReports = reports.filter(r => r.status === col.id);

        return (
          <div
            key={col.id}
            className="glass-panel"
            style={{
              padding: '16px',
              minHeight: '620px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(15, 23, 42, 0.6)',
              borderTop: `3px solid ${col.color}`
            }}
          >
            {/* Column Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    {col.title}
                  </h3>
                  <span style={{
                    background: `${col.color}22`,
                    color: col.color,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {columnReports.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {col.description}
                </div>
              </div>
            </div>

            {/* Column Cards */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
              overflowY: 'auto'
            }}>
              {columnReports.length === 0 ? (
                <div style={{
                  padding: '30px 10px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px'
                }}>
                  Sin incidencias en esta fase
                </div>
              ) : (
                columnReports.map((report) => {
                  const category = getCategory(report.categoryId);
                  const crew = getCrew(report.assignedCrewId);
                  const nextStatus = getNextStatus(report.status);

                  return (
                    <div
                      key={report.id}
                      style={{
                        background: 'rgba(10, 14, 23, 0.85)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'none';
                      }}
                      onClick={() => onSelectIncident(report)}
                    >
                      {/* Top tags */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: category.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ● {category.name.split('/')[0]}
                        </span>
                        <span className={`badge badge-${report.priority}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          {report.priority}
                        </span>
                      </div>

                      {/* Image Thumbnail if exists */}
                      {report.photoUrl && (
                        <div style={{
                          width: '100%',
                          height: '90px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          marginBottom: '8px'
                        }}>
                          <img 
                            src={report.photoUrl} 
                            alt={report.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      {/* Title & Ticket */}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '2px' }}>
                        {report.ticketNumber}
                      </div>
                      <h4 style={{ 
                        fontSize: '0.84rem', 
                        fontWeight: 600, 
                        color: '#f1f5f9', 
                        lineHeight: '1.3',
                        marginBottom: '8px' 
                      }}>
                        {report.title}
                      </h4>

                      {/* Address */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.72rem',
                        marginBottom: '10px'
                      }}>
                        <MapPin size={12} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {report.neighborhood || report.address}
                        </span>
                      </div>

                      {/* Assigned crew indicator */}
                      {crew && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          color: '#93c5fd',
                          marginBottom: '8px'
                        }}>
                          <Wrench size={11} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {crew.name}
                          </span>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectIncident(report)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                        >
                          <Eye size={12} />
                          <span>Ver</span>
                        </button>

                        {nextStatus && (
                          <button
                            onClick={() => onStatusChange(report.id, nextStatus)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '4px 8px', gap: '4px' }}
                          >
                            <span>Avanzar</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
