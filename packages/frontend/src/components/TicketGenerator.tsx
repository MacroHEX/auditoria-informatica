import { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack, 
  Paper, 
  LoadingOverlay,
  Alert
} from '@mantine/core';
import { IconTicket, IconInfoCircle } from '@tabler/icons-react';
import { useSocket } from '../hooks/useSocket';
import { type Ticket, TicketType } from '../types/ticket';

// PUNTO DE AUDITORIA (Protect):
// Componente que permite a los clientes generar tickets
// Nota: No hay autenticación - vulnerabilidad intencional

export function TicketGenerator() {
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Escuchar nuevos tickets generados
  useEffect(() => {
    if (!socket) return;

    const handleNewTicket = (ticket: Ticket) => {
      setLastTicket(ticket);
      setLoading(false);
      setError(null);
    };

    const handleError = (data: { mensaje: string }) => {
      setError(data.mensaje);
      setLoading(false);
    };

    socket.on('nuevo_ticket_generado', handleNewTicket);
    socket.on('error', handleError);

    return () => {
      socket.off('nuevo_ticket_generado', handleNewTicket);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleGenerateTicket = (tipo: TicketType) => {
    if (!socket || !isConnected) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError(null);
    
    // PUNTO DE AUDITORIA (Respond):
    // Emisión de evento sin validación adicional
    // En producción, debería haber más validaciones
    socket.emit('solicitar_ticket', { tipo });
  };

  const getTicketTypeInfo = (tipo: TicketType) => {
    const types = {
      [TicketType.VENTANILLA]: { 
        label: 'Ventanilla', 
        description: 'Atención general y consultas',
        color: 'blue'
      },
      [TicketType.CAJA]: { 
        label: 'Caja', 
        description: 'Depósitos, retiros y transacciones',
        color: 'green'
      },
      [TicketType.ASESORIA]: { 
        label: 'Asesoría', 
        description: 'Asesoramiento financiero',
        color: 'orange'
      },
    };
    return types[tipo];
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={2}>Generar Nuevo Ticket</Title>
        <Text c="dimmed">
          Seleccione el tipo de servicio que necesita
        </Text>
      </div>

      {!isConnected && (
        <Alert 
          color="red" 
          title="Sin conexión" 
          icon={<IconInfoCircle />}
        >
          No hay conexión con el servidor. Verifique que el backend esté ejecutándose.
        </Alert>
      )}

      {error && (
        <Alert 
          color="red" 
          title="Error" 
          icon={<IconInfoCircle />}
        >
          {error}
        </Alert>
      )}

      <LoadingOverlay visible={loading} />

      <Group gap="md" align="stretch">
        {Object.values(TicketType).map((tipo) => {
          const info = getTicketTypeInfo(tipo);
          
          return (
            <Card 
              key={tipo}
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ flex: 1, minWidth: 250 }}
            >
              <Stack gap="md">
                <div>
                  <Text fw={500} size="lg" c={info.color}>
                    {info.label}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {info.description}
                  </Text>
                </div>

                <Button
                  color={info.color}
                  leftSection={<IconTicket size={16} />}
                  onClick={() => handleGenerateTicket(tipo)}
                  disabled={!isConnected || loading}
                  fullWidth
                >
                  Obtener Ticket
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Group>

      {/* Último ticket generado */}
      {lastTicket && (
        <Paper 
          p="md" 
          withBorder 
          style={{ 
            borderLeft: `4px solid var(--mantine-color-blue-filled)`,
            background: 'var(--mantine-color-blue-light)'
          }}
        >
          <Group justify="space-between">
            <div>
              <Text fw={500}>Ticket Generado Exitosamente</Text>
              <Text size="sm" c="dimmed">
                Su número de ticket es: 
              </Text>
            </div>
            <Text 
              size="xl" 
              fw={700} 
              style={{ 
                fontSize: '2rem',
                color: 'var(--mantine-color-blue-filled)'
              }}
            >
              {lastTicket.numero}
            </Text>
          </Group>
          <Text size="sm" mt="xs">
            Por favor espere a ser llamado en la pantalla de visualización.
          </Text>
        </Paper>
      )}

      {/* PUNTO DE AUDITORIA (Detect): */}
      {/* Información de diagnóstico para monitoreo */}
      <Card withBorder>
        <Text size="sm" fw={500} mb="xs">Información de Conexión</Text>
        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed">Estado Socket</Text>
            <Text size="sm" c={isConnected ? 'green' : 'red'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Última acción</Text>
            <Text size="sm">
              {lastTicket ? `Ticket ${lastTicket.numero} generado` : 'Esperando acción'}
            </Text>
          </div>
        </Group>
      </Card>
    </Stack>
  );
}