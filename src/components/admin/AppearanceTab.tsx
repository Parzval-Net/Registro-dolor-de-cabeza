import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconSelector from '@/components/IconSelector';
import { Palette, Sparkles } from 'lucide-react';

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

interface AppearanceTabProps {
  settings: AdminSettings;
  onSettingsChange: (settings: AdminSettings) => void;
}

const PALETTE_PRESETS = [
  {
    id: 'violet-blossom',
    name: 'Violeta Floreciente',
    desc: 'Tema clínico vibrante por defecto',
    primary: '#8B5CF6',
    secondary: '#EC4899'
  },
  {
    id: 'ocean-calm',
    name: 'Calma Oceánica',
    desc: 'Tonos relajantes de agua y cielo',
    primary: '#0EA5E9',
    secondary: '#10B981'
  },
  {
    id: 'emerald-healing',
    name: 'Sanación Esmeralda',
    desc: 'Gradiente orgánico y sanador',
    primary: '#10B981',
    secondary: '#3B82F6'
  },
  {
    id: 'ruby-relieve',
    name: 'Alivio de Rubí',
    desc: 'Tonalidad cálida y reconfortante',
    primary: '#EF4444',
    secondary: '#F59E0B'
  },
  {
    id: 'charcoal-refines',
    name: 'Carbón Refinado',
    desc: 'Estética minimalista y sobria',
    primary: '#1E293B',
    secondary: '#64748B'
  },
  {
    id: 'electric-night',
    name: 'Noche Eléctrica',
    desc: 'Gradiente místico y profundo',
    primary: '#4F46E5',
    secondary: '#8A5CF6'
  }
];

const AppearanceTab = ({ settings, onSettingsChange }: AppearanceTabProps) => {
  const updateSetting = (key: keyof AdminSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleApplyPreset = (primary: string, secondary: string) => {
    onSettingsChange({
      ...settings,
      primaryColor: primary,
      secondaryColor: secondary
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. PALETAS DE COLORES PRESTABLECIDAS - SELECCIÓN EXTREMADAMENTE VISUAL */}
      <div className="space-y-3">
        <Label className="text-slate-800 font-bold text-sm sm:text-base flex items-center gap-1.5">
          <Palette className="w-5 h-5 text-indigo-500" />
          <span>Paletas de Colores Clínicas (Temas)</span>
        </Label>
        <p className="text-xs text-slate-500 leading-relaxed">
          Elige una paleta diseñada profesionalmente para cambiar por completo el gradiente de fondo, botones, bordes y acentos de tu dashboard clínico de manera instantánea.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {PALETTE_PRESETS.map((preset) => {
            const isSelected = settings.primaryColor === preset.primary && settings.secondaryColor === preset.secondary;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.primary, preset.secondary)}
                className="flex flex-col text-left p-3.5 bg-white border rounded-2xl transition-all duration-300 relative hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none group"
                style={{
                  borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                  borderWidth: isSelected ? '2px' : '1px',
                  boxShadow: isSelected ? '0 8px 20px rgba(99, 102, 241, 0.08)' : 'none'
                }}
              >
                {/* Visual gradient capsule */}
                <div 
                  className="w-full h-7 rounded-lg mb-2.5 relative overflow-hidden flex"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`
                  }}
                >
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h4 className="text-xs font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {preset.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  {preset.desc}
                </p>

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm p-0.5">
                    <span className="text-[9px] font-extrabold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. CONFIGURACIÓN MANUAL DE COLORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Color picker primario */}
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="text-slate-700 font-bold text-xs">
            Personalizar Color Primario
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="primaryColor"
              type="color"
              value={settings.primaryColor}
              onChange={e => updateSetting('primaryColor', e.target.value)}
              className="w-11 h-11 rounded-xl border border-slate-200 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={settings.primaryColor}
              onChange={e => updateSetting('primaryColor', e.target.value)}
              placeholder="#8B5CF6"
              className="text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl"
            />
          </div>
          <p className="text-[10px] text-slate-400">Controla el color inicial del gradiente de fondo y botones principales.</p>
        </div>

        {/* Color picker secundario */}
        <div className="space-y-2">
          <Label htmlFor="secondaryColor" className="text-slate-700 font-bold text-xs">
            Personalizar Color Secundario
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="secondaryColor"
              type="color"
              value={settings.secondaryColor}
              onChange={e => updateSetting('secondaryColor', e.target.value)}
              className="w-11 h-11 rounded-xl border border-slate-200 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={settings.secondaryColor}
              onChange={e => updateSetting('secondaryColor', e.target.value)}
              placeholder="#EC4899"
              className="text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl"
            />
          </div>
          <p className="text-[10px] text-slate-400">Controla el color final del gradiente y los acentos visuales.</p>
        </div>

      </div>

      <hr className="border-slate-100" />

      {/* 3. ICONO DE LA APLICACIÓN */}
      <div className="space-y-2.5">
        <Label className="text-slate-800 font-bold text-sm sm:text-base flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Icono de la Aplicación (Logotipo)</span>
        </Label>
        <p className="text-xs text-slate-500 leading-relaxed">
          Selecciona el icono principal que se muestra en el encabezado de navegación de tu dashboard.
        </p>
        
        <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <IconSelector
            selectedIcon={settings.appIcon}
            onIconSelect={(icon) => updateSetting('appIcon', icon)}
          />
        </div>
      </div>

    </div>
  );
};

export default AppearanceTab;
