
import { Home, Calendar, TrendingUp, List, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin';
  onViewChange: (view: 'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin') => void;
}

const MobileBottomNav = ({ currentView, onViewChange }: MobileBottomNavProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'episodes', label: 'Lista', icon: List },
    { id: 'calendar', label: 'Fechas', icon: Calendar },
    { id: 'trends', label: 'Gráficos', icon: TrendingUp },
    { id: 'admin', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav 
      style={{
        display: 'block',
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(100%, 640px)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
        height: '80px',
        paddingBottom: 'calc( env(safe-area-inset-bottom) + 4px )'
      }}
      className="lg:hidden"
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.75rem 1rem',
          maxWidth: '100%',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '12px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: isActive ? 'white' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '60px',
                minHeight: '60px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <IconComponent 
                style={{
                  width: '24px',
                  height: '24px',
                  marginBottom: '0.25rem',
                  transition: 'all 0.3s ease'
                }}
              />
              <span 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 600,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.3)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
