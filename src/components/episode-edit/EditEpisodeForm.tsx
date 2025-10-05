
import { useState, useEffect } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { medicationOptions as defaultMedicationOptions } from '@/data/options';
import { Calendar } from 'lucide-react';
import EpisodeBasicFields from './EpisodeBasicFields';
import EpisodeMedicationSelector from './EpisodeMedicationSelector';
import EpisodeSymptomSelector from './EpisodeSymptomSelector';
import EpisodeNotesField from './EpisodeNotesField';

interface EditEpisodeFormProps {
  entry: HeadacheEntry;
  onFormDataChange: (formData: HeadacheEntry) => void;
}

const EditEpisodeForm = ({ entry, onFormDataChange }: EditEpisodeFormProps) => {
  const [formData, setFormData] = useState<HeadacheEntry>(entry);
  const [medicationOptions, setMedicationOptions] = useState(defaultMedicationOptions);

  // Cargar medicamentos personalizados al montar el componente
  useEffect(() => {
    const loadCustomMedications = () => {
      const customMedications = localStorage.getItem('custom-medications');
      if (customMedications) {
        try {
          const parsed = JSON.parse(customMedications);
          const validatedMedications = parsed.map((med: any) => ({
            ...med,
            type: (med.type === 'preventive' || med.type === 'acute') ? med.type : 'acute'
          }));
          setMedicationOptions(validatedMedications);
        } catch (error) {
          console.error('Error loading custom medications:', error);
        }
      }
    };

    loadCustomMedications();
    
    const handleMedicationsUpdate = () => {
      loadCustomMedications();
    };
    
    window.addEventListener('medications-updated', handleMedicationsUpdate);
    return () => window.removeEventListener('medications-updated', handleMedicationsUpdate);
  }, []);

  // Notificar cambios al componente padre
  useEffect(() => {
    onFormDataChange(formData);
  }, [formData, onFormDataChange]);

  const updateFormData = (updates: Partial<HeadacheEntry>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCheckboxChange = (
    field: 'medications' | 'symptoms',
    value: string,
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >
      {/* Información Básica - Optimizada */}
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
          <Calendar className="w-5 h-5" style={{ color: '#667eea' }} />
          Información Básica
        </h3>
        <EpisodeBasicFields 
          formData={formData} 
          onUpdate={updateFormData} 
        />
      </div>

      {/* Medicamentos - Optimizada */}
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#667eea' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Medicamentos
        </h3>
        <EpisodeMedicationSelector
          selectedMedications={formData.medications}
          medicationOptions={medicationOptions}
          onToggleMedication={(medication, checked) => 
            handleCheckboxChange('medications', medication, checked)
          }
        />
      </div>

      {/* Síntomas - Optimizada */}
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#f59e0b' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Síntomas
        </h3>
        <EpisodeSymptomSelector
          selectedSymptoms={formData.symptoms}
          onToggleSymptom={(symptom, checked) => 
            handleCheckboxChange('symptoms', symptom, checked)
          }
        />
      </div>

      {/* Notas - Optimizada */}
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Notas Adicionales
        </h3>
        <EpisodeNotesField
          notes={formData.notes || ''}
          onNotesChange={(notes) => updateFormData({ notes })}
        />
      </div>
    </div>
  );
};

export default EditEpisodeForm;
