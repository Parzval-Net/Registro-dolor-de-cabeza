import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import AppGas from './AppGas';
import './index.css';

const container = document.getElementById('root')!;
createRoot(container).render(
  <React.StrictMode>
    <HashRouter>
      <AppGas />
    </HashRouter>
  </React.StrictMode>
);
