
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Dashboard from '@/components/Dashboard';
import CalendarView from '@/components/CalendarView';
import TrendsView from '@/components/TrendsView';
import EpisodesList from '@/components/EpisodesList';
import AdminPanel from '@/components/AdminPanel';
import SimpleHeadacheForm from '@/components/SimpleHeadacheForm';
import AuthGate, { AuthMode, LoginPayload, RegisterPayload } from '@/components/AuthGate';
import { HeadacheEntry } from '@/types/headache';

const USERS_STORAGE_KEY = 'migracare-users-v1';
const SESSION_STORAGE_KEY = 'migracare-session-v1';

interface UserRecord {
  key: string;
  email: string;
  name: string;
  passwordHash: string;
  entries: HeadacheEntry[];
  createdAt: string;
  updatedAt: string;
}

interface MigracareDatabase {
  users: Record<string, UserRecord>;
}

interface ActiveUser {
  key: string;
  name: string;
  email: string;
}

const getDatabase = (): MigracareDatabase => {
  if (typeof window === 'undefined') {
    return { users: {} };
  }
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    return { users: {} };
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.users && typeof parsed.users === 'object') {
      return { users: parsed.users as Record<string, UserRecord> };
    }
  } catch (error) {
    console.error('No se pudo leer la base de usuarios', error);
  }
  return { users: {} };
};

const setDatabase = (db: MigracareDatabase) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db));
};

const storeSession = (key: string, persistent: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }
  clearSession();
  const payload = JSON.stringify({ key });
  if (persistent) {
    localStorage.setItem(SESSION_STORAGE_KEY, payload);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, payload);
  }
};

const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

