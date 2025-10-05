
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface EpisodeCountCardProps {
  count: number;
}

const EpisodeCountCard = ({ count }: EpisodeCountCardProps) => (
  <div className="stat-beautiful">
    <div className="flex items-center justify-between mb-6">
      <h3 className="subheading-beautiful">Episodios</h3>
      <div className="stat-icon-beautiful">
        <Calendar className="h-7 w-7 text-white" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="stat-number-beautiful text-5xl">{count}</div>
      <p className="text-beautiful text-lg">este mes</p>
      <div className="w-full bg-muted rounded-full h-3">
        <div className="gradient-primary h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(count * 10, 100)}%`}}></div>
      </div>
    </div>
  </div>
);

export default EpisodeCountCard;
