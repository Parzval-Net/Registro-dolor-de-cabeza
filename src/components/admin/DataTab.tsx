import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface DataTabProps {
  settings: AdminSettings;
  onSettingsChange: (settings: AdminSettings) => void;
}

const DataTab = ({ settings, onSettingsChange }: DataTabProps) => {
  const { toast } = useToast();

  const updateSetting = (key: keyof AdminSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const exportData = () => {
    try {
      const data = {
        settings: localStorage.getItem('admin-settings'),
        medications: localStorage.getItem('custom-medications'),
        users: localStorage.getItem('migracare-users-v1'),
        supabaseUrl: localStorage.getItem('supabase-url'),
        supabaseAnonKey: localStorage.getItem('supabase-anon-key')
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `migracare-respaldo-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Copia de seguridad creada",
        description: "El archivo JSON de respaldo se ha descargado exitosamente."
      });
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast({
        title: "Error de exportación",
        description: "No se pudo generar la copia de seguridad de la aplicación.",
        variant: "destructive"
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.settings) localStorage.setItem('admin-settings', data.settings);
        if (data.medications) localStorage.setItem('custom-medications', data.medications);
        if (data.users) localStorage.setItem('migracare-users-v1', data.users);
        if (data.supabaseUrl) localStorage.setItem('supabase-url', data.supabaseUrl);
        if (data.supabaseAnonKey) localStorage.setItem('supabase-anon-key', data.supabaseAnonKey);

        toast({
          title: "Datos restaurados con éxito",
          description: "La base de datos y la configuración han sido importadas. Reiniciando...",
        });

        // Recargar la página tras 1.5s para aplicar todos los cambios de sesión y base
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('Error al importar datos:', error);
        toast({
          title: "Error de restauración",
          description: "El archivo seleccionado no es un respaldo válido de MigraCare.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('🚨 ¡ATENCIÓN! ¿Estás seguro de que quieres eliminar TODOS los datos locales? Esto incluye cuentas locales, episodios registrados, vademécum de medicamentos y claves de base de datos. Esta acción no se puede deshacer.')) {
      localStorage.removeItem('migracare-users-v1');
      localStorage.removeItem('migracare-session-v1');
      localStorage.removeItem('custom-medications');
      localStorage.removeItem('supabase-url');
      localStorage.removeItem('supabase-anon-key');
      localStorage.removeItem('admin-settings');
      localStorage.removeItem('admin-authenticated');
      
      toast({
        title: "Reinicio de fábrica completado",
        description: "Se han eliminado por completo todos los registros y configuraciones locales.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SECCIÓN 1: CONFIGURACIÓN GENERAL DE EXPORTACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-4">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <Database className="w-5 h-5 text-indigo-500" />
                <span>Gestión de Copias de Seguridad</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Exporta la base de datos completa de pacientes, vademécum e historial clínico o restáuralos a partir de un respaldo previo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              <div className="space-y-1.5">
                <Label htmlFor="exportFormat" className="text-xs font-bold text-slate-600 block">
                  Formato de Descarga Predeterminado
                </Label>
                <select
                  id="exportFormat"
                  value={settings.exportFormat}
                  onChange={e => updateSetting('exportFormat', e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-semibold transition-all"
                >
                  <option value="JSON">JSON (Respaldo Completo del Sistema)</option>
                  <option value="CSV">CSV (Hojas de Cálculo / Excel)</option>
                  <option value="PDF">PDF (Reportes Clínicos Imprimibles)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Nota: Las funciones de importación de sistema solo admiten el formato JSON oficial generado por esta consola.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={exportData}
                  className="text-xs rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 py-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Respaldo</span>
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="import-file"
                  />
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs rounded-xl font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50/50 bg-white transition-all flex items-center justify-center gap-1.5 py-2.5 cursor-pointer"
                  >
                    <label htmlFor="import-file">
                      <Upload className="w-4 h-4" />
                      <span>Restaurar Respaldo</span>
                    </label>
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ALERTA DE SEGURIDAD / ELIMINACIÓN */}
        <div className="space-y-4">
          <Card className="border border-red-200 shadow-sm rounded-2xl overflow-hidden bg-red-50/40">
            <CardHeader className="pb-3 border-b border-red-100 flex items-center gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold text-red-800 flex items-center gap-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                <span>Zona de Peligro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs text-red-800 leading-relaxed">
              <p>
                El reinicio de fábrica limpia por completo el motor de almacenamiento de MigraCare en este navegador web. Se borrarán todas las contraseñas hasheadas y registros de pacientes.
              </p>
              
              <Button
                onClick={clearAllData}
                variant="destructive"
                className="w-full text-xs rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 py-2.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reinicio de Fábrica</span>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default DataTab;
