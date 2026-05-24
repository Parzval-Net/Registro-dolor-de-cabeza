
import { Activity } from 'lucide-react';

interface AverageIntensityCardProps {
  averageIntensity: number;
}

const getIntensityGradient = (intensity: number) => {
  if (intensity <= 3) return 'from-emerald-400 to-teal-500';
  if (intensity <= 6) return 'from-amber-400 to-orange-500';
  if (intensity <= 8) return 'from-rose-400 to-pink-500';
  return 'from-purple-600 to-fuchsia-600';
};

const AverageIntensityCard = ({ averageIntensity }: AverageIntensityCardProps) => (
  <div className="stat-beautiful p-4 sm:p-6 rounded-2xl flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="subheading-beautiful text-slate-500 font-semibold text-sm sm:text-base">Intensidad</h3>
      <div className={`stat-icon-beautiful w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getIntensityGradient(averageIntensity)} shadow-md shadow-pink-500/10`}>
        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">{averageIntensity.toFixed(1)}</div>
      <p className="text-slate-500 text-xs sm:text-sm font-medium">promedio de 10</p>
      <div className="w-full bg-slate-100/80 dark:bg-slate-900/40 rounded-full h-1.5 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${getIntensityGradient(averageIntensity)} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${averageIntensity * 10}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default AverageIntensityCard;
