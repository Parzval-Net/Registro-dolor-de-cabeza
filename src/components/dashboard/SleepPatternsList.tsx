
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

interface SleepPatternsListProps {
  entries: any[];
}

const SleepPatternsList = ({ entries }: SleepPatternsListProps) => {
  // Calcular estadísticas de sueño
  const sleepData = entries
    .filter(entry => entry.sleepHours !== undefined && entry.sleepHours !== null)
    .map(entry => ({ sleepHours: entry.sleepHours, date: entry.date }));

  const averageSleep = sleepData.length > 0 
    ? sleepData.reduce((sum, item) => sum + (item.sleepHours || 0), 0) / sleepData.length
    : 0;

  const sleepRanges = {
    'Menos de 6h': sleepData.filter(item => (item.sleepHours || 0) < 6).length,
    '6-8 horas': sleepData.filter(item => (item.sleepHours || 0) >= 6 && (item.sleepHours || 0) <= 8).length,
    'Más de 8h': sleepData.filter(item => (item.sleepHours || 0) > 8).length,
  };

  const getSleepQualityColor = (hours: number) => {
    if (hours < 6) return 'from-red-500 to-rose-500';
    if (hours >= 6 && hours <= 8) return 'from-green-500 to-emerald-500';
    return 'from-blue-500 to-indigo-500';
  };

  return (
    <Card className="glass-card-dark overflow-hidden border border-slate-200/50 dark:border-slate-800/40 shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-slate-900/60 dark:to-indigo-950/40 border-b border-indigo-100/20 dark:border-indigo-900/30">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
            <Moon className="h-4 w-4 text-white" />
          </div>
          Patrones de Descanso
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4 bg-white/40 dark:bg-slate-900/20">
        {sleepData.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto">
              <Moon className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-600 font-medium">Sin datos de sueño registrados</p>
              <p className="text-sm text-slate-400">Registra más episodios para ver patrones</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Promedio de sueño */}
            <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800/30 bg-white/70 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md bg-gradient-to-br ${getSleepQualityColor(averageSleep)}`}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Promedio de sueño</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{averageSleep.toFixed(1)} horas por noche</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución de rangos de sueño */}
            {Object.entries(sleepRanges).map(([range, count], index) => (
              count > 0 && (
                <div key={range} className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800/30 bg-white/70 dark:bg-slate-900/40 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-red-500 to-rose-500' : 
                        index === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 
                        'bg-gradient-to-br from-blue-500 to-indigo-500'
                      }`}>
                        {count}
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{range}</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{count} episodios registrado{count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
                          index === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                          'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`} style={{width: `${(count / Math.max(...Object.values(sleepRanges))) * 100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepPatternsList;
