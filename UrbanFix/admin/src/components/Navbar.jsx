import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  criticalCount = 0,
  isMockMode = true
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{
      margin: '16px 24px 0 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      zIndex: 100
    }}>
      {/* Brand & City */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
        }}>
          <Building2 size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.25rem', 
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              UrbanFix
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Panel Municipal
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supervisión y Despacho de Infraestructura Urbana
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ flex: '1', maxWidth: '440px', position: 'relative' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-dim)' 
          }} 
        />
        <input
          id="global-search-input"
          type="text"
          placeholder="Buscar por ticket (UF-...), calle, colonia o problema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(10, 14, 23, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '9px 16px 9px 42px',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--border-focus)';
            e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Status & Live Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Live sync pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem'
        }}>
          <span className="pulse-dot"></span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>En Vivo (C5)</span>
          {isMockMode && (
            <span style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-dim)', 
              marginLeft: '4px',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              paddingLeft: '6px'
            }}>
              Modo Simulado
            </span>
          )}
        </div>

        {/* Critical Alerts Banner */}
        {criticalCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            color: '#f87171',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <AlertTriangle size={15} />
            <span>{criticalCount} Críticos</span>
          </div>
        )}

        {/* Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          fontWeight: 500
        }}>
          <Clock size={16} />
          <span>{time}</span>
        </div>

        {/* Supervisor Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e2e8f0',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            SP
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Supervisión C5</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Centro de Despacho</div>
          </div>
        </div>
      </div>
    </header>
  );
}
