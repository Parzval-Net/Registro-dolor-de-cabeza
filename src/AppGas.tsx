// src/AppGas.tsx - Google Apps Script version

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import IndexGas from './pages/IndexGas';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppGas = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<IndexGas />} />
        {/* Cualquier otra ruta cae en NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AppGas;
