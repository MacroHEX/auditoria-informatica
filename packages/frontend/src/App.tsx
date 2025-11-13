import {BrowserRouter as Router, Outlet, Route, Routes} from 'react-router-dom';
import {createTheme, MantineProvider} from '@mantine/core';
import {Notifications} from '@mantine/notifications';
import {HomePage} from './pages/HomePage';
import {TicketGenerator} from './components/TicketGenerator';
import {CashierPanel} from './components/CashierPanel';
import {DisplayPanel} from './components/DisplayPanel';
import {AdminLayout} from './components/Layout/AdminLayout';

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

// Componente wrapper para el layout administrativo
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet/>
    </AdminLayout>
  );
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right"/>
      <Router>
        <Routes>
          {/* Página de inicio */}
          <Route path="/" element={<HomePage/>}/>

          {/* Ruta para clientes (sin layout) */}
          <Route path="/cliente" element={<TicketGenerator/>}/>

          {/* Rutas administrativas (con layout) */}
          <Route path="/admin" element={<AdminLayoutWrapper/>}>
            <Route path="cajero" element={<CashierPanel/>}/>
            <Route path="generar" element={<TicketGenerator/>}/>
            <Route index element={<CashierPanel/>}/>
          </Route>

          {/* Pantalla pública (sin layout) */}
          <Route path="/pantalla" element={<DisplayPanel/>}/>

          {/* Ruta catch-all */}
          <Route path="*" element={<HomePage/>}/>
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;