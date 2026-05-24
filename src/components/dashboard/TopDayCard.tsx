
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HeadacheEntry } from '@/types/headache';

interface TopDayCardProps {
  entries: HeadacheEntry[];
}

const TopDayCard = ({ entries }: TopDayCardProps) => {
  const getDayWithMostEpisodes = () => {
    const dayCount: Record<string, number> = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    entries.forEach(entry => {
      const [year, month, day] = entry.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    if (Object.keys(dayCount).length === 0) {
      return { day: 'Ninguno', count: 0 };
    }

    const topDay = Object.entries(dayCount).reduce((a, b) => 
      dayCount[a[0]] > dayCount[b[0]] ? a : b
    );

    return { day: topDay[0], count: topDay[1] };
  };

  const { day, count } = getDayWithMostEpisodes();

  return (
    <div className="stat-beautiful p-4 sm:p-6 rounded-2xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="subheading-beautiful text-slate-500 font-semibold text-sm sm:text-base">Día Crítico</h3>
        <div className="stat-icon-beautiful w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/10">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate max-w-full">{day}</div>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">{count} episodio{count !== 1 ? 's' : ''}</p>
        <div className="w-full bg-slate-100/80 dark:bg-slate-900/40 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(count * 20, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TopDayCard;
