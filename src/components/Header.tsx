import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Brain, 
  Zap, 
  Shield, 
  Star, 
  Flame,
  Eye,
  Target,
  BarChart3,
  HeartHandshake,
  Stethoscope,
  Pill,
  Clock,
  Sparkles,
  LogOut,
  Plus,
  Home,
  List,
  Calendar,
  TrendingUp,
  Settings
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  onNewEntry: () => void;
  user?: { name: string; email: string; avatar?: string } | null;
  onLogout?: () => void;
  currentView?: 'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin';
  onViewChange?: (view: 'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin') => void;
}

const Header = ({ onNewEntry, user, onLogout, currentView, onViewChange }: HeaderProps) => {
  const [appSettings, setAppSettings] = useState({
    appName: 'MigraCare',
    appDescription: 'Seguimiento inteligente de migrañas',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    appIcon: 'Heart'
  });

  // Mapeo de iconos
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Heart,
    Activity,
    Brain,
    Zap,
    Shield,
    Star,
    Sparkles,
    Flame,
    Eye,
    Target,
    BarChart3,
    HeartHandshake,
    Stethoscope,
    Pill,
    Clock,
  };

  // Función para cargar configuración desde localStorage
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAppSettings({
          appName: parsedSettings.appName || 'MigraCare',
          appDescription: parsedSettings.appDescription || 'Seguimiento inteligente de migrañas',
          primaryColor: parsedSettings.primaryColor || '#8B5CF6',
          secondaryColor: parsedSettings.secondaryColor || '#EC4899',
          appIcon: parsedSettings.appIcon || 'Heart'
        });
        
        // Actualizar el título del documento también
        document.title = `${parsedSettings.appName || 'MigraCare'} - ${parsedSettings.appDescription || 'Seguimiento inteligente de migrañas'}`;
      } catch (error) {
        console.error('Error loading admin settings in Header:', error);
      }
    }
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadSettings();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-settings') {
        loadSettings();
      }
    };

    const handleCustomStorageChange = () => {
      loadSettings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-settings-updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-settings-updated', handleCustomStorageChange);
    };
  }, []);

  // Obtener el componente de icono seleccionado
  const SelectedIcon = iconMap[appSettings.appIcon] || Heart;

  // Iniciales del usuario
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getFirstName = (name: string) => {
    if (!name) return 'Usuario';
    return name.trim().split(/\s+/)[0];
  };

  // Navigation Items for Desktop
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'episodes', label: 'Lista', icon: List },
    { id: 'calendar', label: 'Fechas', icon: Calendar },
    { id: 'trends', label: 'Gráficos', icon: TrendingUp },
    { id: 'admin', label: 'Ajustes', icon: Settings },
  ];

  return (
    <header className="nav-beautiful sticky top-0 z-50 safe-area-pt">
      <div className="container-beautiful" style={{ padding: '0.5rem 1rem' }}>
        <div className="flex items-center justify-between gap-4">
          
          {/* LOGO & APP BRANDING */}
          <div className="flex items-center space-x-2 shrink-0">
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              }}
            >
              <SelectedIcon className="w-4 h-4 text-white" />
            </div>
            
            {/* Desktop Logo and Description */}
            <div className="hidden md:block">
              <h1 
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}
              >
                {appSettings.appName}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium leading-none" style={{ margin: '2px 0 0 0' }}>
                {appSettings.appDescription}
              </p>
            </div>
            
            {/* Mobile Logo */}
            <div className="md:hidden">
              <h1 
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}
              >
                {appSettings.appName}
              </h1>
            </div>
          </div>

          {/* DESKTOP INTEGRATED GLASS NAVIGATION */}
          {user && onViewChange && currentView && (
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100/50 backdrop-blur-md p-1 rounded-xl border border-slate-200/30">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      border: 'none',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? '#4f46e5' : '#475569',
                      boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.05)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* RIGHT-SIDE ACTIONS (NEW EPISODE, USER PROFILE, LOGOUT) */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Desktop "Nuevo Episodio" Button */}
                <button
                  onClick={onNewEntry}
                  className="hidden sm:inline-flex btn-beautiful items-center gap-1.5"
                  style={{
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Episodio</span>
                </button>

                {/* Mobile "+" Button */}
                <button
                  onClick={onNewEntry}
                  title="Registrar nuevo dolor"
                  className="sm:hidden flex items-center justify-center text-white"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Subtle Divider (Desktop Only) */}
                <div className="hidden sm:block w-[1px] h-6 bg-slate-200" />

                {/* Profile Picture Avatar */}
                <UserAvatar 
                  avatarId={user.avatar || 'calm-mind'} 
                  size={32}
                  style={{ cursor: 'default' }}
                />

                {/* User First Name (Desktop Only) */}
                <span 
                  className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[80px] truncate"
                  title={user.name}
                >
                  {getFirstName(user.name)}
                </span>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #e2e8f0',
                      background: 'rgba(255, 255, 255, 0.8)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.borderColor = '#fecaca';
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              // Simple default action if no user is authenticated in Header (should be handled by AuthGate anyway)
              <span className="text-xs text-slate-400 font-medium">Inicia Sesión</span>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
