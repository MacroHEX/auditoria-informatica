import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// PUNTO DE AUDITORIA (Identify):
// Punto de entrada de la aplicación React
// Configuración inicial y montaje del DOM

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);