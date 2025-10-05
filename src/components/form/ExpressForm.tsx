
import React from 'react';
import { Zap, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ExpressFormProps {
  formData: {
    date: string;
    time: string;
    intensity: number[];
    stressLevel: number[];
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onSwitchToComplete: () => void;
}

const ExpressForm = ({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  onCancel, 
  onSwitchToComplete 
}: ExpressFormProps) => {
  const getIntensityColor = (value: number) => {
    if (value <= 3) return 'text-emerald-600';
    if (value <= 6) return 'text-orange-600';
    if (value <= 8) return 'text-red-500';
    return 'text-red-600';
  };

  const getIntensityBg = (value: number) => {
    if (value <= 3) return 'from-emerald-400 to-emerald-500';
    if (value <= 6) return 'from-orange-400 to-orange-500';
    if (value <= 8) return 'from-red-400 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return 'Leve';
    if (value <= 6) return 'Moderado';
    if (value <= 8) return 'Severo';
    return 'Extremo';
  };

  return (
    <div className="modal-beautiful">
      <div className="modal-content-beautiful max-w-md w-full">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto animate-float">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="heading-beautiful text-3xl">Registro Express</h2>
              <p className="text-beautiful">Solo lo esencial, en segundos</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="label-beautiful">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => onFormDataChange({ ...formData, date: e.target.value })}
                  className="input-beautiful"
                />
              </div>
              <div className="space-y-3">
                <label className="label-beautiful">Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => onFormDataChange({ ...formData, time: e.target.value })}
                  className="input-beautiful"
                />
              </div>
            </div>

            <div className="card-beautiful p-6">
              <label className="label-beautiful text-center mb-6 block text-lg">Intensidad del dolor</label>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="stat-number-beautiful text-5xl">
                    {formData.intensity[0]}
                  </div>
                  <div className="text-beautiful text-lg font-semibold">
                    {getIntensityLabel(formData.intensity[0])}
                  </div>
                </div>
                <Slider
                  value={formData.intensity}
                  onValueChange={(value) => onFormDataChange({ ...formData, intensity: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={onCancel} 
              className="btn-ghost-beautiful flex-1"
            >
              Cancelar
            </button>
            <button 
              onClick={onSubmit} 
              className="btn-beautiful flex-1"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar
            </button>
          </div>

          <div className="text-center">
            <button 
              onClick={onSwitchToComplete}
              className="btn-ghost-beautiful text-sm"
            >
              ¿Quieres agregar más detalles?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpressForm;
