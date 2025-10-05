// ========================================
// MIGRACARE - GOOGLE APPS SCRIPT VERSION
// ========================================

const { useState, useEffect, useCallback } = React;
const { BrowserRouter, Routes, Route } = ReactRouterDOM;

// ========================================
// TYPES AND INTERFACES
// ========================================
const HeadacheEntry = {
  id: '',
  date: '',
  time: '',
  intensity: [5],
  medications: [],
  symptoms: [],
  notes: '',
  stressLevel: [5],
  sleepHours: 8,
  triggers: []
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getIntensityColor = (intensity) => {
  if (intensity <= 3) return '#10b981';
  if (intensity <= 6) return '#f59e0b';
  if (intensity <= 8) return '#ef4444';
  return '#dc2626';
};

const getIntensityLabel = (intensity) => {
  if (intensity <= 3) return 'Leve';
  if (intensity <= 6) return 'Moderado';
  if (intensity <= 8) return 'Severo';
  return 'Extremo';
};

// ========================================
// TOAST HOOK
// ========================================
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now().toString();
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toast, toasts };
};

// ========================================
// HEADER COMPONENT
// ========================================
const Header = ({ onNewEntry }) => {
  const [appSettings, setAppSettings] = useState({
    appName: 'MigraCare',
    appDescription: 'Seguimiento inteligente de migrañas',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    appIcon: 'Heart'
  });

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('admin-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setAppSettings({
            appName: parsedSettings.appName || 'MigraCare',
            appDescription: parsedSettings.appDescription || 'Seguimiento inteligente de migrañas',
            primaryColor: parsedSettings.primaryColor || '#8B5CF6',
            secondaryColor: parsedSettings.secondaryColor || '#EC4899',
            appIcon: parsedSettings.appIcon || 'Heart'
          });
        } catch (error) {
          console.error('Error loading admin settings in Header:', error);
        }
      }
    };

    loadSettings();
  }, []);

  return React.createElement('header', {
    className: 'nav-beautiful sticky top-0 z-50 safe-area-pt'
  }, React.createElement('div', {
    className: 'container-beautiful'
  }, React.createElement('div', {
    className: 'flex items-center justify-between'
  }, React.createElement('div', {
    className: 'flex items-center space-x-4'
  }, React.createElement('div', {
    className: 'w-14 h-14 rounded-2xl stat-icon-beautiful animate-float'
  }, React.createElement(lucide.Heart, {
    className: 'w-7 h-7 text-white'
  })), React.createElement('div', {
    className: 'hidden sm:block'
  }, React.createElement('h1', {
    className: 'heading-beautiful text-2xl'
  }, appSettings.appName), React.createElement('p', {
    className: 'text-beautiful'
  }, appSettings.appDescription)), React.createElement('div', {
    className: 'sm:hidden'
  }, React.createElement('h1', {
    className: 'text-xl font-bold text-primary'
  }, appSettings.appName))), React.createElement('div', {
    className: 'flex items-center space-x-3'
  }, React.createElement('button', {
    className: 'w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-muted/50 transition-all duration-300',
    title: 'Cambiar tema'
  }, React.createElement(lucide.Sun, {
    className: 'w-5 h-5 text-muted-foreground'
  })), React.createElement('button', {
    onClick: onNewEntry,
    title: 'Registrar dolor',
    'aria-label': 'Registrar nuevo episodio de dolor',
    className: 'btn-beautiful text-sm px-6 py-3'
  }, React.createElement('span', {
    className: 'hidden sm:inline'
  }, 'Nuevo Episodio'), React.createElement('span', {
    className: 'sm:hidden'
  }, '+'), React.createElement('svg', {
    className: 'w-4 h-4 ml-2',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
  })))))));
};

// ========================================
// MOBILE BOTTOM NAVIGATION
// ========================================
const MobileBottomNav = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: lucide.Home },
    { id: 'calendar', label: 'Fechas', icon: lucide.Calendar },
    { id: 'trends', label: 'Gráficos', icon: lucide.BarChart3 },
    { id: 'episodes', label: 'Lista', icon: lucide.List },
    { id: 'admin', label: 'Config', icon: lucide.Settings }
  ];

  return React.createElement('div', {
    className: 'fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-pb',
    style: { paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }
  }, React.createElement('div', {
    className: 'flex justify-around items-center py-2'
  }, navItems.map(item => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    
    return React.createElement('button', {
      key: item.id,
      onClick: () => onViewChange(item.id),
      className: `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'text-primary bg-primary/10' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`
    }, React.createElement(Icon, {
      className: `w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`
    }), React.createElement('span', {
      className: `text-xs font-medium ${isActive ? 'text-primary' : ''}`
    }, item.label));
  })));
};

