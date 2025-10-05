
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminAuth from './AdminAuth';
import ChangePasswordModal from './ChangePasswordModal';
import MedicationManager from './MedicationManager';
import AdminTabs from './admin/AdminTabs';
import GeneralTab from './admin/GeneralTab';
import AppearanceTab from './admin/AppearanceTab';
import DataTab from './admin/DataTab';
import SecurityTab from './admin/SecurityTab';

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

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'medications' | 'data' | 'security'>('general');
  const { toast } = useToast();

  // Verificación de autenticación
  useEffect(() => {
    const authStatus = localStorage.getItem('admin-authenticated');
    const sessionTimestamp = localStorage.getItem('admin-session-timestamp');
    
    if (authStatus === 'true' && sessionTimestamp) {
      const sessionAge = Date.now() - parseInt(sessionTimestamp);
      const MAX_SESSION_TIME = 24 * 60 * 60 * 1000; // 24 horas
      
      if (sessionAge < MAX_SESSION_TIME) {
        setIsAuthenticated(true);
        
        const passwordChanged = localStorage.getItem('admin-password-changed');
        if (!passwordChanged) {
          setShowChangePassword(true);
        }
      } else {
        handleLogout();
      }
    }
  }, []);

  // Cargar configuración
  useEffect(() => {
    if (isAuthenticated) {
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
  }, [isAuthenticated]);

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

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    localStorage.removeItem('admin-session-timestamp');
    setIsAuthenticated(false);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente."
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
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {showChangePassword && (
        <ChangePasswordModal onPasswordChanged={() => setShowChangePassword(false)} />
      )}
      
      <div 
        style={{
          padding: '2rem 1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Header - Optimizado */}
          <div 
            style={{
              padding: '2rem',
              borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
              className="sm:flex-row sm:items-center sm:justify-between"
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      margin: 0,
                      lineHeight: 1.2
                    }}
                  >
                    Panel de Administración
                  </h1>
                  <p 
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: 0,
                      marginTop: '0.25rem'
                    }}
                  >
                    Configura tu aplicación personalizada
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '12px',
                  border: '2px solid #ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#ef4444',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          {/* Content - Optimizado */}
          <div 
            style={{
              padding: '2rem',
              background: 'rgba(248, 250, 252, 0.5)'
            }}
          >
            {renderTabContent()}

            {activeTab !== 'medications' && activeTab !== 'security' && (
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingTop: '2rem',
                  borderTop: '1px solid rgba(226, 232, 240, 0.5)',
                  marginTop: '2rem'
                }}
              >
                <button
                  onClick={handleSave}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.875rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
