
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Pill } from 'lucide-react';

interface TopMedicationsListProps {
  topMedications: [string, number][];
}

const TopMedicationsList = ({ topMedications }: TopMedicationsListProps) => (
  <Card className="glass-card-dark overflow-hidden border border-slate-200/50 dark:border-slate-800/40 shadow-md">
    <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-slate-900/60 dark:to-emerald-950/40 border-b border-emerald-100/20 dark:border-emerald-900/30">
      <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
          <Pill className="h-4 w-4 text-white" />
        </div>
        Medicamentos Más Utilizados
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-4 bg-white/40 dark:bg-slate-900/20">
      {topMedications.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto">
            <Pill className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-300 font-medium">Sin medicamentos registrados</p>
            <p className="text-sm text-slate-400">Registra más episodios para ver patrones</p>
          </div>
        </div>
      ) : (
        topMedications.map(([medication, count], index) => (
          <div key={medication} className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800/30 bg-white/70 dark:bg-slate-900/40 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                  index === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 
                  index === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 
                  'bg-gradient-to-br from-purple-500 to-violet-500'
                }`}>
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{medication}</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{count} registro{count > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    index === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
                    index === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 
                    'bg-gradient-to-r from-purple-500 to-violet-500'
                  }`} style={{width: `${(count / Math.max(...topMedications.map(([,c]) => c))) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export default TopMedicationsList;
