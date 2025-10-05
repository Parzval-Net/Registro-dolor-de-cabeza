
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}
      >
        <h3 
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#1e293b',
            margin: 0,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#667eea' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Configuración General
        </h3>
        
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <label 
              htmlFor="appName"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151'
              }}
            >
              Nombre de la Aplicación
            </label>
            <input
              id="appName"
              type="text"
              value={settings.appName}
              onChange={e => updateSetting('appName', e.target.value)}
              placeholder="Nombre de tu aplicación"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p 
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.75rem',
                color: '#64748b',
                margin: 0
              }}
            >
              Este será el título que aparecerá en la pestaña del navegador y en la aplicación
            </p>
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <label 
              htmlFor="appDescription"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151'
              }}
            >
              Descripción de la App
            </label>
            <textarea
              id="appDescription"
              value={settings.appDescription}
              onChange={e => updateSetting('appDescription', e.target.value)}
              placeholder="Descripción de tu aplicación"
              rows={3}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
                resize: 'vertical',
                minHeight: '80px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p 
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.75rem',
                color: '#64748b',
                margin: 0
              }}
            >
              Esta descripción aparecerá en la página principal
            </p>
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <label 
              htmlFor="dashboardDescription"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151'
              }}
            >
              Descripción del Dashboard
            </label>
            <textarea
              id="dashboardDescription"
              value={settings.dashboardDescription}
              onChange={e => updateSetting('dashboardDescription', e.target.value)}
              placeholder="Descripción que aparecerá bajo 'Tu salud en perspectiva'"
              rows={2}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.875rem',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
                resize: 'vertical',
                minHeight: '60px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p 
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '0.75rem',
                color: '#64748b',
                margin: 0
              }}
            >
              Este texto aparece bajo el título principal del dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language" className="text-slate-800 font-bold text-sm sm:text-base">
            Idioma
          </Label>
          <select
            id="language"
            value={settings.language}
            onChange={e => updateSetting('language', e.target.value)}
            className="w-full px-3 py-2 sm:py-3 border-2 border-slate-400 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-slate-500 transition-colors mobile-input"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-slate-800 font-bold text-sm sm:text-base">
            Zona Horaria
          </Label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={e => updateSetting('timezone', e.target.value)}
            className="w-full px-3 py-2 sm:py-3 border-2 border-slate-400 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-slate-500 transition-colors mobile-input"
          >
            <option value="America/Santiago">Santiago</option>
            <option value="America/New_York">New York</option>
            <option value="Europe/Madrid">Madrid</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
