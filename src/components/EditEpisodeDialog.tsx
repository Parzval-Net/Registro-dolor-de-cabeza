
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HeadacheEntry } from '@/types/headache';
import { useToast } from '@/hooks/use-toast';
import { Save, Calendar, Clock, X } from 'lucide-react';
import EditEpisodeForm from './episode-edit/EditEpisodeForm';

interface EditEpisodeDialogProps {
  entry: HeadacheEntry;
  onSave: (updatedEntry: HeadacheEntry) => void;
  onCancel: () => void;
}

const EditEpisodeDialog = ({ entry, onSave, onCancel }: EditEpisodeDialogProps) => {
  const [formData, setFormData] = useState<HeadacheEntry>(entry);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(formData);
    onCancel();
    toast({
      title: "Episodio actualizado",
      description: "Los cambios han sido guardados exitosamente.",
    });
  };

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
          maxWidth: '900px',
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
              <Calendar className="h-6 w-6 text-white" />
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
                Editar Episodio
              </h2>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.25rem'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(formData.date).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short'
                    })}
                  </span>
                </div>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}
                >
                  <Clock className="h-4 w-4" />
                  <span>{formData.time}</span>
                </div>
              </div>
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
          <EditEpisodeForm 
            entry={entry}
            onFormDataChange={setFormData}
          />
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
              justifyContent: 'flex-end',
              gap: '0.75rem'
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
              onClick={handleSave}
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
        </div>
      </div>
    </div>
  );
};

export default EditEpisodeDialog;
