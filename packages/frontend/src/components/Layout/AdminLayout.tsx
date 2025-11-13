import React from 'react';
import {AppShell, NavLink, Stack, Text} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconScreenShare, IconTicket, IconUser} from '@tabler/icons-react';
import {useLocation, useNavigate} from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({children}: AdminLayoutProps) {
  const [mobileOpened] = useDisclosure();
  const [desktopOpened] = useDisclosure(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: 'Generar Ticket',
      value: 'generator',
      icon: IconTicket,
      description: 'Pantalla para clientes',
      path: '/admin/generar'
    },
    {
      label: 'Panel Cajero',
      value: 'cashier',
      icon: IconUser,
      description: 'Llamar y atender tickets',
      path: '/admin/cajero'
    },
    {
      label: 'Pantalla Pública',
      value: 'display',
      icon: IconScreenShare,
      description: 'Mostrar tickets en tiempo real',
      path: '/'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

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
            Panel Administrativo
          </Text>
        </div>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text fw={500} c="dimmed" size="sm">
            Navegación
          </Text>

          {navItems.map((item) => (
            <NavLink
              key={item.value}
              active={isActive(item.path)}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size="1rem"/>}
              onClick={() => navigate(item.path)}
              variant="filled"
              style={{borderRadius: '8px'}}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}