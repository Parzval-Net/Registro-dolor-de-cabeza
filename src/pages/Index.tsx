
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
import {
  isSupabaseConfigured,
  supabase,
  getHeadacheEntries,
  saveHeadacheEntry,
  deleteHeadacheEntry,
  syncLocalEntriesToCloud
} from '@/lib/supabase';

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
  avatar?: string;
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

const sha256Fallback = (ascii: string): string => {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const words: number[] = [];
  const asciiLength = ascii.length * 8;
  let result = '';
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const charCodes = [];
  for (let i = 0; i < ascii.length; i++) {
    charCodes.push(ascii.charCodeAt(i));
  }
  charCodes.push(0x80);
  while (charCodes.length % 64 !== 56) {
    charCodes.push(0);
  }
  for (let i = 7; i >= 0; i--) {
    charCodes.push((asciiLength >>> (i * 8)) & 0xff);
  }
  for (let i = 0; i < charCodes.length; i += 4) {
    words.push(
      (charCodes[i] << 24) |
      (charCodes[i + 1] << 16) |
      (charCodes[i + 2] << 8) |
      charCodes[i + 3]
    );
  }
  const w = new Array(64);
  for (let i = 0; i < words.length; i += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j];
      } else {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const temp1 = (h + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & f) ^ (~e & g)) + k[j] + w[j]) | 0;
      const temp2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0; hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0; hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
  }
  for (let i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }
  return result;
};

const hashPassword = async (password: string): Promise<string> => {
  if (window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return sha256Fallback(password);
};

const getFirstName = (name: string) => {
  if (!name) return 'usuario';
  const parts = name.trim().split(/\s+/);
  return parts[0] || 'usuario';
};

const Index = () => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [entries, setEntries] = useState<HeadacheEntry[]>([]);
  const [dbConnected, setDbConnected] = useState(isSupabaseConfigured);
  const [showForm, setShowForm] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(undefined);
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
      setDbConnected(isSupabaseConfigured);
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
    // Key by email to support both Supabase (where user.key is UUID) and local (where key is email)
    const localKey = user.email || user.key;
    let record = db.users[localKey];
    if (!record) {
      record = {
        key: localKey,
        email: user.email,
        name: user.name,
        passwordHash: '',
        entries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    db.users[localKey] = {
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

    const loadUserEntries = async () => {
      // Si Supabase está configurado, intentamos descargar de la nube primero
      if (dbConnected && supabase) {
        try {
          const cloudEntries = await getHeadacheEntries(user.key);
          setEntries(cloudEntries);
          return;
        } catch (error) {
          console.error('Error al cargar episodios desde Supabase, intentando local:', error);
        }
      }

      // Si no está configurado o falla, caemos de vuelta al caché local
      const db = getDatabase();
      const localKey = user.email || user.key;
      const record = db.users[localKey];
      if (record && Array.isArray(record.entries)) {
        setEntries([...record.entries]);
      } else {
        setEntries([]);
      }
    };

    loadUserEntries();
  }, [user, dbConnected]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkSession = async () => {
      // Detectar redireccionamiento de recuperación de contraseña
      const params = new URLSearchParams(window.location.search);
      const isResetPasswordFlow = params.get('action') === 'reset-password';

      if (isResetPasswordFlow) {
        setAuthMode('reset-password');
      }

      // 1. Si Supabase está activo, intentamos recuperar la sesión nativa de Supabase primero
      if (dbConnected && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            if (isResetPasswordFlow) {
              // Si es flujo de recuperación, no queremos mostrar el dashboard todavía
              setUser(null);
              return;
            }
            const sUser = session.user;
            const userName = sUser.user_metadata?.name || getFirstName(sUser.email || 'usuario');
            setUser({
              key: sUser.id,
              name: userName,
              email: sUser.email || '',
              avatar: sUser.user_metadata?.avatar || 'calm-mind'
            });
            
            // Cargar datos
            const cloudEntries = await getHeadacheEntries(sUser.id);
            setEntries(cloudEntries);

            // Sincronizar episodios registrados offline bajo este correo si existen
            if (sUser.email) {
              const db = getDatabase();
              const localRecord = db.users[sUser.email];
              if (localRecord && Array.isArray(localRecord.entries) && localRecord.entries.length > 0) {
                await syncLocalEntriesToCloud(sUser.id, localRecord.entries);
                const syncedEntries = await getHeadacheEntries(sUser.id);
                setEntries(syncedEntries);
                db.users[sUser.email].entries = [];
                setDatabase(db);
              }
            }
            return;
          }
        } catch (error) {
          console.error('Error restaurando sesión de Supabase:', error);
        }
      }

      // 2. Fallback a sesión local tradicional de localStorage
      const payload = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!payload) {
        // Si no hay sesión local y cambiamos de base de datos, limpiamos el usuario anterior
        setUser(null);
        setEntries([]);
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
        console.error('Error en auto-login local', error);
        clearSession();
      }
    };

    checkSession();
  }, [dbConnected]);

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
    setFormInitialDate(undefined);
    setShowForm(true);
  };

  const handleOpenFormWithDate = (dateStr: string) => {
    if (!ensureAuthenticated('Inicia sesión para registrar episodios')) {
      return;
    }
    setFormInitialDate(dateStr);
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

  const handleSaveEntry = async (entry: HeadacheEntry) => {
    if (!ensureAuthenticated('Inicia sesión para registrar episodios')) {
      return;
    }
    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
    toast({
      title: "Registro guardado",
      description: "Tu episodio de migraña ha sido registrado exitosamente.",
    });

    if (dbConnected && supabase) {
      try {
        await saveHeadacheEntry(user.key, entry);
      } catch (err) {
        console.error('Error al guardar episodio en la nube:', err);
        toast({
          title: "Sincronización pendiente",
          description: "Guardado localmente. Se guardará en la nube al restaurar conexión.",
        });
      }
    }

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const handleUpdateEntry = async (updatedEntry: HeadacheEntry) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));

    if (dbConnected && supabase) {
      try {
        await saveHeadacheEntry(user.key, updatedEntry);
      } catch (err) {
        console.error('Error al actualizar episodio en la nube:', err);
        toast({
          title: "Sincronización pendiente",
          description: "Actualizado localmente. Se sincronizará más tarde.",
        });
      }
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setEntries(prev => prev.filter(entry => entry.id !== entryId));

    if (dbConnected && supabase) {
      try {
        await deleteHeadacheEntry(user.key, entryId);
      } catch (err) {
        console.error('Error al eliminar episodio de la nube:', err);
        toast({
          title: "Sincronización pendiente",
          description: "Eliminado localmente. Se sincronizará más tarde.",
        });
      }
    }
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

      if (dbConnected && supabase) {
        // Autenticar mediante Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (error) {
          toast({
            title: 'Credenciales incorrectas',
            description: error.message || 'La contraseña no coincide o la cuenta no existe.',
          });
          return;
        }

        if (data.user) {
          const sUser = data.user;
          const name = sUser.user_metadata?.name || sUser.email?.split('@')[0] || 'usuario';
          
          setUser({
            key: sUser.id,
            name: name,
            email: sUser.email || '',
            avatar: sUser.user_metadata?.avatar || 'calm-mind'
          });

          // Sincronizar episodios locales si existen offline
          const db = getDatabase();
          const localRecord = db.users[normalizedEmail];
          const localEntries = localRecord?.entries || [];

          try {
            if (localEntries.length > 0) {
              await syncLocalEntriesToCloud(sUser.id, localEntries);
              db.users[normalizedEmail].entries = [];
              setDatabase(db);
            }
            const cloudEntries = await getHeadacheEntries(sUser.id);
            setEntries(cloudEntries);
          } catch (syncErr) {
            console.error('Error de sincronización inicial al iniciar sesión:', syncErr);
          }

          setCurrentView('dashboard');
          setShowForm(false);
          toast({
            title: `Bienvenido de nuevo, ${getFirstName(name)}!`,
            description: 'Tus registros en la nube están listos.',
          });
          return;
        }
      }

      // FALLBACK LOCAL
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
        description: 'Tus registros locales están listos.',
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

      if (dbConnected && supabase) {
        // Registrar en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              avatar: 'calm-mind'
            }
          }
        });

        if (error) {
          toast({
            title: 'No se pudo crear la cuenta',
            description: error.message || 'Intenta con otro correo o revisa tus datos.',
          });
          return;
        }

        if (data.user) {
          const sUser = data.user;
          setUser({
            key: sUser.id,
            name: name.trim(),
            email: sUser.email || '',
            avatar: 'calm-mind'
          });
          setEntries([]);
          setCurrentView('dashboard');
          setShowForm(false);
          
          const isConfirmed = data.session !== null;
          toast({
            title: `¡Bienvenido a MigraCare, ${getFirstName(name)}!`,
            description: isConfirmed 
              ? 'Cuenta creada exitosamente en la nube.'
              : 'Cuenta creada. Por favor verifica tu correo para comenzar.',
          });
          return;
        }
      }

      // FALLBACK LOCAL
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

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast({
        title: 'Faltan datos',
        description: 'Por favor ingresa tu correo electrónico.',
        variant: 'destructive'
      });
      return;
    }
    setAuthBusy(true);
    try {
      if (dbConnected && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname + '?action=reset-password'
        });
        if (error) {
          toast({
            title: 'Error de recuperación',
            description: error.message || 'No se pudo enviar el correo de recuperación.',
            variant: 'destructive'
          });
          return;
        }
        toast({
          title: 'Correo enviado',
          description: 'Se ha enviado un enlace de recuperación de contraseña a tu correo electrónico.',
        });
        setAuthMode('login');
      } else {
        toast({
          title: 'Cuentas locales sin nube',
          description: 'Las cuentas locales no disponen de recuperación por correo electrónico. Regístrate en la nube para habilitar esta opción.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error al solicitar recuperación:', err);
      toast({
        title: 'Error',
        description: 'Ocurrió un problema al procesar la solicitud.',
        variant: 'destructive'
      });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleResetPassword = async (password: string) => {
    if (!password) {
      toast({
        title: 'Faltan datos',
        description: 'Por favor ingresa la nueva contraseña.',
        variant: 'destructive'
      });
      return;
    }
    setAuthBusy(true);
    try {
      if (dbConnected && supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast({
            title: 'Error al actualizar',
            description: error.message || 'No se pudo actualizar tu contraseña en la nube.',
            variant: 'destructive'
          });
          return;
        }

        // Cerrar sesión para que inicien sesión limpia con la nueva contraseña
        await supabase.auth.signOut();

        toast({
          title: 'Contraseña actualizada',
          description: 'Tu nueva contraseña se ha guardado en la nube. Ya puedes iniciar sesión.',
        });
        setAuthMode('login');
        
        // Limpiar parámetros de URL
        if (typeof window !== 'undefined') {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Esta función requiere estar conectado a Supabase Cloud.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      toast({
        title: 'Error',
        description: 'No se pudo restablecer la contraseña.',
        variant: 'destructive'
      });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    if (dbConnected && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out from Supabase:', err);
      }
    }
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

  const handleUserUpdate = async (fields: { avatar: string }) => {
    if (!user) return;
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    
    // Guardar en la base de datos local (fallback offline)
    const db = getDatabase();
    const localKey = user.email || user.key;
    const record = db.users[localKey];
    if (record) {
      db.users[localKey] = {
        ...record,
        ...fields,
        updatedAt: new Date().toISOString()
      } as any;
      setDatabase(db);
    }

    if (dbConnected && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { avatar: fields.avatar }
        });
        if (error) throw error;
        toast({
          title: 'Perfil actualizado',
          description: 'Tu foto de perfil se ha guardado en la nube.',
        });
      } catch (err) {
        console.error('Error al actualizar avatar en Supabase:', err);
        toast({
          title: 'Perfil actualizado localmente',
          description: 'Se guardó en el dispositivo. Sincronización pendiente.',
        });
      }
    } else {
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
        return <CalendarView entries={entries} onNewEntry={handleOpenFormWithDate} />;
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
          onForgotPassword={handleForgotPassword}
          onResetPassword={handleResetPassword}
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
