import { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppLayout } from './components/Layout/AppLayout';
import { TicketGenerator } from './components/TicketGenerator';
import { CashierPanel } from './components/CashierPanel';
import { DisplayPanel } from './components/DisplayPanel';
import { useSocket } from './hooks/useSocket';

// PUNTO DE AUDITORIA (Identify):
// Componente raíz que orquesta toda la aplicación
// Configura temas, proveedores y maneja el estado global de la vista

// Tema personalizado de Mantine v8
const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#4dabf7',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
    ],
  },
  fontFamily: 'Inter, sans-serif',
});

// Tipo para las vistas disponibles
type AppView = 'generator' | 'cashier' | 'display';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('display');
  const { isConnected } = useSocket();

  // Efecto para cambiar automáticamente a la vista de display después de 30 segundos de inactividad
  useEffect(() => {
    if (currentView !== 'display') {
      const timer = setTimeout(() => {
        setCurrentView('display');
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // Renderizar el componente basado en la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'generator':
        return <TicketGenerator />;
      case 'cashier':
        return <CashierPanel />;
      case 'display':
        return <DisplayPanel />;
      default:
        return <DisplayPanel />;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      
      <AppLayout 
        activeView={currentView}
        onViewChange={(view) => setCurrentView(view as AppView)}
      >
        {renderCurrentView()}
      </AppLayout>

      {/* PUNTO DE AUDITORIA (Detect): */}
      {/* Indicador de estado de conexión global */}
      {!isConnected && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          background: 'var(--mantine-color-red-filled)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1000
        }}>
          ⚠️ Sin conexión con el servidor
        </div>
      )}
    </MantineProvider>
  );
}

export default App;