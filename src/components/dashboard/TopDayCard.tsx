
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
      const date = new Date(entry.date);
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
    <div className="stat-beautiful">
      <div className="flex items-center justify-between mb-6">
        <h3 className="subheading-beautiful">Día Crítico</h3>
        <div className="w-14 h-14 rounded-2xl gradient-warning flex items-center justify-center shadow-lg">
          <Calendar className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-2xl font-bold text-foreground">{day}</div>
        <p className="text-beautiful text-lg">{count} episodio{count !== 1 ? 's' : ''}</p>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="gradient-warning h-3 rounded-full transition-all duration-500" 
            style={{width: `${Math.min(count * 20, 100)}%`}}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TopDayCard;
