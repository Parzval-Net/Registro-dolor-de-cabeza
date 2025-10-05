
import { Button } from '@/components/ui/button';
import { Save, Clock } from 'lucide-react';

interface FormActionButtonsProps {
  currentStep: number;
  onCancel: () => void;
  onSwitchToExpress: () => void;
  onPrevious: () => void;
  onContinue: () => void;
  onSaveBasic: () => void;
  onSaveComplete: () => void;
}

const FormActionButtons = ({
  currentStep,
  onCancel,
  onSwitchToExpress,
  onPrevious,
  onContinue,
  onSaveBasic,
  onSaveComplete
}: FormActionButtonsProps) => {
  return (
    <>
      {/* Express Button */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1" />
        <button 
          onClick={onSwitchToExpress} 
          className="btn-ghost-beautiful text-sm px-4 py-2"
        >
          <Clock className="w-4 h-4 mr-2" />
          Express
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-border gap-4">
        <div className="flex gap-3 w-full sm:w-auto">
          {currentStep > 1 && (
            <button 
              onClick={onPrevious} 
              className="btn-ghost-beautiful text-sm flex-1 sm:flex-none"
            >
              Anterior
            </button>
          )}
          <button 
            onClick={onCancel} 
            className="btn-ghost-beautiful text-sm flex-1 sm:flex-none"
          >
            Cancelar
          </button>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {currentStep === 1 && (
            <>
              <button 
                onClick={onSaveBasic} 
                className="btn-secondary-beautiful text-sm flex-1 sm:flex-none"
              >
                Guardar básico
              </button>
              <button 
                onClick={onContinue} 
                className="btn-beautiful text-sm flex-1 sm:flex-none"
              >
                Continuar
              </button>
            </>
          )}
          {currentStep === 2 && (
            <button 
              onClick={onSaveComplete} 
              className="btn-beautiful text-sm w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar completo
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FormActionButtons;
