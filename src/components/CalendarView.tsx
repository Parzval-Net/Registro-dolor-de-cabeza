import { useState, useMemo } from "react";
import { HeadacheEntry } from "@/types/headache";
import IntensityLegend from "./IntensityLegend";
import { EpisodeListForDay } from "./EpisodeListForDay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, BrainCircuit, Calendar as CalendarIcon, Sparkles } from "lucide-react";

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

interface CalendarViewProps {
  entries: HeadacheEntry[];
  onNewEntry?: (dateStr: string) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export default function CalendarView({ entries, onNewEntry }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Procesar entradas por fecha
  const entriesByDate = useMemo(() => {
    const map: Record<string, HeadacheEntry[]> = {};
    entries.forEach(entry => {
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    });
    return map;
  }, [entries]);

  // Navegación de meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDay(day);
    // Si el día está fuera del mes actual, cambiar el mes de visualización
    if (day.getMonth() !== month || day.getFullYear() !== year) {
      setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  // Generar cuadrícula de días (semana inicia en Lunes)
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Obtener primer día de la semana (0: Domingo, 1: Lunes...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Ajustar para que Lunes sea 0 y Domingo sea 6
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Celdas del mes anterior (Outside Days)
    const prevMonthDays = new Date(year, month, 0).getDate();
    const previousCells = [];
    for (let i = startDay - 1; i >= 0; i--) {
      previousCells.push(new Date(year, month - 1, prevMonthDays - i));
    }

    // Celdas del mes actual
    const currentCells = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentCells.push(new Date(year, month, i));
    }

    // Celdas del mes siguiente
    const totalCells = previousCells.length + currentCells.length;
    const remaining = 42 - totalCells; // Cuadrícula de 6 filas (42 celdas)
    const nextCells = [];
    for (let i = 1; i <= remaining; i++) {
      nextCells.push(new Date(year, month + 1, i));
    }

    return [...previousCells, ...currentCells, ...nextCells];
  }, [year, month]);

  const selectedEntries = selectedDay
    ? entriesByDate[formatDateKey(selectedDay)] || []
    : [];

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-1 sm:p-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-2">
          <Card className="glass-card border border-slate-200/60 shadow-xl shadow-slate-100/50 overflow-hidden">
            <CardHeader className="pb-2 sm:pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span>Calendario de Episodios</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                  Español
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-5">
              <div className="bg-indigo-50/20 rounded-2xl p-2 sm:p-4 border border-indigo-100/30">
                {/* Cabecera del Calendario: Mes, Año y Controles */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 capitalize font-outfit">
                    {MONTHS[month]} {year}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 sm:p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all duration-200 touch-manipulation"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 sm:p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all duration-200 touch-manipulation"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="text-slate-400 font-bold text-center text-xs sm:text-sm py-1 capitalize"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Cuadrícula de días */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells.map((cellDate, idx) => {
                    const cellKey = formatDateKey(cellDate);
                    const dayEntries = entriesByDate[cellKey];
                    const isSelected = selectedDay && cellKey === formatDateKey(selectedDay);
                    const isToday = cellKey === formatDateKey(new Date());
                    const isCurrentMonth = cellDate.getMonth() === month && cellDate.getFullYear() === year;
                    
                    // Determinar el estilo de fondo según la intensidad máxima registrada en el día
                    let bgClass = "bg-white/80 dark:bg-slate-900/60 border border-slate-100 hover:bg-indigo-50/50 hover:text-indigo-600";
                    let textClass = "text-slate-700 font-semibold";
                    
                    if (!isCurrentMonth) {
                      bgClass = "bg-slate-50/30 dark:bg-slate-950/10 border-slate-100/50 opacity-40 hover:bg-indigo-50/30";
                      textClass = "text-slate-400 font-normal";
                    }

                    if (dayEntries && dayEntries.length > 0 && isCurrentMonth) {
                      const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
                      if (maxIntensity <= 3) {
                        bgClass = "bg-emerald-50/70 border-emerald-100/60 text-emerald-800 hover:bg-emerald-100/80";
                        textClass = "text-emerald-850 font-bold";
                      } else if (maxIntensity <= 6) {
                        bgClass = "bg-orange-50/70 border-orange-100/60 text-orange-800 hover:bg-orange-100/80";
                        textClass = "text-orange-900 font-bold";
                      } else if (maxIntensity <= 8) {
                        bgClass = "bg-red-50/70 border-red-100/60 text-red-800 hover:bg-red-100/80";
                        textClass = "text-red-900 font-bold";
                      } else {
                        bgClass = "bg-red-100/60 border-red-200/60 text-red-950 hover:bg-red-200/80";
                        textClass = "text-red-950 font-bold";
                      }
                    }

                    if (isToday && isCurrentMonth && !isSelected) {
                      bgClass = "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 font-bold text-indigo-700 hover:bg-indigo-100/70";
                      textClass = "text-indigo-700 font-extrabold";
                    }

                    if (isSelected) {
                      bgClass = "bg-indigo-600 border-indigo-500 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 z-10";
                      textClass = "text-white font-extrabold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectDay(cellDate)}
                        className={`h-9 w-full sm:h-12 rounded-xl flex flex-col items-center justify-center relative custom-calendar-cell touch-manipulation outline-none ${bgClass}`}
                        style={{ minHeight: "40px" }}
                      >
                        <span className={`relative z-10 text-xs sm:text-sm ${textClass}`}>
                          {cellDate.getDate()}
                        </span>
                        
                        {/* Indicadores de intensidad en puntos de colores */}
                        {dayEntries && dayEntries.length > 0 && isCurrentMonth && (
                          <div className="absolute bottom-1.5 flex gap-0.5 sm:gap-1 justify-center items-center z-20">
                            {dayEntries.slice(0, 3).map((entry, dIdx) => {
                              let dotColor = "bg-emerald-500 shadow-emerald-500/20";
                              if (entry.intensity >= 9) dotColor = "bg-red-700 shadow-red-700/20";
                              else if (entry.intensity >= 7) dotColor = "bg-red-500 shadow-red-500/20";
                              else if (entry.intensity >= 4) dotColor = "bg-orange-500 shadow-orange-500/20";
                              
                              return (
                                <div 
                                  key={entry.id || dIdx}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm ${dotColor} ${isSelected ? 'ring-1 ring-white' : 'ring-[0.5px] ring-white/30'}`}
                                  title={`Episodio de intensidad ${entry.intensity}`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral: Leyenda, Episodios del día seleccionado y Resumen */}
        <div className="space-y-4">
          <IntensityLegend />
          
          <EpisodeListForDay 
            date={selectedDay} 
            entries={selectedEntries} 
            onNewEntry={onNewEntry}
          />

          {/* Resumen mensual rápido */}
          <Card className="glass-card border border-slate-200/60 shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Resumen Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100/50">
                  <span className="text-slate-500 font-medium">Total episodios registrados:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{entries.length}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100/50">
                  <span className="text-slate-500 font-medium">Días con dolor:</span>
                  <span className="font-bold text-slate-800 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                    {Object.keys(entriesByDate).length}
                  </span>
                </div>
                {entries.length > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Intensidad promedio general:</span>
                    <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-md shadow-sm">
                      {(entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1)} / 10
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
