
import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Clock, TrendingUp as TrendingIcon, ShieldAlert } from 'lucide-react';
import EpisodeCountCard from './dashboard/EpisodeCountCard';
import AverageIntensityCard from './dashboard/AverageIntensityCard';
import TopMedicationCard from './dashboard/TopMedicationCard';
import RecentEpisodesList from './dashboard/RecentEpisodesList';
import TopDayCard from './dashboard/TopDayCard';
import QuoteSection from './dashboard/QuoteSection';
import SleepPatternsList from './dashboard/SleepPatternsList';
import WeeklyPatternsList from './dashboard/WeeklyPatternsList';
import TopMedicationsList from './dashboard/TopMedicationsList';
import TopTriggersList from './dashboard/TopTriggersList';
import { HeadacheEntry } from '@/types/headache';

interface DashboardProps {
  entries: HeadacheEntry[];
}

const Dashboard = ({ entries }: DashboardProps) => {
  const [dashboardDescription, setDashboardDescription] = useState('Conoce mejor tus patrones de dolor y toma decisiones informadas para tu bienestar');
  const [activeTab, setActiveTab] = useState<'recent' | 'patterns' | 'factors'>('recent');

  useEffect(() => {
    const loadDashboardDescription = () => {
      const savedSettings = localStorage.getItem('admin-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.dashboardDescription) {
            setDashboardDescription(settings.dashboardDescription);
          }
        } catch (error) {
          console.error('Error loading dashboard description:', error);
        }
      }
    };

    loadDashboardDescription();

    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.dashboardDescription) {
        setDashboardDescription(event.detail.dashboardDescription);
      }
    };

    window.addEventListener('admin-settings-updated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('admin-settings-updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const monthlyEntries = entries.filter(entry => {
    const [year, month, day] = entry.date.split('-').map(Number);
    return (month - 1) === thisMonth && year === thisYear;
  });

  const averageIntensity = monthlyEntries.length > 0 
    ? monthlyEntries.reduce((sum, entry) => sum + entry.intensity, 0) / monthlyEntries.length
    : 0;

  const mostUsedMedication = monthlyEntries
    .flatMap(entry => entry.medications)
    .reduce((acc, med) => {
      acc[med] = (acc[med] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topMedication = Object.entries(mostUsedMedication)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguno';

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
    .slice(0, 3);

  const getIntensityGradient = (intensity: number) => {
    if (intensity <= 3) return 'from-violet-400 to-purple-500';
    if (intensity <= 6) return 'from-fuchsia-400 to-pink-400';
    if (intensity <= 8) return 'from-rose-400 to-pink-500';
    return 'from-purple-700 to-fuchsia-700';
  };

  const topMedications = Object.entries(
    entries
      .flatMap(entry => entry.medications || [])
      .reduce((acc, med) => {
        if (med && med !== 'Ninguno') {
          acc[med] = (acc[med] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topTriggers = Object.entries(
    entries
      .flatMap(entry => entry.triggers || [])
      .reduce((acc, trigger) => {
        if (trigger) {
          acc[trigger] = (acc[trigger] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 sm:gap-10 pb-20 px-4 sm:px-0">
      {/* Hero Section - Compact & Elegant */}
      <div className="text-center flex flex-col gap-2 py-4 sm:py-6">
        <h2 className="font-outfit text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
          Tu salud en perspectiva
        </h2>
        <p className="font-sans text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
          {dashboardDescription}
        </p>
      </div>

      {/* Quote Section - Sleek & Compact */}
      <div className="animate-fade-in max-w-2xl mx-auto w-full">
        <QuoteSection />
      </div>

      {/* Stats Grid - 2x2 on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-2 max-w-6xl mx-auto w-full">
        <div className="animate-slide-up">
          <EpisodeCountCard count={monthlyEntries.length} />
        </div>
        <div className="animate-slide-up [animation-delay:100ms]">
          <AverageIntensityCard averageIntensity={averageIntensity} />
        </div>
        <div className="animate-slide-up [animation-delay:200ms]">
          <TopMedicationCard medication={topMedication} />
        </div>
        <div className="animate-slide-up [animation-delay:300ms]">
          <TopDayCard entries={entries} />
        </div>
      </div>

      {/* Interactive Tabs / Segmented Control */}
      <div className="w-full max-w-xl mx-auto mt-4">
        <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-2xl flex gap-1 shadow-sm border border-slate-200/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'recent'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Historial</span>
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'patterns'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TrendingIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Patrones</span>
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'factors'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Factores</span>
          </button>
        </div>
      </div>

      {/* Tab Contents - Sleek transitions & clean styles */}
      <div className="max-w-6xl mx-auto w-full transition-all duration-300">
        {activeTab === 'recent' && (
          <div className="animate-fade-in">
            <RecentEpisodesList entries={recentEntries} getIntensityGradient={getIntensityGradient} />
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/30 pb-3 mb-2">
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-outfit" style={{ margin: 0 }}>
                  Patrones de Descanso y Actividad
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SleepPatternsList entries={entries} />
              <WeeklyPatternsList entries={entries} />
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200/30 pb-3 mb-2">
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-outfit" style={{ margin: 0 }}>
                  Medicamentos Recurrentes y Desencadenantes
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopMedicationsList topMedications={topMedications} />
              <TopTriggersList topTriggers={topTriggers} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
