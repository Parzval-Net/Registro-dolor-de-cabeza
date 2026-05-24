import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Activity, Calendar } from 'lucide-react';
import { HeadacheEntry } from '@/types/headache';

interface RecentEpisodesListProps {
  entries: HeadacheEntry[];
  getIntensityGradient: (intensity: number) => string;
}

const RecentEpisodesList = ({ entries, getIntensityGradient }: RecentEpisodesListProps) => (
  <Card className="glass-card-dark overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50">
      <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Brain className="h-4 w-4 text-white" />
        </div>
        Últimos 3 Episodios
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      {entries.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto">
            <Calendar className="h-10 w-10 text-violet-400" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-medium">No hay registros aún</p>
            <p className="text-sm text-slate-400">Comienza registrando tu primer episodio</p>
          </div>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getIntensityGradient(entry.intensity)} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-sm">{entry.intensity}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    {(() => {
                      const [year, month, day] = entry.date.split('-').map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      });
                    })()}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    {entry.time && (
                      <>
                        <span>
                          <Activity className="w-3 h-3" />
                        </span>
                        {entry.time}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              </div>
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export default RecentEpisodesList;
