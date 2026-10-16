import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Maximize2, 
  Eye, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ThumbsUp,
  Layers,
  Wrench,
  ExternalLink
} from 'lucide-react';

// Generar DivIcon personalizado con colores y badges según categoría y severidad
function createCustomPin(categoryColor, isCritical, categorySlug) {
  const isBache = categorySlug === 'bache';
  const isFuga = categorySlug === 'fuga';
  const isLuz = categorySlug === 'luminaria';
  const isSemaforo = categorySlug === 'semaforo';

  let symbol = '●';
  if (isBache) symbol = '🚧';
  else if (isFuga) symbol = '💧';
  else if (isLuz) symbol = '💡';
  else if (isSemaforo) symbol = '🚦';
  else symbol = '🗑️';

  const criticalPulse = isCritical 
    ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: pulse-border 1.5s infinite; top: -6px; left: -6px; z-index: -1;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        ${criticalPulse}
        <div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: ${categoryColor}; 
          border: 2px solid #ffffff; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.6); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${symbol}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  });
}

export default function IncidentsMap({ 
  reports = [], 
  categories = [],
  onSelectIncident,
  statusFilter,
  setStatusFilter
}) {
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'streets'

  // Centro de mapa calculado a partir de los reportes (o centro histórico por defecto)
  const defaultCenter = [19.432608, -99.133209];

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  };

  const getCategory = (catId) => categories.find(c => c.id === catId) || { color: '#3b82f6', name: 'General', slug: 'general' };

  return (
    <div className="glass-panel" style={{
      position: 'relative',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      height: 'calc(100vh - 240px)',
      minHeight: '520px',
      border: '1px solid var(--border-subtle)'
    }}>
      {/* Top Floating Map Toolbar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        {/* Status Filter Badges */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'auto',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
        }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'assigned', label: 'Asignados' },
            { id: 'in_progress', label: 'En Reparación' },
            { id: 'resolved', label: 'Resueltos' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              style={{
                background: statusFilter === st.id ? 'var(--primary)' : 'transparent',
                color: statusFilter === st.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: statusFilter === st.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Map View Toggle (Dark vs Voyager) */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={() => setMapStyle(mapStyle === 'dark' ? 'streets' : 'dark')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            <Layers size={14} />
            <span>{mapStyle === 'dark' ? 'Modo Oscuro' : 'Modo Calles'}</span>
          </button>
        </div>
      </div>

      {/* Floating Category Legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.74rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
          Simbología de Infraestructura
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {categories.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: c.color,
                boxShadow: `0 0 6px ${c.color}`
              }} />
              <span style={{ color: 'var(--text-muted)' }}>{c.name.split('/')[0].trim()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px #ef4444'
            }} />
            <span style={{ color: '#f87171', fontWeight: 600 }}>Alerta Crítica / Alta Urgencia</span>
          </div>
        </div>
      </div>

      {/* Actual Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ width: '100%', height: '100%', background: '#0a0e17' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrls[mapStyle]}
        />

        {reports.map((report) => {
          const category = getCategory(report.categoryId);
          const isCritical = report.priority === 'critical';
          const pin = createCustomPin(category.color, isCritical, category.slug);

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={pin}
            >
              <Popup>
                <div style={{ padding: '6px', maxWidth: '280px' }}>
                  {/* Image Preview */}
                  {report.photoUrl && (
                    <div style={{
                      width: '100%',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '10px',
                      position: 'relative'
                    }}>
                      <img 
                        src={report.photoUrl} 
                        alt={report.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className={`badge badge-${report.status}`} style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                      }}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Header info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: category.color,
                      textTransform: 'uppercase'
                    }}>
                      {category.name.split('/')[0]}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>•</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {report.ticketNumber}
                    </span>
                  </div>

                  <h4 style={{ 
                    fontSize: '0.88rem', 
                    fontWeight: 700, 
                    color: '#f8fafc', 
                    marginBottom: '6px',
                    lineHeight: '1.25' 
                  }}>
                    {report.title}
                  </h4>

                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)', 
                    marginBottom: '10px',
                    lineHeight: '1.4' 
                  }}>
                    {report.description.length > 90 ? `${report.description.slice(0, 90)}...` : report.description}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.72rem', 
                    color: 'var(--text-dim)', 
                    marginBottom: '12px' 
                  }}>
                    <MapPin size={13} color="#94a3b8" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.address}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectIncident(report)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <Eye size={14} />
                    <span>Inspeccionar & Despachar</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