// ========================================
// SIMPLE HEADACHE FORM
// ========================================
const SimpleHeadacheForm = ({ onSave, onCancel }) => {
  const [isExpress, setIsExpress] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    intensity: [5],
    medications: [],
    symptoms: [],
    notes: '',
    stressLevel: [5],
    sleepHours: 8,
    triggers: []
  });

  const medicationOptions = [
    'Ibuprofeno', 'Paracetamol', 'Aspirina', 'Sumatriptán', 'Rizatriptán',
    'Eletriptán', 'Almotriptán', 'Frovatriptán', 'Naratriptán', 'Zolmitriptán',
    'Ergotamina', 'Dihidroergotamina', 'Naproxeno', 'Ketorolaco', 'Otro'
  ];

  const symptomOptions = [
    'Dolor pulsátil', 'Dolor constante', 'Náuseas', 'Vómitos', 'Sensibilidad a la luz',
    'Sensibilidad al sonido', 'Sensibilidad al olfato', 'Aura visual', 'Aura sensorial',
    'Aura del habla', 'Mareos', 'Fatiga', 'Irritabilidad', 'Depresión', 'Ansiedad'
  ];

  const triggerOptions = [
    'Estrés', 'Falta de sueño', 'Cambios hormonales', 'Alimentos específicos',
    'Cambios climáticos', 'Luz brillante', 'Ruidos fuertes', 'Olores fuertes',
    'Ejercicio intenso', 'Alcohol', 'Cafeína', 'Otro'
  ];

  const toggleMedication = (medication) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const toggleTrigger = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const handleSubmit = () => {
    const entry = {
      id: Date.now().toString(),
      ...formData,
      intensity: formData.intensity[0],
      stressLevel: formData.stressLevel[0]
    };
    onSave(entry);
  };

  const handleExpressSubmit = () => {
    const entry = {
      id: Date.now().toString(),
      date: formData.date,
      time: formData.time,
      intensity: formData.intensity[0],
      medications: [],
      symptoms: [],
      notes: '',
      stressLevel: formData.stressLevel[0],
      sleepHours: 8,
      triggers: []
    };
    onSave(entry);
  };

  if (isExpress) {
    return React.createElement('div', {
      className: 'modal-beautiful'
    }, React.createElement('div', {
      className: 'modal-content-beautiful max-w-md w-full'
    }, React.createElement('div', {
      className: 'p-8 space-y-8'
    }, React.createElement('div', {
      className: 'text-center space-y-6'
    }, React.createElement('div', {
      className: 'w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto animate-float'
    }, React.createElement(lucide.Zap, {
      className: 'h-10 w-10 text-white'
    })), React.createElement('div', null, React.createElement('h2', {
      className: 'heading-beautiful text-3xl'
    }, 'Registro Express'), React.createElement('p', {
      className: 'text-beautiful'
    }, 'Solo lo esencial, en segundos'))), React.createElement('div', {
      className: 'space-y-6'
    }, React.createElement('div', {
      className: 'grid grid-cols-2 gap-4'
    }, React.createElement('div', {
      className: 'space-y-3'
    }, React.createElement('label', {
      className: 'label-beautiful'
    }, 'Fecha'), React.createElement('input', {
      type: 'date',
      value: formData.date,
      onChange: (e) => setFormData({ ...formData, date: e.target.value }),
      className: 'input-beautiful'
    })), React.createElement('div', {
      className: 'space-y-3'
    }, React.createElement('label', {
      className: 'label-beautiful'
    }, 'Hora'), React.createElement('input', {
      type: 'time',
      value: formData.time,
      onChange: (e) => setFormData({ ...formData, time: e.target.value }),
      className: 'input-beautiful'
    }))), React.createElement('div', {
      className: 'card-beautiful p-6'
    }, React.createElement('label', {
      className: 'label-beautiful text-center mb-6 block text-lg'
    }, 'Intensidad del dolor'), React.createElement('div', {
      className: 'space-y-6'
    }, React.createElement('div', {
      className: 'text-center'
    }, React.createElement('div', {
      className: 'stat-number-beautiful text-5xl'
    }, formData.intensity[0]), React.createElement('div', {
      className: 'text-beautiful text-lg font-semibold'
    }, getIntensityLabel(formData.intensity[0]))), React.createElement('input', {
      type: 'range',
      min: '1',
      max: '10',
      value: formData.intensity[0],
      onChange: (e) => setFormData({ ...formData, intensity: [parseInt(e.target.value)] }),
      className: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
    })))), React.createElement('div', {
      className: 'flex space-x-4'
    }, React.createElement('button', {
      onClick: onCancel,
      className: 'btn-ghost-beautiful flex-1'
    }, 'Cancelar'), React.createElement('button', {
      onClick: handleExpressSubmit,
      className: 'btn-beautiful flex-1'
    }, React.createElement(lucide.Save, {
      className: 'w-5 h-5 mr-2'
    }), 'Guardar')), React.createElement('div', {
      className: 'text-center'
    }, React.createElement('button', {
      onClick: () => setIsExpress(false),
      className: 'btn-ghost-beautiful text-sm'
    }, '¿Quieres agregar más detalles?')))));
  }

  return React.createElement('div', {
    className: 'modal-beautiful'
  }, React.createElement('div', {
    className: 'modal-content-beautiful'
  }, React.createElement('div', {
    className: 'flex justify-between items-center p-6 border-b border-gray-200'
  }, React.createElement('div', {
    className: 'flex items-center space-x-3'
  }, React.createElement('div', {
    className: 'w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center'
  }, React.createElement(lucide.Activity, {
    className: 'h-6 w-6 text-white'
  })), React.createElement('div', null, React.createElement('h2', {
    className: 'text-xl font-bold text-gray-900'
  }, 'Registrar Episodio'), React.createElement('p', {
    className: 'text-sm text-gray-500'
  }, 'Información completa del dolor de cabeza'))), React.createElement('button', {
    onClick: onCancel,
    className: 'w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors'
  }, React.createElement(lucide.X, {
    className: 'w-5 h-5 text-gray-500'
  }))), React.createElement('div', {
    className: 'p-6 space-y-6 max-h-96 overflow-y-auto'
  }, React.createElement('div', {
    className: 'grid grid-cols-2 gap-4'
  }, React.createElement('div', null, React.createElement('label', {
    className: 'label-beautiful'
  }, 'Fecha'), React.createElement('input', {
    type: 'date',
    value: formData.date,
    onChange: (e) => setFormData({ ...formData, date: e.target.value }),
    className: 'input-beautiful'
  })), React.createElement('div', null, React.createElement('label', {
    className: 'label-beautiful'
  }, 'Hora'), React.createElement('input', {
    type: 'time',
    value: formData.time,
    onChange: (e) => setFormData({ ...formData, time: e.target.value }),
    className: 'input-beautiful'
  }))), React.createElement('div', {
    className: 'card-beautiful p-4'
  }, React.createElement('h3', {
    className: 'text-base font-semibold mb-3 flex items-center'
  }, React.createElement(lucide.Activity, {
    className: 'w-5 h-5 mr-2 text-primary'
  }), 'Intensidad del dolor'), React.createElement('div', {
    className: 'space-y-4'
  }, React.createElement('div', {
    className: 'text-center'
  }, React.createElement('div', {
    className: 'stat-number-beautiful text-4xl mb-2'
  }, formData.intensity[0]), React.createElement('div', {
    className: 'text-lg font-semibold',
    style: { color: getIntensityColor(formData.intensity[0]) }
  }, getIntensityLabel(formData.intensity[0]))), React.createElement('input', {
    type: 'range',
    min: '1',
    max: '10',
    value: formData.intensity[0],
    onChange: (e) => setFormData({ ...formData, intensity: [parseInt(e.target.value)] }),
    className: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
  }))), React.createElement('div', {
    className: 'card-beautiful p-4'
  }, React.createElement('h3', {
    className: 'text-base font-semibold mb-3 flex items-center'
  }, React.createElement(lucide.Pill, {
    className: 'w-5 h-5 mr-2 text-primary'
  }), 'Medicamentos tomados'), React.createElement('div', {
    className: 'grid grid-cols-2 gap-2'
  }, medicationOptions.map(medication => {
    const isSelected = formData.medications.includes(medication);
    return React.createElement('div', {
      key: medication,
      onClick: () => toggleMedication(medication),
      className: `p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-200 hover:border-gray-300'
      }`
    }, React.createElement('div', {
      className: 'flex items-center space-x-2'
    }, React.createElement('div', {
      className: `w-4 h-4 rounded border-2 flex items-center justify-center ${
        isSelected ? 'border-primary bg-primary' : 'border-gray-300'
      }`
    }, isSelected && React.createElement(lucide.Check, {
      className: 'w-3 h-3 text-white'
    })), React.createElement('span', {
      className: `text-sm ${isSelected ? 'font-semibold' : ''}`
    }, medication)));
  })), React.createElement('div', {
    className: 'card-beautiful p-4'
  }, React.createElement('h3', {
    className: 'text-base font-semibold mb-3 flex items-center'
  }, React.createElement(lucide.AlertCircle, {
    className: 'w-5 h-5 mr-2 text-primary'
  }), 'Síntomas experimentados'), React.createElement('div', {
    className: 'space-y-2'
  }, symptomOptions.map(symptom => {
    const isSelected = formData.symptoms.includes(symptom);
    return React.createElement('div', {
      key: symptom,
      onClick: () => toggleSymptom(symptom),
      className: `p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-200 hover:border-gray-300'
      }`
    }, React.createElement('div', {
      className: 'flex items-center space-x-2'
    }, React.createElement('div', {
      className: `w-4 h-4 rounded border-2 flex items-center justify-center ${
        isSelected ? 'border-primary bg-primary' : 'border-gray-300'
      }`
    }, isSelected && React.createElement(lucide.Check, {
      className: 'w-3 h-3 text-white'
    })), React.createElement('span', {
      className: `text-sm ${isSelected ? 'font-semibold' : ''}`
    }, symptom)));
  })), React.createElement('div', {
    className: 'card-beautiful p-4'
  }, React.createElement('h3', {
    className: 'text-base font-semibold mb-3 flex items-center'
  }, React.createElement(lucide.FileText, {
    className: 'w-5 h-5 mr-2 text-primary'
  }), 'Notas adicionales'), React.createElement('textarea', {
    value: formData.notes,
    onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
    placeholder: '¿Algo más que quieras recordar sobre este episodio?',
    className: 'input-beautiful min-h-[60px]',
    rows: 2
  }))), React.createElement('div', {
    className: 'flex justify-between items-center p-6 border-t border-gray-200'
  }, React.createElement('button', {
    onClick: () => setIsExpress(true),
    className: 'btn-ghost-beautiful text-sm'
  }, React.createElement(lucide.Zap, {
    className: 'w-4 h-4 mr-2'
  }), 'Modo Express'), React.createElement('div', {
    className: 'flex space-x-3'
  }, React.createElement('button', {
    onClick: onCancel,
    className: 'btn-secondary-beautiful'
  }, 'Cancelar'), React.createElement('button', {
    onClick: handleSubmit,
    className: 'btn-beautiful'
  }, React.createElement(lucide.Save, {
    className: 'w-4 h-4 mr-2'
  }), 'Guardar')))));
};

// ========================================
// DASHBOARD COMPONENT
// ========================================
const Dashboard = ({ entries }) => {
  const getAverageIntensity = () => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.intensity, 0);
    return total / entries.length;
  };

  const getTopMedication = () => {
    const medicationCount = {};
    entries.forEach(entry => {
      entry.medications.forEach(med => {
        medicationCount[med] = (medicationCount[med] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(medicationCount).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'Ninguno';
  };

  const getDayWithMostEpisodes = () => {
    const dayCount = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    if (Object.keys(dayCount).length === 0) {
      return { day: 'Ninguno', count: 0 };
    }

    const topDay = Object.entries(dayCount).reduce((a, b) => 
      dayCount[a[0]] > dayCount[b[0]] ? a : b
    );

    return { day: topDay[0], count: topDay[1] };
  };

  const averageIntensity = getAverageIntensity();
  const topMedication = getTopMedication();
  const { day, count } = getDayWithMostEpisodes();

  return React.createElement('div', {
    className: 'space-y-6'
  }, React.createElement('div', {
    className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  }, React.createElement('div', {
    className: 'stat-beautiful'
  }, React.createElement('div', {
    className: 'flex items-center justify-between mb-6'
  }, React.createElement('h3', {
    className: 'subheading-beautiful'
  }, 'Episodios'), React.createElement('div', {
    className: 'stat-icon-beautiful'
  }, React.createElement(lucide.Calendar, {
    className: 'h-7 w-7 text-white'
  }))), React.createElement('div', {
    className: 'space-y-4'
  }, React.createElement('div', {
    className: 'stat-number-beautiful text-5xl'
  }, entries.length), React.createElement('p', {
    className: 'text-beautiful text-lg'
  }, 'este mes'), React.createElement('div', {
    className: 'w-full bg-gray-200 rounded-full h-3'
  }, React.createElement('div', {
    className: 'gradient-primary h-3 rounded-full transition-all duration-500',
    style: { width: `${Math.min(entries.length * 10, 100)}%` }
  })))), React.createElement('div', {
    className: 'stat-beautiful'
  }, React.createElement('div', {
    className: 'flex items-center justify-between mb-6'
  }, React.createElement('h3', {
    className: 'subheading-beautiful'
  }, 'Intensidad'), React.createElement('div', {
    className: 'w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg'
  }, React.createElement(lucide.Activity, {
    className: 'h-7 w-7 text-white'
  }))), React.createElement('div', {
    className: 'space-y-4'
  }, React.createElement('div', {
    className: 'stat-number-beautiful text-5xl'
  }, averageIntensity.toFixed(1)), React.createElement('p', {
    className: 'text-beautiful text-lg'
  }, 'promedio de 10'), React.createElement('div', {
    className: 'w-full bg-gray-200 rounded-full h-3'
  }, React.createElement('div', {
    className: 'gradient-accent h-3 rounded-full transition-all duration-500',
    style: { width: `${averageIntensity * 10}%` }
  })))), React.createElement('div', {
    className: 'stat-beautiful'
  }, React.createElement('div', {
    className: 'flex items-center justify-between mb-6'
  }, React.createElement('h3', {
    className: 'subheading-beautiful'
  }, 'Día Crítico'), React.createElement('div', {
    className: 'w-14 h-14 rounded-2xl gradient-warning flex items-center justify-center shadow-lg'
  }, React.createElement(lucide.Calendar, {
    className: 'h-7 w-7 text-white'
  }))), React.createElement('div', {
    className: 'space-y-4'
  }, React.createElement('div', {
    className: 'text-2xl font-bold text-gray-900'
  }, day), React.createElement('p', {
    className: 'text-beautiful text-lg'
  }, `${count} episodio${count !== 1 ? 's' : ''}`), React.createElement('div', {
    className: 'w-full bg-gray-200 rounded-full h-3'
  }, React.createElement('div', {
    className: 'gradient-warning h-3 rounded-full transition-all duration-500',
    style: { width: `${Math.min(count * 20, 100)}%` }
  }))))));
};

// ========================================
// MAIN APP COMPONENT
// ========================================
const App = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [appSettings, setAppSettings] = useState({
    appName: 'MigraCare',
    appDescription: 'Tu compañero inteligente para el seguimiento y gestión de migrañas.',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    appIcon: 'Heart'
  });
  const { toast, toasts } = useToast();

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('headache-entries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    }
  }, []);

  // Load app settings
  useEffect(() => {
    const loadAppSettings = () => {
      const savedSettings = localStorage.getItem('admin-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setAppSettings({
            appName: parsedSettings.appName || 'MigraCare',
            appDescription: parsedSettings.appDescription || 'Tu compañero inteligente para el seguimiento y gestión de migrañas.',
            primaryColor: parsedSettings.primaryColor || '#8B5CF6',
            secondaryColor: parsedSettings.secondaryColor || '#EC4899',
            appIcon: parsedSettings.appIcon || 'Heart'
          });
        } catch (error) {
          console.error('Error loading app settings:', error);
        }
      }
    };

    loadAppSettings();
  }, []);

  const handleSaveEntry = (entry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem('headache-entries', JSON.stringify(newEntries));
    setShowForm(false);
    toast({
      title: 'Éxito',
      description: 'Episodio registrado correctamente',
      variant: 'default'
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return React.createElement(Dashboard, { entries });
      case 'calendar':
        return React.createElement('div', {
          className: 'text-center py-12'
        }, React.createElement(lucide.Calendar, {
          className: 'w-16 h-16 text-gray-400 mx-auto mb-4'
        }), React.createElement('h3', {
          className: 'text-lg font-semibold text-gray-600'
        }, 'Vista de Calendario'), React.createElement('p', {
          className: 'text-gray-500'
        }, 'Próximamente disponible'));
      case 'trends':
        return React.createElement('div', {
          className: 'text-center py-12'
        }, React.createElement(lucide.BarChart3, {
          className: 'w-16 h-16 text-gray-400 mx-auto mb-4'
        }), React.createElement('h3', {
          className: 'text-lg font-semibold text-gray-600'
        }, 'Análisis y Gráficos'), React.createElement('p', {
          className: 'text-gray-500'
        }, 'Próximamente disponible'));
      case 'episodes':
        return React.createElement('div', {
          className: 'space-y-4'
        }, entries.length === 0 ? React.createElement('div', {
          className: 'text-center py-12'
        }, React.createElement(lucide.List, {
          className: 'w-16 h-16 text-gray-400 mx-auto mb-4'
        }), React.createElement('h3', {
          className: 'text-lg font-semibold text-gray-600'
        }, 'No hay episodios registrados'), React.createElement('p', {
          className: 'text-gray-500'
        }, 'Comienza registrando tu primer episodio')) : entries.map(entry => React.createElement('div', {
          key: entry.id,
          className: 'card-beautiful p-4'
        }, React.createElement('div', {
          className: 'flex justify-between items-start mb-2'
        }, React.createElement('div', null, React.createElement('h3', {
          className: 'font-semibold text-gray-900'
        }, formatDate(entry.date)), React.createElement('p', {
          className: 'text-sm text-gray-500'
        }, formatTime(entry.time))), React.createElement('div', {
          className: 'text-right'
        }, React.createElement('div', {
          className: 'text-2xl font-bold',
          style: { color: getIntensityColor(entry.intensity) }
        }, entry.intensity), React.createElement('div', {
          className: 'text-sm text-gray-500'
        }, getIntensityLabel(entry.intensity)))), React.createElement('div', {
          className: 'mt-2'
        }, entry.medications.length > 0 && React.createElement('div', {
          className: 'flex flex-wrap gap-1 mb-2'
        }, entry.medications.map(med => React.createElement('span', {
          key: med,
          className: 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
        }, med))), entry.symptoms.length > 0 && React.createElement('div', {
          className: 'flex flex-wrap gap-1'
        }, entry.symptoms.map(symptom => React.createElement('span', {
          key: symptom,
          className: 'px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full'
        }, symptom)))), entry.notes && React.createElement('p', {
          className: 'mt-2 text-sm text-gray-600'
        }, entry.notes))));
      case 'admin':
        return React.createElement('div', {
          className: 'text-center py-12'
        }, React.createElement(lucide.Settings, {
          className: 'w-16 h-16 text-gray-400 mx-auto mb-4'
        }), React.createElement('h3', {
          className: 'text-lg font-semibold text-gray-600'
        }, 'Configuración'), React.createElement('p', {
          className: 'text-gray-500'
        }, 'Próximamente disponible'));
      default:
        return React.createElement(Dashboard, { entries });
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen gradient-hero',
    style: {
      minHeight: 'calc(var(--vh, 1vh) * 100)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
    }
  }, React.createElement(Header, {
    onNewEntry: () => setShowForm(true)
  }), React.createElement('div', {
    className: 'container-beautiful py-8'
  }, React.createElement('div', {
    className: 'animate-fade-in-beautiful'
  }, renderCurrentView())), React.createElement(MobileBottomNav, {
    currentView,
    onViewChange: setCurrentView
  }), showForm && React.createElement(SimpleHeadacheForm, {
    onSave: handleSaveEntry,
    onCancel: () => setShowForm(false)
  }), toasts.length > 0 && React.createElement('div', {
    className: 'fixed top-4 right-4 z-50 space-y-2'
  }, toasts.map(toast => React.createElement('div', {
    key: toast.id,
    className: 'bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm'
  }, React.createElement('div', {
    className: 'flex items-start space-x-3'
  }, React.createElement('div', {
    className: 'flex-shrink-0'
  }, React.createElement(lucide.CheckCircle, {
    className: 'w-5 h-5 text-green-500'
  })), React.createElement('div', {
    className: 'flex-1'
  }, React.createElement('h4', {
    className: 'text-sm font-medium text-gray-900'
  }, toast.title), React.createElement('p', {
    className: 'text-sm text-gray-500'
  }, toast.description)))))));
};

// ========================================
// RENDER APP
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(BrowserRouter, null, React.createElement(App, null)));

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
