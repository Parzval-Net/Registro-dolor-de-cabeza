
import { Button } from '@/components/ui/button';
import { Globe, Palette, Pill, Type, Shield, Database } from 'lucide-react';

interface AdminTabsProps {
  activeTab: 'general' | 'appearance' | 'medications' | 'data' | 'security' | 'database';
  onTabChange: (tab: 'general' | 'appearance' | 'medications' | 'data' | 'security' | 'database') => void;
}

const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
  const tabs = [
    { id: 'general' as const, label: 'General', icon: Globe },
    { id: 'appearance' as const, label: 'Apariencia', icon: Palette },
    { id: 'medications' as const, label: 'Medicamentos', icon: Pill },
    { id: 'data' as const, label: 'Datos', icon: Type },
    { id: 'security' as const, label: 'Seguridad', icon: Shield },
    { id: 'database' as const, label: 'Base de Datos', icon: Database },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={activeTab === id ? 'default' : 'outline'}
          onClick={() => onTabChange(id)}
          size="sm"
          className={`text-slate-800 font-semibold hover:bg-violet-100 hover:text-violet-800 hover:border-violet-300 text-xs sm:text-sm transition-all duration-200 ${
            activeTab === id 
              ? 'bg-violet-500 text-white border-violet-500 shadow-sm' 
              : 'bg-white border-slate-300'
          }`}
        >
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.charAt(0)}</span>
        </Button>
      ))}
    </div>
  );
};

export default AdminTabs;
