import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Shield, Key, History, CheckCircle2, XCircle } from 'lucide-react';

interface SecurityTabProps {
  onChangePassword: () => void;
}

interface AuditLog {
  timestamp: string;
  success: boolean;
  browser: string;
}

const SecurityTab = ({ onChangePassword }: SecurityTabProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('admin-audit-logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error('Error al cargar logs de auditoría:', err);
      }
    }
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SECCIÓN PRINCIPAL: CREDENCIALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA 1: CAMBIO DE CREDENCIALES */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Lock className="w-5 h-5 text-indigo-500" />
              <span>Contraseña de Acceso</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Modifica la clave de seguridad para el ingreso a la configuración del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 space-y-3.5">
              <p className="text-xs text-indigo-800 leading-relaxed">
                Cambiar la contraseña por defecto (**admin123**) evita accesos no autorizados a la configuración de base de datos relacional y catálogo de medicamentos de tu servidor.
              </p>
              <Button
                onClick={onChangePassword}
                className="w-full sm:w-auto text-xs rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Cambiar Contraseña</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: RECOMENDACIONES DE ROBUSTEZ */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-slate-50/40">
          <CardHeader className="pb-3 border-b border-slate-200/50">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Shield className="w-5 h-5 text-violet-500" />
              <span>Recomendaciones Clínicas de Privacidad</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs text-slate-600">
            <div className="space-y-3 leading-relaxed">
              <div className="flex gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-violet-600">01.</span>
                <span>Las migrañas y triggers son **información médica altamente sensible**. Evita compartir accesos.</span>
              </div>
              <div className="flex gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-violet-600">02.</span>
                <span>Almacena tu contraseña en un gestor seguro y usa al menos 8 caracteres con números y letras.</span>
              </div>
              <div className="flex gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-violet-600">03.</span>
                <span>Si el dispositivo es de uso compartido, recuerda **Cerrar Sesión** en el panel de administrador tras terminar.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HISTORIAL DE AUDITORÍA (AUDIT LOGS CARD) - ULTRA PREMIUM */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-3 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <History className="w-5 h-5 text-indigo-500" />
              <span>Auditoría de Accesos Recientes</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Historial de los últimos 5 intentos de inicio de sesión administrativo en este navegador.
            </CardDescription>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold w-fit">
            Monitoreo Local Activo
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay logs de auditoría disponibles todavía. Los intentos se registrarán aquí automáticamente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <th className="p-3.5">Fecha y Hora</th>
                    <th className="p-3.5">Estatus de Acceso</th>
                    <th className="p-3.5 hidden sm:table-cell">Dispositivo / Agente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.slice(0, 5).map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-3.5 font-medium text-slate-700 font-mono">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="p-3.5">
                        {log.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Exitoso</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">
                            <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Fallido</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[10px] hidden sm:table-cell max-w-xs truncate" title={log.browser}>
                        {log.browser}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default SecurityTab;
