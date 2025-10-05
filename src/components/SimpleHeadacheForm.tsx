import React, { useState } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Activity, Pill, FileText, X, Zap, Save } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface SimpleHeadacheFormProps {
  onSave: (entry: HeadacheEntry) => void;
  onCancel: () => void;
}

const SimpleHeadacheForm = ({ onSave, onCancel }: SimpleHeadacheFormProps) => {
  const [isExpress, setIsExpress] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    intensity: [5],
    medications: [] as string[],
    symptoms: [] as string[],
    notes: '',
  });

  const medicationOptions = [
    'Ibuprofeno', 'Paracetamol', 'Aspirina', 'Sumatriptán', 'Ninguno'
  ];

  const symptomOptions = [
    'Dolor pulsante', 'Dolor constante', 'Sensibilidad a la luz', 
    'Sensibilidad al sonido', 'Náuseas', 'Vómitos', 'Mareos'
  ];

  const handleExpressSubmit = () => {
    const entry: HeadacheEntry = {
      id: Date.now().toString(),
      date: formData.date,
      time: formData.time,
      intensity: formData.intensity[0],
      duration: 0,
      medications: formData.medications,
      triggers: [],
      symptoms: formData.symptoms,
      relievedBy: [],
      mood: '',
      stressLevel: 3,
      notes: 'Registro rápido',
    };
    onSave(entry);
    toast({
      title: "Registro guardado",
      description: "Tu dolor de cabeza ha sido registrado rápidamente.",
    });
  };

  const handleCompleteSubmit = () => {
    const entry: HeadacheEntry = {
      id: Date.now().toString(),
      date: formData.date,
      time: formData.time,
      intensity: formData.intensity[0],
      duration: 0,
      medications: formData.medications,
      triggers: [],
      symptoms: formData.symptoms,
      relievedBy: [],
      mood: '',
      stressLevel: 3,
      notes: formData.notes,
    };
    onSave(entry);
    toast({
      title: "Registro completo guardado",
      description: "Tu episodio ha sido registrado con todos los detalles.",
    });
  };

  const toggleMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication]
    }));
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return 'Leve';
    if (value <= 6) return 'Moderado';
    if (value <= 8) return 'Severo';
    return 'Extremo';
  };

  if (isExpress) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
      >
        <div 
          style={{
            maxWidth: '500px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {/* Header - Optimizado */}
            <div 
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
              }}
            >
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: 0,
                    lineHeight: 1.2
                  }}
                >
                  Registro Express
                </h2>
                <p 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '1rem',
                    color: '#64748b',
                    margin: 0,
                    marginTop: '0.5rem'
                  }}
                >
                  Solo lo esencial, en segundos
                </p>
              </div>
            </div>

            {/* Form Content - Optimizado */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              {/* Fecha y Hora */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <label 
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      background: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '0.875rem',
                      color: '#374151',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <label 
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      background: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '0.875rem',
                      color: '#374151',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Intensidad - Optimizada */}
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  padding: '2rem'
                }}
              >
                <label 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    textAlign: 'center',
                    display: 'block',
                    marginBottom: '1.5rem'
                  }}
                >
                  Intensidad del dolor
                </label>
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}
                >
                  <div 
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    <div 
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '3rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        margin: 0,
                        lineHeight: 1
                      }}
                    >
                      {formData.intensity[0]}
                    </div>
                    <div 
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#64748b',
                        margin: 0,
                        marginTop: '0.5rem'
                      }}
                    >
                      {getIntensityLabel(formData.intensity[0])}
                    </div>
                  </div>
                  <Slider
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Botones - Optimizados */}
            <div 
              style={{
                display: 'flex',
                gap: '1rem'
              }}
            >
              <button 
                onClick={onCancel}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleExpressSubmit}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </button>
            </div>

            {/* Botón de cambio a modo completo */}
            <div 
              style={{
                textAlign: 'center'
              }}
            >
              <button 
                onClick={() => setIsExpress(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.5)',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ¿Quieres agregar más detalles?
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '95vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header - Optimizado */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.2
                }}
              >
                Registrar Episodio
              </h2>
              <p 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0,
                  marginTop: '0.25rem'
                }}
              >
                Información básica del dolor de cabeza
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#64748b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable - Optimizado */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            background: 'rgba(248, 250, 252, 0.5)'
          }}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            {/* Fecha y Hora - Optimizado */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <label 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar className="w-4 h-4" style={{ color: '#667eea' }} />
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    color: '#374151',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <label 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: '#667eea' }} />
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    color: '#374151',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Intensidad - Optimizado */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <h3 
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                  marginBottom: '1rem'
                }}
              >
                <Activity className="w-5 h-5" style={{ color: '#ef4444' }} />
                Intensidad del dolor
              </h3>
              <div 
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '3rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    textShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {formData.intensity[0]}
                </div>
                <div 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: '0.5rem'
                  }}
                >
                  {getIntensityLabel(formData.intensity[0])}
                </div>
                <div 
                  style={{
                    padding: '0 1rem'
                  }}
                >
                  <Slider
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    style={{
                      height: '8px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Medicamentos - Optimizado */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    margin: 0
                  }}
                >
                  <Pill className="w-5 h-5 mr-2" style={{ color: '#667eea' }} />
                  Medicamentos tomados
                </h3>
                {formData.medications.length > 0 && (
                  <div 
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '20px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {formData.medications.length} seleccionado{formData.medications.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {medicationOptions.map((medication) => {
                  const isSelected = formData.medications.includes(medication);
                  return (
                    <div
                      key={medication}
                      onClick={() => toggleMedication(medication)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderRadius: '16px',
                        border: isSelected 
                          ? '2px solid #667eea' 
                          : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.8)',
                        boxShadow: isSelected 
                          ? '0 10px 25px rgba(102, 126, 234, 0.2)'
                          : '0 4px 12px rgba(0, 0, 0, 0.05)',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#667eea';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      <div 
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #667eea' : '2px solid #cbd5e1',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span 
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#1e293b' : '#475569',
                          flex: 1
                        }}
                      >
                        {medication}
                      </span>
                      {isSelected && (
                        <div 
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Síntomas - Optimizado */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    margin: 0
                  }}
                >
                  <Activity className="w-5 h-5 mr-2" style={{ color: '#f59e0b' }} />
                  Síntomas experimentados
                </h3>
                {formData.symptoms.length > 0 && (
                  <div 
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '20px',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    {formData.symptoms.length} seleccionado{formData.symptoms.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '0.5rem'
                }}
              >
                {symptomOptions.map((symptom) => {
                  const isSelected = formData.symptoms.includes(symptom);
                  return (
                    <div
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderRadius: '16px',
                        border: isSelected 
                          ? '2px solid #f59e0b' 
                          : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.8)',
                        boxShadow: isSelected 
                          ? '0 10px 25px rgba(245, 158, 11, 0.2)'
                          : '0 4px 12px rgba(0, 0, 0, 0.05)',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#f59e0b';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      <div 
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #f59e0b' : '2px solid #cbd5e1',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span 
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#1e293b' : '#475569',
                          flex: 1
                        }}
                      >
                        {symptom}
                      </span>
                      {isSelected && (
                        <div 
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notas */}
            <div className="card-beautiful p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Notas adicionales
              </h3>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="¿Algo más que quieras recordar sobre este episodio?"
                className="input-beautiful min-h-[60px]"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer - Fixed - Optimizado */}
        <div 
          style={{
            flexShrink: 0,
            padding: '1.5rem',
            borderTop: '1px solid rgba(226, 232, 240, 0.5)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {/* Botón Modo Express */}
            <button 
              onClick={() => setIsExpress(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                borderRadius: '12px',
                border: '2px solid #f59e0b',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#f59e0b',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f59e0b';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.color = '#f59e0b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Modo Express
            </button>
            
            {/* Botones de Acción */}
            <div 
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}
            >
              <button 
                onClick={onCancel}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#64748b',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCompleteSubmit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeadacheForm;