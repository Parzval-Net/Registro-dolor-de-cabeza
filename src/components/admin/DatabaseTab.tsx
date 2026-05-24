import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { isSupabaseConfigured, reinitializeSupabase, supabase } from '@/lib/supabase';

const SQL_SCHEMA = `-- 1. Crear la tabla de episodios de migraña
CREATE TABLE IF NOT EXISTS public.headaches (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    duration NUMERIC NOT NULL DEFAULT 0,
    medications TEXT[] NOT NULL DEFAULT '{}',
    triggers TEXT[] NOT NULL DEFAULT '{}',
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT DEFAULT '',
    sleep_hours NUMERIC,
    stress_level INTEGER DEFAULT 3 CHECK (stress_level >= 1 AND stress_level <= 5),
    mood TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar la seguridad RLS
ALTER TABLE public.headaches ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas RLS
CREATE POLICY "Permitir lectura individual de episodios" 
ON public.headaches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción de episodios propios" 
ON public.headaches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir actualización de episodios propios" 
ON public.headaches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir eliminación de episodios propios" 
ON public.headaches FOR DELETE USING (auth.uid() = user_id);

-- 4. Índices de optimización
CREATE INDEX IF NOT EXISTS headaches_user_id_idx ON public.headaches (user_id);
CREATE INDEX IF NOT EXISTS headaches_date_idx ON public.headaches (date DESC);`;

