
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { getRandomQuote } from '@/data/principitoQuotes';

const QuoteSection = () => {
  const [quote, setQuote] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const handleNewQuote = () => {
    setIsRotating(true);
    setQuote(getRandomQuote());
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <Card className="glass-card border border-violet-100/50 bg-gradient-to-r from-violet-50/30 via-indigo-50/20 to-purple-50/30 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/10 flex-shrink-0">
            <Quote className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                <h3 className="text-xs font-bold text-violet-600 uppercase tracking-wider font-outfit">Reflexión de Calma</h3>
              </div>
              <button
                onClick={handleNewQuote}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-indigo-50/50"
                title="Nueva reflexión"
              >
                <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <blockquote className="text-sm italic text-slate-600 leading-relaxed font-sans pr-2">
              "{quote}"
            </blockquote>
            <div className="text-[10px] font-semibold text-slate-400 text-right pr-2">
              — El Principito
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteSection;