const hashPassword = async (password: string): Promise<string> => {
  if (window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(password);
};

const getFirstName = (name: string) => {
  if (!name) return 'usuario';
  const parts = name.trim().split(/\s+/);
  return parts[0] || 'usuario';
};

const Index = () => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [entries, setEntries] = useState<HeadacheEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin'>('dashboard');
  const [appSettings, setAppSettings] = useState({
    appName: 'MigraCare',
    appDescription: 'Tu compañero inteligente para el seguimiento y gestión de migrañas.',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    appIcon: 'Heart'
  });
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authBusy, setAuthBusy] = useState(false);
  const { toast } = useToast();

  // Función para cargar configuración desde localStorage
  const loadAppSettings = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAppSettings({
          appName: parsedSettings.appName || 'MigraCare',
          appDescription: parsedSettings.appDescription || 'Tu compañero inteligente para el seguimiento y gestión de migrañas.',
          primaryColor: parsedSettings.primaryColor || '#8B5CF6',
          secondaryColor: parsedSettings.secondaryColor || '#EC4899',
          appIcon: parsedSettings.appIcon || 'Heart'
        });
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    }
  };

  useEffect(() => {
    loadAppSettings();
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    }
  }, []);

  // Escuchar cambios en la configuración de administración
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleSettingsUpdate = () => {
      loadAppSettings();
    };

    window.addEventListener('admin-settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('admin-settings-updated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    const db = getDatabase();
    const record = db.users[user.key];
    if (!record) {
      return;
    }
    db.users[user.key] = {
      ...record,
      entries,
      updatedAt: new Date().toISOString()
    };
    setDatabase(db);
  }, [entries, user]);

  // PWA Installation and mobile optimizations
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleLoad = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      }
    };

    window.addEventListener('load', handleLoad);

    const handleBeforeInstall = (event: Event) => {
      console.log('PWA install prompt available', event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Enhanced viewport height handling for mobile (especially Safari)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleOrientationChange = () => {
      setTimeout(setVH, 100);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', handleOrientationChange);

    document.body.style.overflow = showForm ? 'hidden' : 'unset';

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    const db = getDatabase();
    const record = db.users[user.key];
    if (record && Array.isArray(record.entries)) {
      setEntries([...record.entries]);
    } else {
      setEntries([]);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!payload) {
      return;
    }
    try {
      const { key } = JSON.parse(payload);
      if (!key) {
        clearSession();
        return;
      }
      const db = getDatabase();
      const record = db.users[key];
      if (!record) {
        clearSession();
        return;
      }
      setUser({ 
        key: record.key, 
        name: record.name, 
        email: record.email,
        avatar: (record as any).avatar || 'calm-mind'
      });
      setEntries(Array.isArray(record.entries) ? [...record.entries] : []);
    } catch (error) {
      console.error('Error en auto-login', error);
      clearSession();
    }
  }, []);

  const ensureAuthenticated = (message = 'Inicia sesión para continuar') => {
    if (!user) {
      toast({
        title: 'Autenticación requerida',
        description: message,
      });
      return false;
    }
    return true;
  };

  const handleOpenForm = () => {
    if (!ensureAuthenticated('Inicia sesión para registrar episodios')) {
      return;
    }
    setShowForm(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      if (user) {
        setShowForm(true);
      } else {
        setAuthMode('login');
        toast({
          title: 'Inicia sesión',
          description: 'Ingresa para registrar tu episodio rápidamente.',
        });
      }
    }
  }, [user, toast]);

  const handleSaveEntry = (entry: HeadacheEntry) => {
    if (!ensureAuthenticated('Inicia sesión para registrar episodios')) {
      return;
    }
    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
    toast({
      title: "Registro guardado",
      description: "Tu episodio de migraña ha sido registrado exitosamente.",
    });

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const handleUpdateEntry = (updatedEntry: HeadacheEntry) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  const handleLoginSubmit = async ({ email, password, remember }: LoginPayload) => {
    if (!email || !password) {
      toast({
        title: 'Faltan datos',
        description: 'Ingresa tu correo y contraseña para continuar.',
      });
      return;
    }

    setAuthBusy(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const db = getDatabase();
      const record = db.users[normalizedEmail];
      if (!record) {
        toast({
          title: 'Cuenta no encontrada',
          description: 'Revisa tu correo o crea una cuenta nueva.',
        });
        return;
      }

      const hash = await hashPassword(password);
      if (record.passwordHash !== hash) {
        toast({
          title: 'Credenciales incorrectas',
          description: 'La contraseña no coincide. Intenta nuevamente.',
        });
        return;
      }

      setUser({ 
        key: record.key, 
        name: record.name, 
        email: record.email,
        avatar: (record as any).avatar || 'calm-mind'
      });
      setEntries(Array.isArray(record.entries) ? [...record.entries] : []);
      storeSession(record.key, remember);
      setCurrentView('dashboard');
      setShowForm(false);
      toast({
        title: `Bienvenido de nuevo, ${getFirstName(record.name)}!`,
        description: 'Tus registros están listos.',
      });
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      toast({
        title: 'No se pudo iniciar sesión',
        description: 'Intenta nuevamente en unos segundos.',
      });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegisterSubmit = async ({ name, email, password, confirm, remember }: RegisterPayload) => {
    if (!name || !email || !password || !confirm) {
      toast({
        title: 'Faltan datos',
        description: 'Completa todos los campos para continuar.',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: 'Contraseña insegura',
        description: 'Usa al menos 6 caracteres para tu contraseña.',
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Revisa que ambas contraseñas sean iguales.',
      });
      return;
    }

    setAuthBusy(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const db = getDatabase();
      if (db.users[normalizedEmail]) {
        toast({
          title: 'Cuenta existente',
          description: 'Ya existe una cuenta con ese correo. Inicia sesión.',
        });
        return;
      }

      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();
      const record: UserRecord = {
        key: normalizedEmail,
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        entries: [],
        createdAt: now,
        updatedAt: now,
      };

      db.users[record.key] = record;
      setDatabase(db);

      setUser({ 
        key: record.key, 
        name: record.name, 
        email: record.email,
        avatar: (record as any).avatar || 'calm-mind'
      });
      setEntries([]);
      storeSession(record.key, remember);
      setCurrentView('dashboard');
      setShowForm(false);
      toast({
        title: `¡Bienvenido a MigraCare, ${getFirstName(record.name)}!`,
        description: 'Ahora puedes comenzar a registrar tus episodios.',
      });
    } catch (error) {
      console.error('Error al crear cuenta', error);
      toast({
        title: 'No se pudo crear la cuenta',
        description: 'Intenta nuevamente más tarde.',
      });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setEntries([]);
    setShowForm(false);
    setCurrentView('dashboard');
    setAuthMode('login');
    toast({
      title: 'Sesión cerrada',
      description: 'Tus datos permanecen guardados en este dispositivo.',
    });
  };

  const handleUserUpdate = (fields: { avatar: string }) => {
    if (!user) return;
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    
    // Guardar en la base de datos local
    const db = getDatabase();
    const record = db.users[user.key];
    if (record) {
      db.users[user.key] = {
        ...record,
        ...fields,
        updatedAt: new Date().toISOString()
      } as any;
      setDatabase(db);
      toast({
        title: 'Perfil actualizado',
        description: 'Tu foto de perfil se ha guardado exitosamente.',
      });
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'episodes':
        return (
          <EpisodesList 
            entries={entries} 
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );
      case 'calendar':
        return <CalendarView entries={entries} />;
      case 'trends':
        return <TrendsView entries={entries} />;
      case 'admin':
        return <AdminPanel user={user} onUserUpdate={handleUserUpdate} />;
      default:
        return <Dashboard entries={entries} />;
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen gradient-hero"
        style={{
          minHeight: 'calc(var(--vh, 1vh) * 100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem'
        }}
      >
        <AuthGate
          mode={authMode}
          onModeChange={setAuthMode}
          onLogin={handleLoginSubmit}
          onRegister={handleRegisterSubmit}
          busy={authBusy}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen gradient-hero" 
      style={{ 
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
      }}
    >
      <Header 
        onNewEntry={handleOpenForm}
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content Area - Optimizada para dispositivos móviles y escritorio */}
      <div 
        style={{
          padding: '1.5rem 0 6rem 0',
          position: 'relative',
          minHeight: '70vh'
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}
        >
          {/* Header de sección cuando no es dashboard */}
          {currentView !== 'dashboard' && (
            <div 
              style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '1rem 0 1.5rem 0'
              }}
            >
              <h2 
                style={{
                  fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}
              >
                {currentView === 'episodes' && 'Lista de Episodios'}
                {currentView === 'calendar' && 'Calendario de Episodios'}
                {currentView === 'trends' && 'Análisis y Gráficos'}
                {currentView === 'admin' && 'Configuración'}
              </h2>
              <p 
                style={{
                  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '0.925rem',
                  color: '#64748b',
                  margin: '0.35rem 0 0 0'
                }}
              >
                {currentView === 'episodes' && 'Gestiona y revisa todos tus episodios de migraña'}
                {currentView === 'calendar' && 'Visualiza tus episodios en el calendario'}
                {currentView === 'trends' && 'Analiza patrones y tendencias en tus datos'}
                {currentView === 'admin' && 'Configura medicamentos y preferencias'}
              </p>
            </div>
          )}
          
          <div 
            style={{
              animation: 'fadeIn 0.6s ease-out'
            }}
          >
            {renderCurrentView()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Form Modal */}
      {showForm && (
        <SimpleHeadacheForm
          onSave={handleSaveEntry}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Index;
