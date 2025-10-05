
import { Pill } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TopMedicationCardProps {
  medication: string;
}

const TopMedicationCard = ({ medication }: TopMedicationCardProps) => (
  <div className="stat-beautiful">
    <div className="flex items-center justify-between mb-6">
      <h3 className="subheading-beautiful">Medicamento</h3>
      <div className="w-14 h-14 rounded-2xl gradient-success flex items-center justify-center shadow-lg">
        <Pill className="h-7 w-7 text-white" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="text-2xl font-bold truncate text-foreground">{medication}</div>
      <p className="text-beautiful text-lg">más utilizado</p>
      <div className="w-full bg-muted rounded-full h-3">
        <div className="gradient-success h-3 rounded-full w-3/4 transition-all duration-500"></div>
      </div>
    </div>
  </div>
);

export default TopMedicationCard;
