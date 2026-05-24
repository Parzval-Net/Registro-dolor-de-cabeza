import React, { useState } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Zap, Save, BrainCircuit, Activity, Pill } from 'lucide-react';

interface SimpleHeadacheFormProps {
  onSave: (entry: HeadacheEntry) => void;
  onCancel: () => void;
  initialDate?: string;
}

export default function SimpleHeadacheForm({ onSave, onCancel, initialDate }: SimpleHeadacheFormProps) {
  const [isExpress, setIsExpress] = useState(true); // Rápido por defecto
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    intensity: 5,
    medications: [] as string[],
    symptoms: [] as string[],
    triggers: [] as string[],
    sleepHours: 7,
    notes: '',
  });

  const medicationOptions = [
    { name: 'Ibuprofeno', icon: '💊' },
    { name: 'Paracetamol', icon: '💊' },
    { name: 'Aspirina', icon: '💊' },
    { name: 'Sumatriptán', icon: '⚡' },
    { name: 'Ninguno', icon: '😌' }
  ];

  const symptomOptions = [
    { name: 'Dolor pulsante', icon: '⚡' },
    { name: 'Dolor constante', icon: '🤕' },
    { name: 'Sensibilidad a la luz', icon: '☀️' },
    { name: 'Sensibilidad al sonido', icon: '🔊' },
    { name: 'Náuseas', icon: '🤢' },
    { name: 'Vómitos', icon: '🤮' },
    { name: 'Mareos', icon: '🌀' }
  ];

  const triggerOptions = [
    { name: 'Estrés', icon: '🤯' },
    { name: 'Falta de sueño', icon: '😴' },
    { name: 'Alcohol', icon: '🍷' },
    { name: 'Cafeína', icon: '☕' },
    { name: 'Brillo/Luces', icon: '💡' },
    { name: 'Saltarse comidas', icon: '🍽️' },
    { name: 'Cambio de clima', icon: '⛅' }
  ];

  const toggleMedication = (med: string) => {
    setFormData(prev => {
      if (med === 'Ninguno') {
        return prev.medications.includes('Ninguno')
          ? { ...prev, medications: [] }
          : { ...prev, medications: ['Ninguno'] };
      }
      const filtered = prev.medications.filter(m => m !== 'Ninguno');
      return {
        ...prev,
        medications: filtered.includes(med)
          ? filtered.filter(m => m !== med)
          : [...filtered, med]
      };
    });
  };

  const toggleSymptom = (sym: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(sym)
        ? prev.symptoms.filter(s => s !== sym)
        : [...prev.symptoms, sym]
    }));
  };

  const toggleTrigger = (trig: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trig)
        ? prev.triggers.filter(t => t !== trig)
        : [...prev.triggers, trig]
    }));
  };

  const getIntensityInfo = (val: number) => {
    if (val <= 3) return { label: 'Leve', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', emoji: '😌' };
    if (val <= 6) return { label: 'Moderado', color: 'text-orange-600 bg-orange-50 border-orange-100', emoji: '😐' };
    if (val <= 8) return { label: 'Severo', color: 'text-red-600 bg-red-50 border-red-100', emoji: '😟' };
    return { label: 'Extremo', color: 'text-purple-600 bg-purple-50 border-purple-100', emoji: '😱' };
  };

  const getSleepEmoji = (hours: number) => {
    if (hours < 6) return '🥱';
    if (hours < 9) return '😌';
    return '⚡';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: HeadacheEntry = {
      id: Date.now().toString(),
      date: formData.date,
      time: formData.time,
      intensity: formData.intensity,
      duration: 0,
      medications: formData.medications,
      triggers: isExpress ? [] : formData.triggers,
      symptoms: isExpress ? [] : formData.symptoms,
      relievedBy: [],
      mood: '',
      stressLevel: 3,
      sleepHours: isExpress ? undefined : formData.sleepHours,
      notes: isExpress ? 'Registro rápido' : formData.notes,
    };

    onSave(entry);

    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const intInfo = getIntensityInfo(formData.intensity);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
      
      {/* Container adaptativo */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200/50 dark:border-slate-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden transition-all duration-300 transform translate-y-0 sm:scale-100 animate-slide-up"
      >
        
        {/* Drag Indicator para móvil */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-3 sm:hidden flex-shrink-0" />

        {/* Cabecera Móvil de navegación superior (Guardar arriba, Cancelar arriba) */}
        <div className="px-5 pb-4 sm:pt-4 sm:px-6 border-b border-slate-100/80 dark:border-slate-800 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Cancelar (Arriba izquierda) */}
            <button
              type="button"
              onClick={onCancel}
              className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all duration-200"
            >
              Cancelar
            </button>

            {/* Título Central */}
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/10">
                <BrainCircuit className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-850 dark:text-slate-100 font-outfit">
                Registrar Dolor
              </span>
            </div>

            {/* Guardar (Arriba derecha - Pill con Gradiente) */}
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          {/* Selector de pestañas iOS-Style */}
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200/20 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsExpress(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                isExpress
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/5'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Rápido</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExpress(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                !isExpress
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/5'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Detallado</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario (Scrolleable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 sm:space-y-6">
          
          {/* ========================================================= */}
          {/* MODO RÁPIDO (EXPRESS): Solo Intensidad y Medicamentos */}
          {/* ========================================================= */}
          {isExpress ? (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div className="text-center py-2">
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                  Registra lo esencial rápidamente en segundos. La fecha y hora se guardarán de forma predeterminada con el momento actual.
                </p>
              </div>

              {/* Intensidad con Visual Feedback */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    ¿Qué tan fuerte es el dolor?
                  </label>
                  <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${intInfo.color} flex items-center gap-1.5 transition-all duration-300`}>
                    <span className="text-sm">{intInfo.emoji}</span>
                    <span>{formData.intensity}/10 — {intInfo.label}</span>
                  </div>
                </div>

                <div className="relative py-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 outline-none"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 font-bold px-1 mt-2">
                    <span>1 (Mínimo)</span>
                    <span>5 (Medio)</span>
                    <span>10 (Máximo)</span>
                  </div>
                </div>
              </div>

              {/* Medicamentos */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-500" />
                  <span>¿Tomaste algún medicamento?</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {medicationOptions.map((med) => {
                    const isSelected = formData.medications.includes(med.name);
                    return (
                      <button
                        type="button"
                        key={med.name}
                        onClick={() => toggleMedication(med.name)}
                        className={`px-3 py-2.5 text-xs sm:text-sm rounded-xl font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        <span>{med.icon}</span>
                        <span>{med.name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            
            // =========================================================
            // MODO DETALLADO (COMPLETE): Todo el historial clínico
            // =========================================================
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              
              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Fecha</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="px-3 sm:px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Hora</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="px-3 sm:px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Intensidad con Visual Feedback */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    ¿Qué tan fuerte es el dolor?
                  </label>
                  <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${intInfo.color} flex items-center gap-1.5 transition-all duration-300`}>
                    <span className="text-sm">{intInfo.emoji}</span>
                    <span>{formData.intensity}/10 — {intInfo.label}</span>
                  </div>
                </div>

                <div className="relative py-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 outline-none"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 font-bold px-1 mt-2">
                    <span>1 (Mínimo)</span>
                    <span>5 (Medio)</span>
                    <span>10 (Máximo)</span>
                  </div>
                </div>
              </div>

              {/* Medicamentos */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-500" />
                  <span>Medicamento tomado</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {medicationOptions.map((med) => {
                    const isSelected = formData.medications.includes(med.name);
                    return (
                      <button
                        type="button"
                        key={med.name}
                        onClick={() => toggleMedication(med.name)}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-xl font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        <span>{med.icon}</span>
                        <span>{med.name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Síntomas */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Síntomas experimentados</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {symptomOptions.map((sym) => {
                    const isSelected = formData.symptoms.includes(sym.name);
                    return (
                      <button
                        type="button"
                        key={sym.name}
                        onClick={() => toggleSymptom(sym.name)}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-xl font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        <span>{sym.icon}</span>
                        <span>{sym.name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desencadenantes */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span>🤯</span>
                  <span>Posibles desencadenantes</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {triggerOptions.map((trig) => {
                    const isSelected = formData.triggers.includes(trig.name);
                    return (
                      <button
                        type="button"
                        key={trig.name}
                        onClick={() => toggleTrigger(trig.name)}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-xl font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-white hover:bg-indigo-50/40 border-slate-200 text-slate-600 hover:text-indigo-600'
                        }`}
                      >
                        <span>{trig.icon}</span>
                        <span>{trig.name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horas de Sueño */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800">
                    ¿Cuántas horas dormiste anoche?
                  </label>
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <span>{getSleepEmoji(formData.sleepHours)}</span>
                    <span>{formData.sleepHours} Horas</span>
                  </div>
                </div>

                <div className="relative py-1">
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 outline-none"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 font-bold px-1 mt-2">
                    <span>3h (Muy poco)</span>
                    <span>7h (Promedio)</span>
                    <span>12h (Excesivo)</span>
                  </div>
                </div>
              </div>

              {/* Notas Clínicas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span>📝</span>
                  <span>Notas y observaciones</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe cómo te sientes, el clima, o cualquier detalle relevante..."
                  rows={3}
                  className="px-3 sm:px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-200 resize-none placeholder:text-slate-400"
                />
              </div>

            </div>
          )}

        </div>

      </form>
    </div>
  );
}