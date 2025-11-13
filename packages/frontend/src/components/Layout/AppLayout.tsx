import React from 'react';
import {AppShell, NavLink, Stack, Text} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconScreenShare, IconTicket, IconUser} from '@tabler/icons-react';

// PUNTO DE AUDITORIA (Identify):
// Layout reutilizable que proporciona estructura consistente
// a todas las pantallas del sistema

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppLayout({children, activeView, onViewChange}: AppLayoutProps) {
  const [mobileOpened] = useDisclosure();
  const [desktopOpened] = useDisclosure(true);

  const navItems = [
    {
      label: 'Generar Ticket',
      value: 'generator',
      icon: IconTicket,
      description: 'Pantalla para clientes'
    },
    {
      label: 'Panel Cajero',
      value: 'cashier',
      icon: IconUser,
      description: 'Llamar y atender tickets'
    },
    {
      label: 'Pantalla Pública',
      value: 'display',
      icon: IconScreenShare,
      description: 'Mostrar tickets en tiempo real'
    },
  ];

  return (
    <AppShell
      header={{height: 60}}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {mobile: !mobileOpened, desktop: !desktopOpened},
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <div style={{
          padding: '0 16px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #228be6, #15aabf)'
        }}>
          <Text
            c="white"
            fw={700}
            size="xl"
          >
            Sistema de Tickets - Banco
          </Text>
          <Text
            c="white"
            size="sm"
            ml="auto"
            style={{opacity: 0.9}}
          >
            Auditoría Informática
          </Text>
        </div>
      </AppShell.Header>

      {/* Navigation */}
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text fw={500} c="dimmed" size="sm">
            Vistas del Sistema
          </Text>

          {navItems.map((item) => (
            <NavLink
              key={item.value}
              active={activeView === item.value}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size="1rem"/>}
              onClick={() => onViewChange(item.value)}
              variant="filled"
              style={{borderRadius: '8px'}}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}