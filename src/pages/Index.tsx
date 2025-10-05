
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
      setUser({ key: record.key, name: record.name, email: record.email });
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

      setUser({ key: record.key, name: record.name, email: record.email });
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

      setUser({ key: record.key, name: record.name, email: record.email });
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
        return <AdminPanel />;
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
          padding: '2rem 1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
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
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <Header onNewEntry={handleOpenForm} />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.5rem 1rem 0 1rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#fff',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.2)',
            padding: '1.25rem 1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '1.125rem',
                fontWeight: 600
              }}
            >
              Hola, {getFirstName(user.name)}
            </span>
            <span
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              {user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.75rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              background: 'rgba(15, 23, 42, 0.3)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Hero Section - Optimizada */}
      <div 
        style={{
          padding: '4rem 0',
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            width: '100%'
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }}
          >
            {/* Icono optimizado */}
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            {/* Título optimizado */}
                 <h1
                   style={{
                     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                     fontWeight: 800,
                     fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                     lineHeight: 1.1,
                     letterSpacing: '-0.02em',
                     background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text',
                     textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                     margin: 0
                   }}
                 >
                   {appSettings.appName}
                 </h1>
            
            {/* Descripción optimizada */}
            <p 
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                maxWidth: '600px',
                margin: 0,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              {appSettings.appDescription}
            </p>
            
                 {/* Botones optimizados - Responsive */}
                 <div
                   style={{
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     marginTop: '2rem',
                     width: '100%'
                   }}
                 >
              {/* Botón principal */}
              <button 
                onClick={handleOpenForm}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem 2.5rem',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  minWidth: '200px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.75rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Episodio
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Solo mostrar en vista inicial */}
      {currentView === 'dashboard' && (
        <div 
          style={{
            padding: '3rem 0',
            position: 'relative'
          }}
        >
          <div 
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 1rem'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}
            >
            {/* Tarjeta 1: Episodios Registrados */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                    color: '#1e293b',
                    margin: 0
                  }}
                >
                  Episodios Registrados
                </h3>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                    fontSize: '1.5rem'
                  }}
                >
                  {entries.length}
                </div>
              </div>
              <p 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: '#64748b',
                  fontWeight: 400,
                  margin: 0
                }}
              >
                Total de episodios de migraña registrados en tu diario personal.
              </p>
            </div>

            {/* Tarjeta 2: Estado del Sistema */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                    color: '#1e293b',
                    margin: 0
                  }}
                >
                  Estado del Sistema
                </h3>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: '#64748b',
                  fontWeight: 400,
                  margin: 0
                }}
              >
                Aplicación funcionando correctamente y lista para usar.
              </p>
            </div>

            {/* Tarjeta 3: Próximos Pasos */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                    color: '#1e293b',
                    margin: 0
                  }}
                >
                  Próximos Pasos
                </h3>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
                  }}
                >
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: '#64748b',
                  fontWeight: 400,
                  margin: 0
                }}
              >
                Comienza registrando tu primer episodio para obtener insights personalizados.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Quick Actions - Solo mostrar en vista inicial */}
      {currentView === 'dashboard' && (
        <div 
          style={{
            padding: '3rem 0',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)'
          }}
        >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}
        >
          <h2 
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              lineHeight: 1.2,
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '3rem',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            Acciones Rápidas
          </h2>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {/* Dashboard */}
            <button 
              onClick={() => setCurrentView('dashboard')}
              style={{
                background: currentView === 'dashboard' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: currentView === 'dashboard' 
                  ? '2px solid rgba(102, 126, 234, 0.8)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: currentView === 'dashboard' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: currentView === 'dashboard' 
                  ? '0 20px 40px rgba(102, 126, 234, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'dashboard') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'dashboard') {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                }}
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
                   <span
                     style={{
                       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                       fontWeight: 600,
                       fontSize: '1.125rem',
                       color: 'white',
                       display: 'block'
                     }}
                   >
                     Inicio
                   </span>
            </button>

            {/* Calendario */}
            <button 
              onClick={() => setCurrentView('calendar')}
              style={{
                background: currentView === 'calendar' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: currentView === 'calendar' 
                  ? '2px solid rgba(240, 147, 251, 0.8)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: currentView === 'calendar' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: currentView === 'calendar' 
                  ? '0 20px 40px rgba(240, 147, 251, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'calendar') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'calendar') {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 10px 25px rgba(240, 147, 251, 0.4)'
                }}
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
                   <span
                     style={{
                       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                       fontWeight: 600,
                       fontSize: '1.125rem',
                       color: 'white',
                       display: 'block'
                     }}
                   >
                     Fechas
                   </span>
            </button>

            {/* Tendencias */}
            <button 
              onClick={() => setCurrentView('trends')}
              style={{
                background: currentView === 'trends' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: currentView === 'trends' 
                  ? '2px solid rgba(79, 172, 254, 0.8)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: currentView === 'trends' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: currentView === 'trends' 
                  ? '0 20px 40px rgba(79, 172, 254, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'trends') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'trends') {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 10px 25px rgba(79, 172, 254, 0.4)'
                }}
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
                   <span
                     style={{
                       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                       fontWeight: 600,
                       fontSize: '1.125rem',
                       color: 'white',
                       display: 'block'
                     }}
                   >
                     Gráficos
                   </span>
            </button>

            {/* Episodios */}
            <button 
              onClick={() => setCurrentView('episodes')}
              style={{
                background: currentView === 'episodes' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: currentView === 'episodes' 
                  ? '2px solid rgba(245, 158, 11, 0.8)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: currentView === 'episodes' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: currentView === 'episodes' 
                  ? '0 20px 40px rgba(245, 158, 11, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'episodes') {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'episodes') {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
                }}
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
                   <span
                     style={{
                       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                       fontWeight: 600,
                       fontSize: '1.125rem',
                       color: 'white',
                       display: 'block'
                     }}
                   >
                     Lista
                   </span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Main Content Area - Optimizada */}
      <div 
        style={{
          padding: currentView === 'dashboard' ? '3rem 0 6rem 0' : '1rem 0 6rem 0',
          position: 'relative',
          minHeight: currentView === 'dashboard' ? '50vh' : '70vh'
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
                padding: '2rem 0'
              }}
            >
              <h2 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  lineHeight: 1.2,
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
              >
                {currentView === 'episodes' && 'Lista de Episodios'}
                {currentView === 'calendar' && 'Calendario de Episodios'}
                {currentView === 'trends' && 'Análisis y Gráficos'}
                {currentView === 'admin' && 'Configuración'}
              </h2>
              <p 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: '0.5rem 0 0 0',
                  textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)'
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
