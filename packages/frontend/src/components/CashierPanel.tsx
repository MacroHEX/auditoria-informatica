import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  Table,
  Alert,
  LoadingOverlay,
  TextInput
} from '@mantine/core';
import { IconPhone, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useSocket } from '../hooks/useSocket';
import { type Ticket, type CalledTicket, TicketStatus } from '../types/ticket';

// PUNTO DE AUDITORIA (Protect):
// Panel de cajero sin autenticación - vulnerabilidad intencional
// Cualquier usuario puede actuar como cajero

export function CashierPanel() {
  const { socket, isConnected } = useSocket();
  const [cajeroId, setCajeroId] = useState('cajero-01');
  const [currentTicket, setCurrentTicket] = useState<CalledTicket | null>(null);
  const [recentCalled, setRecentCalled] = useState<CalledTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escuchar eventos del socket
  useEffect(() => {
    if (!socket) return;

    const handleTicketCalled = (data: { ticket: Ticket; llamado: CalledTicket; cajeroId: string }) => {
      if (data.cajeroId === cajeroId) {
        setCurrentTicket(data.llamado);
      }
      setRecentCalled(prev => [data.llamado, ...prev.slice(0, 9)]);
      setLoading(false);
    };

    const handleTicketCompleted = (ticket: Ticket) => {
      if (currentTicket && currentTicket.ticketId === ticket.id) {
        setCurrentTicket(null);
      }
    };

    const handleNoTickets = (data: { mensaje: string }) => {
      setError(data.mensaje);
      setLoading(false);
    };

    const handleError = (data: { mensaje: string }) => {
      setError(data.mensaje);
      setLoading(false);
    };

    // Configurar listeners
    socket.on('ticket_llamado', handleTicketCalled);
    socket.on('ticket_completado', handleTicketCompleted);
    socket.on('no_hay_tickets', handleNoTickets);
    socket.on('error', handleError);

    // Obtener estado inicial
    socket.emit('obtener_estado_inicial');

    return () => {
      socket.off('ticket_llamado', handleTicketCalled);
      socket.off('ticket_completado', handleTicketCompleted);
      socket.off('no_hay_tickets', handleNoTickets);
      socket.off('error', handleError);
    };
  }, [socket, cajeroId, currentTicket]);

  const handleCallNext = () => {
    if (!socket || !isConnected) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError(null);
    
    // PUNTO DE AUDITORIA (Respond):
    // Llamar siguiente ticket sin validar permisos
    socket.emit('llamar_siguiente_ticket', { cajeroId });
  };

  const handleCompleteCurrent = () => {
    if (!socket || !isConnected || !currentTicket) {
      return;
    }

    setLoading(true);
    
    // PUNTO DE AUDITORIA (Respond):
    // Completar ticket - en producción debería validar identidad del cajero
    socket.emit('completar_ticket', {
      ticketId: currentTicket.ticketId,
      cajeroId: currentTicket.cajeroId
    });
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      [TicketStatus.EnEspera]: 'blue',
      [TicketStatus.Llamado]: 'orange',
      [TicketStatus.Atendido]: 'green',
      [TicketStatus.Cancelado]: 'red',
    };
    return colors[status];
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={2}>Panel de Cajero</Title>
        <Text c="dimmed">
          Gestión de tickets y atención al cliente
        </Text>
      </div>

      {!isConnected && (
        <Alert color="red" title="Sin conexión" icon={<IconInfoCircle />}>
          No hay conexión con el servidor. Verifique que el backend esté ejecutándose.
        </Alert>
      )}

      {error && (
        <Alert color="red" title="Error" icon={<IconInfoCircle />}>
          {error}
        </Alert>
      )}

      <LoadingOverlay visible={loading} />

      {/* Identificación del cajero */}
      <Card withBorder>
        <Group justify="space-between">
          <div>
            <Text fw={500}>Identificación de Cajero</Text>
            <Text size="sm" c="dimmed">
              PUNTO DE AUDITORIA: Sin autenticación
            </Text>
          </div>
          <TextInput
            value={cajeroId}
            onChange={(e) => setCajeroId(e.target.value)}
            placeholder="ID del cajero"
            style={{ width: 200 }}
          />
        </Group>
      </Card>

      {/* Ticket actual */}
      <Group gap="md" align="stretch">
        <Card withBorder style={{ flex: 1 }}>
          <Stack gap="md">
            <div>
              <Text fw={500} size="lg">Llamar Siguiente Ticket</Text>
              <Text size="sm" c="dimmed">
                Llama al siguiente ticket en espera
              </Text>
            </div>

            <Button
              color="blue"
              leftSection={<IconPhone size={16} />}
              onClick={handleCallNext}
              disabled={!isConnected || loading}
              size="lg"
              fullWidth
            >
              Llamar Siguiente Ticket
            </Button>
          </Stack>
        </Card>

        {currentTicket && (
          <Card withBorder style={{ flex: 1 }}>
            <Stack gap="md">
              <div>
                <Text fw={500} size="lg">Ticket Actual</Text>
                <Text size="sm" c="dimmed">
                  En atención
                </Text>
              </div>

              <Paper p="md" withBorder>
                <Group justify="center">
                  <Text size="xl" fw={700}>
                    {currentTicket.ticket.numero}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed" ta="center">
                  {currentTicket.ticket.tipo}
                </Text>
              </Paper>

              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={handleCompleteCurrent}
                disabled={!isConnected || loading}
                fullWidth
              >
                Marcar como Completado
              </Button>
            </Stack>
          </Card>
        )}
      </Group>

      {/* Tickets llamados recientemente */}
      <Card withBorder>
        <Title order={3} mb="md">Tickets Llamados Recientemente</Title>
        
        {recentCalled.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No hay tickets llamados recientemente
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ticket</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Cajero</Table.Th>
                <Table.Th>Hora Llamado</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentCalled.map((llamado) => (
                <Table.Tr key={llamado.id}>
                  <Table.Td>
                    <Text fw={500}>{llamado.ticket.numero}</Text>
                  </Table.Td>
                  <Table.Td>{llamado.ticket.tipo}</Table.Td>
                  <Table.Td>{llamado.cajeroId}</Table.Td>
                  <Table.Td>
                    {new Date(llamado.llamadoAt).toLocaleTimeString()}
                  </Table.Td>
                  <Table.Td>
                    <Text c={getStatusColor(llamado.ticket.estado)}>
                      {llamado.ticket.estado}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}