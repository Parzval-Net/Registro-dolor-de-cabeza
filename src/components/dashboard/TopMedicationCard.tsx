
import { Pill } from 'lucide-react';

interface TopMedicationCardProps {
  medication: string;
}

const TopMedicationCard = ({ medication }: TopMedicationCardProps) => (
  <div className="stat-beautiful p-4 sm:p-6 rounded-2xl flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="subheading-beautiful text-slate-500 font-semibold text-sm sm:text-base">Medicamento</h3>
      <div className="stat-icon-beautiful w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/10">
        <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate max-w-full">{medication}</div>
      <p className="text-slate-500 text-xs sm:text-sm font-medium">más utilizado</p>
      <div className="w-full bg-slate-100/80 dark:bg-slate-900/40 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1.5 rounded-full transition-all duration-500" 
          style={{ width: medication === 'Ninguno' ? '0%' : '75%' }}
        ></div>
      </div>
    </div>
  </div>
);

export default TopMedicationCard;
