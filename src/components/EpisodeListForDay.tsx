
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeadacheEntry } from "@/types/headache";
import { Clock, Zap, Pill, AlertTriangle, Calendar } from "lucide-react";

interface Props {
  date?: Date;
  entries: HeadacheEntry[];
  onNewEntry?: (dateStr: string) => void;
}

const getIntensityColor = (intensity: number) => {
  if (intensity <= 3) return "bg-emerald-500 text-white shadow-sm shadow-emerald-500/10";
  if (intensity <= 6) return "bg-orange-500 text-white shadow-sm shadow-orange-500/10";
  if (intensity <= 8) return "bg-red-500 text-white shadow-sm shadow-red-500/10";
  return "bg-red-700 text-white shadow-sm shadow-red-700/10";
};

const getIntensityText = (intensity: number) => {
  if (intensity <= 3) return "Leve";
  if (intensity <= 6) return "Moderado";
  if (intensity <= 8) return "Severo";
  return "Extremo";
};

export function EpisodeListForDay({ date, entries, onNewEntry }: Props) {
  if (!date) {
    return (
      <Card className="glass-card-dark border border-slate-300/30 shadow-lg">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-slate-500">
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">Selecciona una fecha para ver los episodios</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dateString = date.toLocaleDateString("es-ES", { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="glass-card-dark border border-slate-300/30 shadow-lg">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 capitalize">
          {dateString}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {entries.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="bg-white/95 rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
                {/* Header del episodio */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getIntensityColor(entry.intensity)}`}>
                      {entry.intensity}/10
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {getIntensityText(entry.intensity)}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-600 text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {entry.time}
                  </div>
                </div>

                {/* Duración */}
                <div className="flex items-center text-slate-700 text-xs sm:text-sm mb-3">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Duración: {entry.duration}h</span>
                </div>

                {/* Síntomas */}
                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-slate-800 text-xs sm:text-sm font-medium mb-2">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-600" />
                      Síntomas
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.symptoms.slice(0, 3).map((symptom, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-slate-700 text-white border-slate-600">
                          {symptom}
                        </Badge>
                      ))}
                      {entry.symptoms.length > 3 && (
                        <Badge variant="outline" className="text-xs text-slate-700 border-slate-400">
                          +{entry.symptoms.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Medicamentos */}
                {entry.medications && entry.medications.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-slate-800 text-xs sm:text-sm font-medium mb-2">
                      <Pill className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                      Medicamentos
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.medications.slice(0, 2).map((med, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-slate-700 border-blue-400 bg-blue-50">
                          {med}
                        </Badge>
                      ))}
                      {entry.medications.length > 2 && (
                        <Badge variant="outline" className="text-xs text-slate-700 border-slate-400">
                          +{entry.medications.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Desencadenantes */}
                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">Posibles desencadenantes:</span> {entry.triggers.slice(0, 2).join(", ")}
                      {entry.triggers.length > 2 && ` (+${entry.triggers.length - 2} más)`}
                    </p>
                  </div>
                )}

                {/* Notas */}
                {entry.notes && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <p className="text-xs text-slate-700 italic">"{entry.notes}"</p>
                  </div>
                )}
              </div>
            ))}
            {onNewEntry && (
              <button
                onClick={() => {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  onNewEntry(dateStr);
                }}
                className="w-full mt-2 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span>➕</span>
                Registrar otro episodio
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-slate-500 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl sm:text-2xl">😌</span>
              </div>
              <p className="text-sm font-medium text-slate-700">Sin episodios registrados</p>
              <p className="text-xs text-slate-600 mt-1">
                ¡Qué bueno! No hay migrañas registradas en esta fecha.
              </p>
              {onNewEntry && (
                <button
                  onClick={() => {
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    onNewEntry(dateStr);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-all duration-200 flex items-center justify-center gap-1.5 mx-auto active:scale-[0.98]"
                >
                  <span>📝</span>
                  Registrar dolor para este día
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
