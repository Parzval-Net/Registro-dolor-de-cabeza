import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { HeadacheEntry } from "@/types/headache";
import IntensityLegend from "./IntensityLegend";
import { EpisodeListForDay } from "./EpisodeListForDay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { es } from "date-fns/locale"; // Importación del idioma español

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

interface CalendarViewProps {
  entries: HeadacheEntry[];
}

export default function CalendarView({ entries }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  // Procesar entradas por fecha
  const entriesByDate = useMemo(() => {
    const map: Record<string, HeadacheEntry[]> = {};
    entries.forEach(entry => {
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    });
    return map;
  }, [entries]);

  // Dividir fechas con episodios según su intensidad máxima para crear el mapa de calor (Heat Map)
  const datesMild = useMemo(() => {
    return Object.entries(entriesByDate)
      .filter(([, dayEntries]) => {
        const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
        return maxIntensity <= 3;
      })
      .map(([dateStr]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
  }, [entriesByDate]);

  const datesModerate = useMemo(() => {
    return Object.entries(entriesByDate)
      .filter(([, dayEntries]) => {
        const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
        return maxIntensity >= 4 && maxIntensity <= 6;
      })
      .map(([dateStr]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
  }, [entriesByDate]);

  const datesSevere = useMemo(() => {
    return Object.entries(entriesByDate)
      .filter(([, dayEntries]) => {
        const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
        return maxIntensity >= 7 && maxIntensity <= 8;
      })
      .map(([dateStr]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
  }, [entriesByDate]);

  const datesExtreme = useMemo(() => {
    return Object.entries(entriesByDate)
      .filter(([, dayEntries]) => {
        const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
        return maxIntensity >= 9;
      })
      .map(([dateStr]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
  }, [entriesByDate]);

  // Función para renderizar el contenido interno del día de forma nítida y con alto contraste
  const renderDayContent = (day: Date) => {
    const dateKey = formatDateKey(day);
    const dayEntries = entriesByDate[dateKey];
    const isSelected = selectedDay && formatDateKey(day) === formatDateKey(selectedDay);
    const isToday = formatDateKey(day) === formatDateKey(new Date());
    
    let textClass = "text-slate-700 font-semibold";
    if (isSelected) {
      textClass = "text-white font-extrabold";
    } else if (isToday) {
      textClass = "text-indigo-600 font-extrabold";
    } else if (dayEntries && dayEntries.length > 0) {
      const maxIntensity = Math.max(...dayEntries.map(e => e.intensity));
      if (maxIntensity <= 3) textClass = "text-emerald-900 font-bold";
      else if (maxIntensity <= 6) textClass = "text-orange-950 font-bold";
      else if (maxIntensity <= 8) textClass = "text-rose-950 font-bold";
      else textClass = "text-purple-950 font-bold";
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <span className={`relative z-10 text-xs sm:text-sm ${textClass}`}>
          {day.getDate()}
        </span>
        {dayEntries && dayEntries.length > 0 && !isSelected && (
          <div 
            className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-slate-400/40 ring-1 ring-white/50" 
            title={`${dayEntries.length} episodio(s) registrados`}
          />
        )}
      </div>
    );
  };

  const selectedEntries = selectedDay
    ? entriesByDate[formatDateKey(selectedDay)] || []
    : [];

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-1 sm:p-0">
      
      {/* El título principal se maneja en Index.tsx de manera integrada */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-2">
          <Card className="glass-card-dark border border-slate-200/60 shadow-xl shadow-slate-100/50">
            <CardHeader className="pb-2 sm:pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span>Vista Mensual</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                  Español
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-5">
              <div className="bg-indigo-50/20 rounded-2xl p-2 sm:p-4 border border-indigo-100/30">
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  locale={es} // Calendario en idioma español nativo
                  className="w-full calendar-light-theme mx-auto"
                  numberOfMonths={1}
                  modifiers={{
                    mild: datesMild,
                    moderate: datesModerate,
                    severe: datesSevere,
                    extreme: datesExtreme
                  }}
                  modifiersClassNames={{
                    mild: "rdp-day_mild",
                    moderate: "rdp-day_moderate",
                    severe: "rdp-day_severe",
                    extreme: "rdp-day_extreme"
                  }}
                  components={{
                    DayContent: ({ date }) => renderDayContent(date)
                  }}
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-3 sm:space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-base sm:text-lg font-bold text-slate-800 capitalize",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 sm:h-9 sm:w-9 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all duration-200",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex mb-2",
                    head_cell: "text-slate-400 rounded-md w-8 h-8 sm:w-12 sm:h-10 font-bold text-xs sm:text-sm flex items-center justify-center flex-1 capitalize",
                    row: "flex w-full mb-1.5",
                    cell: "h-8 w-8 sm:h-12 sm:w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex-1",
                    day: "h-8 w-8 sm:h-12 sm:w-12 p-0 font-semibold bg-white border border-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center relative text-xs sm:text-sm touch-manipulation",
                    day_selected: "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 hover:text-white shadow-md shadow-indigo-600/25 z-10",
                    day_today: "bg-indigo-50/80 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/25 font-bold",
                    day_outside: "text-slate-400 bg-slate-50/10 border-slate-100/10 opacity-60",
                    day_disabled: "text-slate-300 bg-slate-50/5 border-slate-100/5",
                  }}
                />
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
          />

          {/* Resumen mensual rápido */}
          <Card className="glass-card-dark border border-slate-200/60 shadow-xl">
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
