import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root')!;
const REPO_BASENAME = '/Registro-dolor-de-cabeza';
const pathName = window.location.pathname;
const basename = pathName.startsWith(`${REPO_BASENAME}/`) || pathName === REPO_BASENAME
  ? REPO_BASENAME
  : '/';

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
