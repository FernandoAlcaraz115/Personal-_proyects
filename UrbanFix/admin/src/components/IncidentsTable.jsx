import React, { useState } from 'react';
import { 
  Eye, 
  MapPin, 
  Clock, 
  Filter, 
  ThumbsUp, 
  Wrench, 
  Search,
  ArrowUpDown
} from 'lucide-react';

export default function IncidentsTable({ 
  reports = [], 
  categories = [], 
  crews = [], 
  onSelectIncident 
}) {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const getCategory = (catId) => categories.find(c => c.id === catId) || { name: 'General', color: '#3b82f6' };
  const getCrew = (crewId) => crews.find(c => c.id === crewId);

  // Filter logic
  const filteredReports = reports.filter(r => {
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    }
    if (sortField === 'upvotes') {
      return sortAsc ? a.upvotesCount - b.upvotesCount : b.upvotesCount - a.upvotesCount;
    }
    return 0;
  });

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(10, 14, 23, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem'
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_review">En Revisión</option>
            <option value="assigned">Asignados</option>
            <option value="in_progress">En Obra</option>
            <option value="resolved">Resueltos</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              background: 'rgba(10, 14, 23, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem'
            }}
          >
            <option value="all">Todas las prioridades</option>
            <option value="critical">Crítica / Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Sort and Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              if (sortField === 'createdAt') setSortAsc(!sortAsc);
              else { setSortField('createdAt'); setSortAsc(false); }
            }}
            className="btn btn-secondary btn-sm"
          >
            <ArrowUpDown size={13} />
            <span>Fecha {sortField === 'createdAt' ? (sortAsc ? '↑' : '↓') : ''}</span>
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{filteredReports.length}</strong> de {reports.length} incidencias
          </span>
        </div>
      </div>

      {/* Table Component */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 14px' }}>Ticket</th>
              <th style={{ padding: '12px 14px' }}>Incidencia</th>
              <th style={{ padding: '12px 14px' }}>Categoría</th>
              <th style={{ padding: '12px 14px' }}>Estado</th>
              <th style={{ padding: '12px 14px' }}>Prioridad</th>
              <th style={{ padding: '12px 14px' }}>Cuadrilla</th>
              <th style={{ padding: '12px 14px' }}>Apoyos</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No se encontraron incidencias con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const category = getCategory(report.categoryId);
                const crew = getCrew(report.assignedCrewId);

                return (
                  <tr
                    key={report.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Ticket */}
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9' }}>
                      {report.ticketNumber}
                    </td>

                    {/* Title & Address */}
                    <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} color="#60a5fa" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {report.address}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        color: category.color,
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ● {category.name.split('/')[0]}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge badge-${report.status}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge badge-${report.priority}`}>
                        {report.priority}
                      </span>
                    </td>

                    {/* Crew */}
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: crew ? '#93c5fd' : 'var(--text-dim)' }}>
                      {crew ? crew.name : 'Sin asignar'}
                    </td>

                    {/* Upvotes */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c084fc', fontWeight: 600 }}>
                        <ThumbsUp size={13} />
                        {report.upvotesCount}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectIncident(report)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                      >
                        <Eye size={13} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
