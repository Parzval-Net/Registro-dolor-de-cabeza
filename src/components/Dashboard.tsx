
import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
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
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear;
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
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        paddingBottom: '2rem'
      }}
    >
      {/* Hero Section - Optimizada */}
      <div 
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem 0'
        }}
      >
        <h2 
          style={{
            fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2,
            margin: 0
          }}
        >
          Tu salud en perspectiva
        </h2>
        <p 
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '1.125rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          {dashboardDescription}
        </p>
      </div>

      {/* Quote Section */}
      <div 
        style={{
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <QuoteSection />
      </div>

      {/* Stats Grid - Optimizada */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          marginTop: '2rem'
        }}
        className="sm:grid-cols-2 lg:grid-cols-4"
      >
        <div 
          style={{
            animation: 'slideUp 0.6s ease-out'
          }}
        >
          <EpisodeCountCard count={monthlyEntries.length} />
        </div>
        <div 
          style={{
            animation: 'slideUp 0.6s ease-out 0.1s both'
          }}
        >
          <AverageIntensityCard averageIntensity={averageIntensity} />
        </div>
        <div 
          style={{
            animation: 'slideUp 0.6s ease-out 0.2s both'
          }}
        >
          <TopMedicationCard medication={topMedication} />
        </div>
        <div 
          style={{
            animation: 'slideUp 0.6s ease-out 0.3s both'
          }}
        >
          <TopDayCard entries={entries} />
        </div>
      </div>

      {/* Recent Episodes */}
      <div 
        style={{
          animation: 'fadeIn 0.6s ease-out 0.4s both'
        }}
      >
        <RecentEpisodesList entries={recentEntries} getIntensityGradient={getIntensityGradient} />
      </div>

      {/* Clinical Insights Section */}
      <div 
        style={{
          animation: 'fadeIn 0.6s ease-out 0.5s both',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginTop: '1rem'
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid rgba(226, 232, 240, 0.4)',
            paddingBottom: '0.75rem'
          }}
        >
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Outfit', sans-serif", margin: 0 }}>
              Análisis Clínico de Patrones
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400" style={{ margin: 0, marginTop: '0.15rem' }}>
              Hábitos de descanso, actividad semanal, medicamentos recurrentes y factores desencadenantes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SleepPatternsList entries={entries} />
          <WeeklyPatternsList entries={entries} />
          <TopMedicationsList topMedications={topMedications} />
          <TopTriggersList topTriggers={topTriggers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