const DatabaseTab = () => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Cargar configuración inicial
  useEffect(() => {
    const savedUrl = localStorage.getItem('supabase-url') || '';
    const savedKey = localStorage.getItem('supabase-anon-key') || '';
    setUrl(savedUrl);
    setAnonKey(savedKey);
    setIsConnected(isSupabaseConfigured);
  }, []);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA);
      setCopied(true);
      toast({
        title: "Copiado con éxito",
        description: "Esquema SQL copiado al portapapeles. Pégalo en tu SQL Editor de Supabase.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el esquema automáticamente.",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Ingresa la URL y la Anon Key para realizar la prueba.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Guardar temporalmente en localStorage para inicializar cliente de prueba
    const oldUrl = localStorage.getItem('supabase-url');
    const oldKey = localStorage.getItem('supabase-anon-key');
    
    localStorage.setItem('supabase-url', url.trim());
    localStorage.setItem('supabase-anon-key', anonKey.trim());
    
    const wasConfigured = reinitializeSupabase();

    if (!wasConfigured || !supabase) {
      setTestResult({
        success: false,
        message: "Las credenciales ingresadas son inválidas o tienen un formato incorrecto."
      });
      // Restaurar credenciales antiguas
      if (oldUrl) localStorage.setItem('supabase-url', oldUrl);
      else localStorage.removeItem('supabase-url');
      if (oldKey) localStorage.setItem('supabase-anon-key', oldKey);
      else localStorage.removeItem('supabase-anon-key');
      reinitializeSupabase();
      setIsTesting(false);
      return;
    }

    try {
      // Intentar realizar una consulta select de límite 1 para comprobar si la tabla y conexión son correctas
      const { error } = await supabase.from('headaches').select('id').limit(1);
      
      if (error) {
        // Si el error es sobre RLS o tabla no encontrada, lo explicamos detalladamente
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setTestResult({
            success: false,
            message: "Conexión lograda, pero la tabla 'headaches' no existe en tu base de datos. Por favor ejecuta el script SQL de configuración abajo."
          });
        } else {
          setTestResult({
            success: false,
            message: `Error de base de datos (${error.code}): ${error.message}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: "¡Conexión establecida con éxito! La base de datos y la tabla 'headaches' responden perfectamente."
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Error de red: No se pudo conectar a Supabase. Revisa tu URL. (${err.message || err})`
      });
    } finally {
      // Restaurar si el test falló
      if (testResult && !testResult.success) {
        if (oldUrl) localStorage.setItem('supabase-url', oldUrl);
        else localStorage.removeItem('supabase-url');
        if (oldKey) localStorage.setItem('supabase-anon-key', oldKey);
        else localStorage.removeItem('supabase-anon-key');
        reinitializeSupabase();
      }
      setIsTesting(false);
    }
  };

  const handleSaveConnection = () => {
    if (!url.trim() || !anonKey.trim()) {
      toast({
        title: "Campos vacíos",
        description: "Completa la configuración de base de datos.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('supabase-url', url.trim());
    localStorage.setItem('supabase-anon-key', anonKey.trim());
    
    const success = reinitializeSupabase();
    
    if (success) {
      setIsConnected(true);
      toast({
        title: "Conexión en la Nube Activada",
        description: "La base de datos se ha enlazado. Tus registros se sincronizarán al iniciar sesión.",
      });
      // Lanzar evento global para recargar la app
      window.dispatchEvent(new CustomEvent('admin-settings-updated'));
    } else {
      toast({
        title: "Error al activar",
        description: "No se pudieron activar las credenciales en el cliente.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('supabase-url');
    localStorage.removeItem('supabase-anon-key');
    
    reinitializeSupabase();
    setIsConnected(false);
    setUrl('');
    setAnonKey('');
    setTestResult(null);

    toast({
      title: "Base de Datos Desconectada",
      description: "Se eliminaron las credenciales. MigraCare ha vuelto al Modo Local.",
    });

    window.dispatchEvent(new CustomEvent('admin-settings-updated'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. ESTATUS DE CONEXIÓN */}
      <div 
        style={{
          background: isConnected 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)',
          border: isConnected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div 
          style={{
            background: isConnected ? '#e6f4ea' : '#fef3c7',
            padding: '0.75rem',
            borderRadius: '12px',
            color: isConnected ? '#10b981' : '#f59e0b'
          }}
        >
          {isConnected ? <Wifi className="w-6 h-6 animate-pulse" /> : <WifiOff className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 
              className="text-sm font-bold text-slate-800" 
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {isConnected ? "Modo Cloud Sincronizado Activo" : "Modo de Almacenamiento Local"}
            </h3>
            <span 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} 
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isConnected 
              ? "Tus datos médicos se encriptan y sincronizan en la nube (Supabase). Puedes acceder desde cualquier dispositivo."
              : "La aplicación está funcionando en local. Los datos se guardan de forma segura solo en el caché de este navegador."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FORMULARIO DE CONEXIÓN */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Credenciales de Supabase
              </CardTitle>
              <CardDescription className="text-xs">
                Ingresa los datos de conexión que encuentras en el panel de tu proyecto en Supabase (Settings &gt; API).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">
                  Project URL (API URL)
                </label>
                <input
                  type="url"
                  placeholder="https://tu-proyecto.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  disabled={isConnected}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">
                  API Anon Key (Clave Pública)
                </label>
                <textarea
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono h-24 resize-none"
                  disabled={isConnected}
                />
              </div>

              {testResult && (
                <div 
                  className={`p-3.5 rounded-xl border flex gap-2.5 text-xs ${
                    testResult.success 
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                      : 'bg-red-50/50 border-red-100 text-red-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {!isConnected ? (
                  <>
                    <Button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      variant="outline"
                      className="text-xs rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 transition-all"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Probando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Probar Conexión
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSaveConnection}
                      className="text-xs rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                    >
                      Conectar Nube
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleDisconnect}
                    variant="destructive"
                    className="text-xs rounded-xl font-bold hover:bg-red-700 shadow-sm transition-all"
                  >
                    Desconectar de la Nube
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* GUÍA DE CONFIGURACIÓN */}
        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-slate-50/50">
            <CardHeader className="pb-3 border-b border-slate-200/50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-violet-500" />
                <span>¿Cómo empezar gratis?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs text-slate-600 leading-relaxed">
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Crea una cuenta gratuita en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li>
                  Crea un nuevo proyecto en tu organización de Supabase.
                </li>
                <li>
                  Ve a la pestaña de **SQL Editor** en tu barra lateral de Supabase.
                </li>
                <li>
                  Crea una nueva consulta vacía (**New Query**), copia el script SQL abajo con el botón y ejecútalo (**Run**).
                </li>
                <li>
                  ¡Listo! Copia tu URL y API Key de tu proyecto y conéctate arriba.
                </li>
              </ol>

              <div className="pt-2 border-t border-slate-200">
                <Button
                  onClick={handleCopySchema}
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] sm:text-xs font-bold rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50/30 bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1.5 stroke-[3] text-emerald-500" />
                      Copiado con Éxito
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1.5" />
                      Copiar Esquema SQL DDL
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default DatabaseTab;
