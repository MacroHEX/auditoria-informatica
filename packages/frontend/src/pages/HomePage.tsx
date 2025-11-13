import {Button, Card, Group, Stack, Text, Title} from '@mantine/core';
import {useNavigate} from 'react-router-dom';
import {IconScreenShare, IconTicket, IconUser} from '@tabler/icons-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(45deg, #228be6, #15aabf)'
    }}>
      <div style={{maxWidth: 800, width: '100%', padding: '20px'}}>
        <Stack gap="xl" align="center">
          <div style={{textAlign: 'center'}}>
            <Title order={1} c="white" mb="md">
              Sistema de Tickets - Banco
            </Title>
            <Text size="xl" c="white" style={{opacity: 0.9}}>
              Seleccione el modo de operación
            </Text>
          </div>

          <Group gap="md" grow style={{width: '100%'}}>
            <Card
              shadow="lg"
              padding="xl"
              radius="md"
              withBorder
              style={{textAlign: 'center', cursor: 'pointer'}}
              onClick={() => navigate('/cliente')}
            >
              <Stack gap="md">
                <IconTicket size={48} color="var(--mantine-color-blue-filled)"/>
                <Title order={3}>Cliente</Title>
                <Text c="dimmed">
                  Generar nuevo ticket de atención
                </Text>
                <Button color="blue" fullWidth>
                  Ingresar
                </Button>
              </Stack>
            </Card>

            <Card
              shadow="lg"
              padding="xl"
              radius="md"
              withBorder
              style={{textAlign: 'center', cursor: 'pointer'}}
              onClick={() => navigate('/admin/cajero')}
            >
              <Stack gap="md">
                <IconUser size={48} color="var(--mantine-color-green-filled)"/>
                <Title order={3}>Cajero</Title>
                <Text c="dimmed">
                  Panel de atención al cliente
                </Text>
                <Button color="green" fullWidth>
                  Ingresar
                </Button>
              </Stack>
            </Card>

            <Card
              shadow="lg"
              padding="xl"
              radius="md"
              withBorder
              style={{textAlign: 'center', cursor: 'pointer'}}
              onClick={() => navigate('/pantalla')}
            >
              <Stack gap="md">
                <IconScreenShare size={48} color="var(--mantine-color-orange-filled)"/>
                <Title order={3}>Pantalla Pública</Title>
                <Text c="dimmed">
                  Visualización de tickets
                </Text>
                <Button color="orange" fullWidth>
                  Ver
                </Button>
              </Stack>
            </Card>
          </Group>
        </Stack>
      </div>
    </div>
  );
}