import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Database, 
  Palette, 
  Pill, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Delay de simulación para realismo y seguridad anti-fuerza bruta
    await new Promise(resolve => setTimeout(resolve, 800));

    // Obtener contraseña personalizada o la por defecto
    const savedAdminPassword = localStorage.getItem('admin-password');
    const isValidUsername = username.trim().toLowerCase() === 'admin';
    
    let isPasswordCorrect = false;
    if (savedAdminPassword) {
      isPasswordCorrect = password === savedAdminPassword;
    } else {
      isPasswordCorrect = password === 'admin123';
    }

    if (isValidUsername && isPasswordCorrect) {
      localStorage.setItem('admin-authenticated', 'true');
      localStorage.setItem('admin-session-timestamp', Date.toString());
      
      // Registrar log de auditoría exitoso
      const logs = JSON.parse(localStorage.getItem('admin-audit-logs') || '[]');
      logs.unshift({
        timestamp: new Date().toISOString(),
        success: true,
        browser: navigator.userAgent.substring(0, 50) + "..."
      });
      localStorage.setItem('admin-audit-logs', JSON.stringify(logs.slice(0, 10))); // Limitar a 10 logs

      toast({
        title: "Acceso autorizado",
        description: "Sesión administrativa inicializada con éxito.",
      });
      onAuthenticated();
    } else {
      // Registrar log de auditoría fallido
      const logs = JSON.parse(localStorage.getItem('admin-audit-logs') || '[]');
      logs.unshift({
        timestamp: new Date().toISOString(),
        success: false,
        browser: navigator.userAgent.substring(0, 50) + "..."
      });
      localStorage.setItem('admin-audit-logs', JSON.stringify(logs.slice(0, 10)));

      toast({
        title: "Error de seguridad",
        description: "El usuario o la contraseña ingresados son incorrectos.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const adminFeatures = [
    {
      icon: Database,
      title: "Base de Datos en Tiempo Real",
      desc: "Configura la URL de tu API y tu Anon Key para sincronizar datos en la nube (Supabase)."
    },
    {
      icon: Palette,
      title: "Control de Marca y Visuales",
      desc: "Personaliza el nombre de la app, colores del gradiente y logotipos de tu dashboard."
    },
    {
      icon: Pill,
      title: "Gestión de Medicamentos",
      desc: "Añade, edita y administra el vademécum de medicamentos disponibles para tus registros."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/40 shadow-xl overflow-hidden animate-fade-in">
        
        {/* LADO IZQUIERDO: DECORACIÓN E INFORMACIÓN DE CARACTERÍSTICAS (COSMIC SLICK AESTHETIC) */}
        <div className="md:col-span-6 space-y-6 select-none pr-0 md:pr-4">
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACCESO EXCLUSIVO SISTEMA</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Consola de Personalización
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Modifica la identidad, los datos relacionales en la nube y el vademécum médico del sistema de manera centralizada.
            </p>
          </div>

          {/* Feature list with pristine micro-designs */}
          <div className="space-y-4 pt-2">
            {adminFeatures.map((feat, idx) => (
              <div key={idx} className="flex gap-3 bg-white/70 p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:translate-x-1 duration-300">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 shrink-0 flex items-center justify-center">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {feat.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO DE ACCESO AUTENTICADO */}
        <div className="md:col-span-6">
          <Card className="border border-slate-200/50 shadow-lg rounded-2xl overflow-hidden bg-white/95">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Autenticación de Administrador
                </h3>
                <p className="text-xs text-slate-400">
                  Ingresa tus credenciales para autorizar cambios en el sistema.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-bold text-slate-600">
                    Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa admin"
                    required
                    className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all font-semibold"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-600">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña por defecto: admin123"
                      required
                      className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 pr-10 transition-all font-semibold"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 py-3 transition-all hover:shadow-lg text-xs sm:text-sm cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Validando Firma...</span>
                    ) : (
                      <>
                        <span>Ingresar a Ajustes</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

              </form>

              {/* Helpful Hint Card with micro-indicator */}
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 text-[10px] text-indigo-700 flex gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Por defecto: **admin** / **admin123**. Puedes cambiar la contraseña en la pestaña de Seguridad al ingresar.
                </span>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminAuth;
