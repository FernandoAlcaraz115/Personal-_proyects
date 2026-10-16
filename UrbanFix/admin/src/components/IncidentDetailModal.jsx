import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  ThumbsUp, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function IncidentDetailModal({ 
  report, 
  categories = [], 
  crews = [], 
  onClose,
  onStatusChange,
  onAssignCrew 
}) {
  if (!report) return null;

  const category = categories.find(c => c.id === report.categoryId) || { name: 'General', color: '#3b82f6' };
  const assignedCrew = crews.find(c => c.id === report.assignedCrewId);

  const [selectedCrewId, setSelectedCrewId] = useState(report.assignedCrewId || '');
  const [resolutionNote, setResolutionNote] = useState(report.resolutionNotes || '');
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'timeline'

  const statuses = [
    { id: 'pending', label: 'Pendiente' },
    { id: 'in_review', label: 'En Revisión' },
    { id: 'assigned', label: 'Asignado' },
    { id: 'in_progress', label: 'En Obra' },
    { id: 'resolved', label: 'Resuelto' }
  ];

  const handleCrewAssignment = (e) => {
    e.preventDefault();
    onAssignCrew(report.id, selectedCrewId || null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 15, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)',
          animation: 'modal-fade 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: `${category.color}22`,
              color: category.color,
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ● {category.name}
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>|</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>
              {report.ticketNumber}
            </span>
            <span className={`badge badge-${report.status}`}>
              {report.status.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Title & Urgency */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {report.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="#60a5fa" />
                  {report.address} ({report.neighborhood})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} />
                  {new Date(report.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#c084fc',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <ThumbsUp size={16} />
              <span>{report.upvotesCount || 1} Ciudadanos Afectados</span>
            </div>
          </div>

          {/* Photos Grid: Report photo vs Resolution photo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: report.resolutionPhotoUrl ? '1fr 1fr' : '1fr',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                FOTO CAPTURADA POR EL CIUDADANO (CON GPS)
              </div>
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                height: '240px',
                background: '#070a12',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
              }}>
                <img 
                  src={report.photoUrl} 
                  alt="Foto de la incidencia" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: '#94a3b8'
                }}>
                  Lat: {report.latitude.toFixed(6)} | Lon: {report.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            {report.resolutionPhotoUrl && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>
                  EVIDENCIA DE REPARACIÓN (OBRA CONCLUIDA)
                </div>
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  height: '240px',
                  background: '#070a12',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <img 
                    src={report.resolutionPhotoUrl} 
                    alt="Evidencia de reparación" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Descripción detallada del reporte
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {report.description}
            </p>
          </div>

          {/* Dispatch & Operations Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {/* Status Selector */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px' }}>
                Cambiar Fase de Estado
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {statuses.map(st => (
                  <button
                    key={st.id}
                    onClick={() => onStatusChange(report.id, st.id)}
                    className="btn btn-sm"
                    style={{
                      background: report.status === st.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                      color: report.status === st.id ? '#ffffff' : 'var(--text-muted)',
                      border: report.status === st.id ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crew Assign Form */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px' }}>
                Asignación de Cuadrilla
              </h4>
              <form onSubmit={handleCrewAssignment} style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedCrewId}
                  onChange={(e) => setSelectedCrewId(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#0a0e17',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.82rem'
                  }}
                >
                  <option value="">Sin cuadrilla asignada</option>
                  {crews.map(cr => (
                    <option key={cr.id} value={cr.id}>
                      {cr.name} ({cr.status === 'available' ? 'Disponible' : `${cr.activeTasks} activas`})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                  Asignar
                </button>
              </form>
            </div>
          </div>

          {/* Citizen & Contact Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'rgba(10, 14, 23, 0.4)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} color="#60a5fa" />
              <span>Reportado por: <strong style={{ color: '#ffffff' }}>{report.citizenName}</strong></span>
            </div>
            {report.citizenPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#34d399" />
                <span>Contacto: <strong style={{ color: '#ffffff' }}>{report.citizenPhone}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
