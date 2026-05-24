import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Settings2, Sparkles, MapPin, Languages } from 'lucide-react';

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

interface GeneralTabProps {
  settings: AdminSettings;
  onSettingsChange: (settings: AdminSettings) => void;
}

const GeneralTab = ({ settings, onSettingsChange }: GeneralTabProps) => {
  const updateSetting = (key: keyof AdminSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. INFORMACIÓN BÁSICA DE LA APLICACIÓN */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <span>Identidad de la Aplicación</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Modifica la marca, nombres y leyendas clínicas que se muestran a tus pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          
          <div className="space-y-1.5">
            <Label htmlFor="appName" className="text-xs font-bold text-slate-600">
              Nombre Comercial de la App
            </Label>
            <Input
              id="appName"
              type="text"
              value={settings.appName}
              onChange={e => updateSetting('appName', e.target.value)}
              placeholder="Ej. MigraCare"
              className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 font-semibold transition-all"
            />
            <p className="text-[10px] text-slate-400">
              Este nombre se mostrará en el encabezado de navegación y en la pestaña del navegador.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appDescription" className="text-xs font-bold text-slate-600">
              Eslogan / Descripción del Portal
            </Label>
            <Textarea
              id="appDescription"
              value={settings.appDescription}
              onChange={e => updateSetting('appDescription', e.target.value)}
              placeholder="Descripción que se muestra en el panel de bienvenida."
              className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 font-semibold transition-all h-20 resize-none"
            />
            <p className="text-[10px] text-slate-400">
              Aparecerá en el portal de inicio de sesión de tus usuarios.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dashboardDescription" className="text-xs font-bold text-slate-600">
              Texto Introductorio del Dashboard
            </Label>
            <Textarea
              id="dashboardDescription"
              value={settings.dashboardDescription}
              onChange={e => updateSetting('dashboardDescription', e.target.value)}
              placeholder="Breve reseña sobre el análisis y seguimiento clínico del paciente."
              className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 font-semibold transition-all h-20 resize-none"
            />
            <p className="text-[10px] text-slate-400">
              Se visualiza debajo del saludo principal una vez iniciada la sesión.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* 2. IDIOMA Y ZONA HORARIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Idioma */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Languages className="w-4 h-4 text-violet-500" />
              <span>Idioma Predeterminado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <select
              id="language"
              value={settings.language}
              onChange={e => updateSetting('language', e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-semibold transition-all"
            >
              <option value="es">Español (Chile / Latam)</option>
              <option value="en">English (US / UK)</option>
              <option value="fr">Français (FR)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Define el lenguaje principal del calendario y las listas clínicas de reportes.
            </p>
          </CardContent>
        </Card>

        {/* Zona Horaria */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <MapPin className="w-4 h-4 text-violet-500" />
              <span>Zona Horaria (Timezone)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <select
              id="timezone"
              value={settings.timezone}
              onChange={e => updateSetting('timezone', e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-semibold transition-all"
            >
              <option value="America/Santiago">Santiago (GMT-4 / GMT-3)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/Madrid">Madrid (CET)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Esencial para corregir y mapear desfases de fechas locales en el diario de dolores.
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default GeneralTab;
