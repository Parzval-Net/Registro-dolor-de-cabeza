
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Activity, 
  Brain, 
  Zap, 
  Shield, 
  Star, 
  Moon, 
  Sun, 
  Flame,
  Eye,
  Target,
  BarChart3,
  HeartHandshake,
  Stethoscope,
  Pill,
  Clock,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onNewEntry: () => void;
}

const Header = ({ onNewEntry }: HeaderProps) => {
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
    Moon,
    Sun,
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

  return (
    <header className="nav-beautiful sticky top-0 z-50 safe-area-pt">
      <div className="container-beautiful">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-14 h-14 rounded-2xl stat-icon-beautiful animate-float"
            >
              <SelectedIcon className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="heading-beautiful text-2xl">
                {appSettings.appName}
              </h1>
              <p className="text-beautiful">{appSettings.appDescription}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xl font-bold text-primary">
                {appSettings.appName}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button 
              className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-muted/50 transition-all duration-300"
              title="Cambiar tema"
            >
              <Sun className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* New Entry Button */}
            <button
              onClick={onNewEntry}
              title="Registrar dolor"
              aria-label="Registrar nuevo episodio de dolor"
              className="btn-beautiful text-sm px-6 py-3"
            >
              <span className="hidden sm:inline">Nuevo Episodio</span>
              <span className="sm:hidden">+</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
