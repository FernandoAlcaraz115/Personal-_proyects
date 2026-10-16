import React from 'react';
import { 
  Inbox, 
  Wrench, 
  CheckCircle2, 
  AlertOctagon, 
  ThumbsUp, 
  TrendingUp,
  Activity
} from 'lucide-react';

export default function StatsCards({ reports = [] }) {
  const total = reports.length;
  const inProgress = reports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const critical = reports.filter(r => r.priority === 'critical' && r.status !== 'resolved').length;
  const totalUpvotes = reports.reduce((acc, r) => acc + (r.upvotesCount || 1), 0);

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const cards = [
    {
      title: 'Total Reportes',
      value: total,
      subtext: '+8 hoy',
      icon: Inbox,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.12)'
    },
    {
      title: 'En Atención Activa',
      value: inProgress,
      subtext: 'Con cuadrilla en campo',
      icon: Wrench,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.12)'
    },
    {
      title: 'Resueltos este Mes',
      value: resolved,
      subtext: `${resolutionRate}% tasa de cierre`,
      icon: CheckCircle2,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'Prioridad Crítica',
      value: critical,
      subtext: 'Riesgo alto / Urgente',
      icon: AlertOctagon,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      isPulsing: critical > 0
    },
    {
      title: 'Apoyo Ciudadano (+1)',
      value: totalUpvotes,
      subtext: 'Votos acumulados',
      icon: ThumbsUp,
      color: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.12)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient subtle glow */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: c.bgGlow,
              filter: 'blur(25px)',
              pointerEvents: 'none'
            }} />

            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {c.title}
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: '#ffffff',
                margin: '4px 0 2px 0'
              }}>
                {c.value}
              </div>
              <div style={{ 
                fontSize: '0.72rem', 
                color: c.color, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {c.subtext}
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: c.bgGlow,
              border: `1px solid ${c.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.color,
              boxShadow: c.isPulsing ? `0 0 16px ${c.color}66` : 'none'
            }}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
