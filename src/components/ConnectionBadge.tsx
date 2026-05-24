import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Database, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectionBadgeProps {
  user?: {
    key?: string;
    email?: string;
    name?: string;
  } | null;
}

type ConnectionState = 'cloud-online' | 'cloud-offline' | 'local-online' | 'local-offline';

export const ConnectionBadge = ({ user }: ConnectionBadgeProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user) return null;

  // Determinar si la cuenta es en la nube (Supabase) o local
  // Un usuario local usa su email como key (contiene '@')
  // Un usuario en la nube usa el UUID de Supabase (no contiene '@')
  const isCloudAccount = isSupabaseConfigured && user.key && !user.key.includes('@');

  // Determinar el estado combinado
  let state: ConnectionState = 'local-online';
  if (isCloudAccount) {
    state = isOnline ? 'cloud-online' : 'cloud-offline';
  } else {
    state = isOnline ? 'local-online' : 'local-offline';
  }

  // Definir estilos y contenidos específicos para cada estado
  const stateConfig = {
    'cloud-online': {
      label: 'Sincronizado',
      shortLabel: 'Nube',
      tooltipTitle: 'Conexión Segura en la Nube',
      tooltipDesc: 'Tus datos están sincronizados en tiempo real con Supabase Cloud. Puedes acceder a ellos desde cualquier dispositivo.',
      badgeClass: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400',
      dotClass: 'bg-emerald-500',
      pingClass: 'bg-emerald-400',
      Icon: Cloud,
    },
    'cloud-offline': {
      label: 'Cambios locales',
      shortLabel: 'Sin Conexión',
      tooltipTitle: 'Modo Offline (Nube Activa)',
      tooltipDesc: 'No tienes conexión a internet. Los nuevos datos se guardarán localmente de forma segura y se subirán a la nube automáticamente cuando vuelvas a conectarte.',
      badgeClass: 'bg-amber-50/70 border-amber-200/50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400',
      dotClass: 'bg-amber-500',
      pingClass: 'bg-amber-400',
      Icon: CloudOff,
    },
    'local-online': {
      label: 'Almacenamiento Local',
      shortLabel: 'Local',
      tooltipTitle: 'Modo Local Activo',
      tooltipDesc: 'Estás usando una cuenta local. Los datos se guardan exclusivamente en el almacenamiento de este navegador. Configura la base de datos para sincronizar con la nube.',
      badgeClass: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400',
      dotClass: 'bg-indigo-500',
      pingClass: 'bg-indigo-400',
      Icon: Database,
    },
    'local-offline': {
      label: 'Sin Red (Local)',
      shortLabel: 'Sin Red',
      tooltipTitle: 'Sin Conexión a Internet',
      tooltipDesc: 'No tienes acceso a internet y estás usando almacenamiento local. Tus datos siguen guardándose localmente en este dispositivo.',
      badgeClass: 'bg-rose-50/70 border-rose-200/50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800/30 dark:text-rose-400',
      dotClass: 'bg-rose-500',
      pingClass: 'bg-rose-400',
      Icon: WifiOff,
    },
  };

  const config = stateConfig[state];
  const StatusIcon = config.Icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium backdrop-blur-md transition-all duration-300 ease-in-out cursor-pointer hover:shadow-sm ${config.badgeClass}`}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {/* Indicador de punto brillante con efecto ping */}
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingClass}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`}></span>
          </span>

          {/* Icono de estado */}
          <StatusIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />

          {/* Texto descriptivo (Completo en tablets/desktops, corto en móviles) */}
          <span className="hidden sm:inline whitespace-nowrap">{config.label}</span>
          <span className="sm:hidden whitespace-nowrap">{config.shortLabel}</span>
        </div>
      </TooltipTrigger>
      
      <TooltipContent 
        side="bottom" 
        align="end" 
        className="max-w-[280px] p-3 border border-slate-200/80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
            <span>{config.tooltipTitle}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
            {config.tooltipDesc}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ConnectionBadge;
