import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, LogOut, User, Check, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminAuth from './AdminAuth';
import ChangePasswordModal from './ChangePasswordModal';
import MedicationManager from './MedicationManager';
import AdminTabs from './admin/AdminTabs';
import GeneralTab from './admin/GeneralTab';
import AppearanceTab from './admin/AppearanceTab';
import DataTab from './admin/DataTab';
import SecurityTab from './admin/SecurityTab';
import DatabaseTab from './admin/DatabaseTab';
import UserAvatar, { AVATAR_OPTIONS } from './UserAvatar';

interface AdminSettings {
  appName: string;
  appDescription: string;
  dashboardDescription: string;
  primaryColor: string;
  secondaryColor: string;
  appIcon: string;
  language: string;
  timezone: string;
  exportFormat: string;
}

interface AdminPanelProps {
  user?: { key: string; name: string; email: string; avatar?: string } | null;
  onUserUpdate?: (fields: { avatar: string }) => void;
}

const AdminPanel = ({ user, onUserUpdate }: AdminPanelProps) => {
  // Sección activa: 'profile' (Mi Perfil) o 'system' (Sistema)
  const [activeSection, setActiveSection] = useState<'profile' | 'system'>('profile');
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    appName: 'MigraCare',
    appDescription: 'Tu aplicación para el seguimiento de migrañas',
    dashboardDescription: 'Conoce mejor tus patrones de dolor y toma decisiones informadas para tu bienestar',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    appIcon: 'Heart',
    language: 'es',
    timezone: 'America/Santiago',
    exportFormat: 'PDF'
  });
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'medications' | 'data' | 'security' | 'database'>('general');
  const { toast } = useToast();

  // Verificación de autenticación de administrador
  useEffect(() => {
    const authStatus = localStorage.getItem('admin-authenticated');
    const sessionTimestamp = localStorage.getItem('admin-session-timestamp');
    
    if (authStatus === 'true' && sessionTimestamp) {
      const sessionAge = Date.now() - parseInt(sessionTimestamp);
      const MAX_SESSION_TIME = 24 * 60 * 60 * 1000; // 24 horas
      
      if (sessionAge < MAX_SESSION_TIME) {
        setIsAdminAuthenticated(true);
        const passwordChanged = localStorage.getItem('admin-password-changed');
        if (!passwordChanged) {
          setShowChangePassword(true);
        }
      } else {
        handleAdminLogout();
      }
    }
  }, []);

  // Cargar configuración de administrador si está autenticado
  useEffect(() => {
    if (isAdminAuthenticated) {
      const savedSettings = localStorage.getItem('admin-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Error loading admin settings:', error);
        }
      }
    }
  }, [isAdminAuthenticated]);

  const handleSave = () => {
    try {
      localStorage.setItem('admin-settings', JSON.stringify(settings));
      document.title = `${settings.appName} - Seguimiento inteligente de migrañas`;
      window.dispatchEvent(new CustomEvent('admin-settings-updated', { detail: settings }));
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado exitosamente."
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin-authenticated');
    localStorage.removeItem('admin-session-timestamp');
    setIsAdminAuthenticated(false);
    toast({
      title: "Sesión de administración cerrada",
      description: "Has salido de la configuración del sistema."
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab settings={settings} onSettingsChange={setSettings} />;
      case 'appearance':
        return <AppearanceTab settings={settings} onSettingsChange={setSettings} />;
      case 'medications':
        return <MedicationManager />;
      case 'data':
        return <DataTab settings={settings} onSettingsChange={setSettings} />;
      case 'security':
        return <SecurityTab onChangePassword={() => setShowChangePassword(true)} />;
      case 'database':
        return <DatabaseTab />;
      default:
        return null;
    }
  };

  // Manejar cambio de avatar
  const handleSelectAvatar = (avatarId: string) => {
    if (onUserUpdate) {
      onUserUpdate({ avatar: avatarId });
    }
  };

  return (
    <>
      {showChangePassword && (
        <ChangePasswordModal onPasswordChanged={() => setShowChangePassword(false)} />
      )}
      
      <div 
        style={{
          padding: '1.5rem 0 3rem 0',
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
            overflow: 'hidden'
          }}
        >
          {/* HEADER SECTOR: USER vs SYSTEM SELECTION */}
          <div 
            style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: 1.2
                  }}
                >
                  Configuración y Ajustes
                </h1>
                <p 
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.85rem',
                    color: '#64748b',
                    margin: '0.2rem 0 0 0'
                  }}
                >
                  Configura tu perfil personal o personaliza la aplicación
                </p>
              </div>

              {/* UNIFIED SWITCH CONTROLLER */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    activeSection === 'profile'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mi Perfil</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('system')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    activeSection === 'system'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sistema</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTAINER CONTENT */}
          <div 
            style={{
              padding: '1.75rem 2rem',
              background: 'rgba(248, 250, 252, 0.4)'
            }}
          >
            {activeSection === 'profile' ? (
              /* ========================================
                 PROFILE SUBSECTION (PUBLIC & NO AUTHENTICATION NEEDED)
                 ======================================== */
              <div className="space-y-6">
                
                {/* User Info Overview card */}
                {user && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/80 p-5 rounded-2xl border border-slate-200/50 shadow-sm items-center">
                    
                    {/* Column 1: Current profile pic */}
                    <div className="flex flex-col items-center gap-2.5 md:border-r md:border-slate-100 md:pr-4">
                      <UserAvatar avatarId={user.avatar} size={76} />
                      <div className="text-center">
                        <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {user.name}
                        </h2>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">
                          Paciente
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Account details */}
                    <div className="md:col-span-2 space-y-3.5 px-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Detalles de Cuenta
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate" title={user.email}>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Paciente Activo</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Avatar Selection Card */}
                <Card className="glass-card-dark border border-slate-200/60 shadow-lg">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-sm sm:text-base font-bold text-slate-800">
                      Selecciona tu Foto de Perfil (Avatar)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Elige uno de nuestros hermosos iconos de meditación y salud con gradientes reconfortantes. Se actualizará en la barra superior al instante.
                    </p>

                    {/* Interactive selection grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {AVATAR_OPTIONS.map((option) => {
                        const isSelected = user?.avatar === option.id || (!user?.avatar && option.id === 'calm-mind');
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectAvatar(option.id)}
                            className="flex flex-col items-center justify-center p-3.5 bg-white border rounded-2xl transition-all duration-300 select-none relative group hover:-translate-y-0.5 hover:shadow-md"
                            style={{
                              borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                              borderWidth: isSelected ? '2px' : '1px',
                              boxShadow: isSelected ? '0 10px 20px rgba(99, 102, 241, 0.12)' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <UserAvatar avatarId={option.id} size={48} style={{ border: 'none', boxShadow: 'none' }} />
                            
                            <span 
                              className="text-[10px] sm:text-xs font-bold text-slate-700 text-center mt-2.5 truncate max-w-full"
                              style={{ color: isSelected ? '#4f46e5' : '#475569' }}
                            >
                              {option.name}
                            </span>

                            {/* Active selection dot checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm p-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

              </div>
            ) : (
              /* ========================================
                 SYSTEM SUBSECTION (SECURE & REQUIRES ADMIN PASSWORD)
                 ======================================== */
              <div>
                {!isAdminAuthenticated ? (
                  <AdminAuth onAuthenticated={() => setIsAdminAuthenticated(true)} />
                ) : (
                  /* Authenticated admin tab settings panel */
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-indigo-50/50 px-4 py-2.5 rounded-xl border border-indigo-100/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        <span>Autenticado como Administrador</span>
                      </div>
                      <button
                        onClick={handleAdminLogout}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold bg-white px-2 py-1 rounded border border-red-200/80 transition-all cursor-pointer"
                        style={{ border: '1px solid #fecaca' }}
                      >
                        Cerrar Admin
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
                      
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        {renderTabContent()}
                      </div>
                    </div>

                    {activeTab !== 'medications' && activeTab !== 'security' && activeTab !== 'database' && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSave}
                          className="btn-beautiful flex items-center gap-1.5"
                          style={{
                            padding: '0.75rem 2rem',
                            fontSize: '0.85rem',
                            borderRadius: '12px',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)'
                          }}
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar Configuración</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
