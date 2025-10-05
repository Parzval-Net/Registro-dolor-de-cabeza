
import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AverageIntensityCardProps {
  averageIntensity: number;
}

const getIntensityGradient = (intensity: number) => {
  // Usamos solo gradientes violeta-rosas, eliminando los naranjas/amarillos
  if (intensity <= 3) return 'from-violet-400 to-purple-500';
  if (intensity <= 6) return 'from-fuchsia-400 to-pink-400';
  if (intensity <= 8) return 'from-rose-400 to-pink-500';
  return 'from-purple-700 to-fuchsia-700';
};

const AverageIntensityCard = ({ averageIntensity }: AverageIntensityCardProps) => (
  <div className="stat-beautiful">
    <div className="flex items-center justify-between mb-6">
      <h3 className="subheading-beautiful">Intensidad</h3>
      <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
        <Activity className="h-7 w-7 text-white" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="stat-number-beautiful text-5xl">{averageIntensity.toFixed(1)}</div>
      <p className="text-beautiful text-lg">promedio de 10</p>
      <div className="w-full bg-muted rounded-full h-3">
        <div
          className="gradient-accent h-3 rounded-full transition-all duration-500"
          style={{ width: `${averageIntensity * 10}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default AverageIntensityCard;
