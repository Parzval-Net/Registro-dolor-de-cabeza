import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Dashboard from '@/components/Dashboard';
import CalendarView from '@/components/CalendarView';
import TrendsView from '@/components/TrendsView';
import EpisodesList from '@/components/EpisodesList';
import AdminPanel from '@/components/AdminPanel';
import SimpleHeadacheForm from '@/components/SimpleHeadacheForm';
import { HeadacheEntry } from '@/types/headache';

// Google Apps Script API functions
const GAS_API = {
  baseUrl: '', // Will be set dynamically
  
  async call(action: string, data: any = {}) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },
  
  async saveEntry(entry: HeadacheEntry) {
    return this.call('save_entry', { entry });
  },
  
  async getEntries() {
    return this.call('get_entries');
  },
  
  async updateEntry(entry: HeadacheEntry) {
    return this.call('update_entry', { entry });
  },
  
  async deleteEntry(id: string) {
    return this.call('delete_entry', { id });
  }
};

const IndexGas = () => {
  const [entries, setEntries] = useState<HeadacheEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'trends' | 'episodes' | 'admin'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize Google Apps Script API URL
  useEffect(() => {
    // Get the current script URL
    const scriptUrl = ScriptApp?.getService()?.getUrl();
    if (scriptUrl) {
      GAS_API.baseUrl = scriptUrl;
    } else {
      // Fallback for development
      GAS_API.baseUrl = window.location.origin + '/api';
    }
  }, []);

  // Load entries from Google Apps Script on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await GAS_API.getEntries();
        if (result.success !== false) {
          setEntries(Array.isArray(result) ? result : []);
        } else {
          throw new Error(result.error || 'Failed to load entries');
        }
      } catch (error) {
        console.error('Error loading entries:', error);
        setError('Error loading entries. Using local storage as fallback.');
        
        // Fallback to localStorage
        const savedEntries = localStorage.getItem('headache-entries');
        if (savedEntries) {
          try {
            const parsedEntries = JSON.parse(savedEntries);
            setEntries(parsedEntries);
          } catch (parseError) {
            console.error('Error parsing saved entries:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // PWA Installation and mobile optimizations
  useEffect(() => {
    // Handle PWA install prompt
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      deferredPrompt = e;
      console.log('PWA install prompt available');
    });

    // Check for new entry shortcut
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, []);

  // Enhanced viewport height handling for mobile (especially Safari)
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100); // Delay for Safari
    });

    // Prevent body scroll when modal is open
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const handleSaveEntry = async (entry: HeadacheEntry) => {
    try {
      const result = await GAS_API.saveEntry(entry);
      if (result.success !== false) {
        setEntries(prev => [entry, ...prev]);
        setShowForm(false);
        toast({
          title: "Registro guardado",
          description: "Tu episodio de migraña ha sido registrado exitosamente.",
        });
      } else {
        throw new Error(result.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      
      // Fallback to localStorage
      setEntries(prev => [entry, ...prev]);
      localStorage.setItem('headache-entries', JSON.stringify([entry, ...entries]));
      setShowForm(false);
      
      toast({
        title: "Registro guardado (modo offline)",
        description: "Tu episodio se guardó localmente. Se sincronizará cuando se restablezca la conexión.",
        variant: "default",
      });
    }

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const handleUpdateEntry = async (updatedEntry: HeadacheEntry) => {
    try {
      const result = await GAS_API.updateEntry(updatedEntry);
      if (result.success !== false) {
        setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
        toast({
          title: "Registro actualizado",
          description: "Tu episodio de migraña ha sido actualizado exitosamente.",
        });
      } else {
        throw new Error(result.error || 'Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      
      // Fallback to localStorage
      setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
      localStorage.setItem('headache-entries', JSON.stringify(entries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)));
      
      toast({
        title: "Registro actualizado (modo offline)",
        description: "Los cambios se guardaron localmente.",
        variant: "default",
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const result = await GAS_API.deleteEntry(entryId);
      if (result.success !== false) {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast({
          title: "Registro eliminado",
          description: "Tu episodio de migraña ha sido eliminado exitosamente.",
        });
      } else {
        throw new Error(result.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      
      // Fallback to localStorage
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      localStorage.setItem('headache-entries', JSON.stringify(entries.filter(entry => entry.id !== entryId)));
      
      toast({
        title: "Registro eliminado (modo offline)",
        description: "El registro se eliminó localmente.",
        variant: "default",
      });
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'episodes':
        return (
          <EpisodesList 
            entries={entries} 
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );
      case 'calendar':
        return <CalendarView entries={entries} />;
      case 'trends':
        return <TrendsView entries={entries} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard entries={entries} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lavender-50 to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando MigraCare...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-rose-50 via-lavender-50 to-coral-50 overflow-x-hidden" 
      style={{ 
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <Header onNewEntry={() => setShowForm(true)} />
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mt-2 rounded">
          <p className="font-bold">Modo offline</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <main className="max-w-6xl mx-auto p-3 lg:p-4 pb-20 lg:pb-8">
        <div className="animate-fade-in">
          {renderCurrentView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {showForm && (
        <SimpleHeadacheForm
          onSave={handleSaveEntry}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default IndexGas;
