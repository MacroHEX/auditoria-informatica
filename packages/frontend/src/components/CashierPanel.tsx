import {useEffect, useState} from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import {useNavigate} from 'react-router-dom';
import {IconArrowLeft, IconCheck, IconInfoCircle, IconPhone} from '@tabler/icons-react';
import {useSocket} from '../hooks/useSocket';
import {
  EstadoTicket,
  type EstadoTicket as EstadoTicketType,
  type LlamadoTicket,
  type Ticket,
  TipoIdentificacion,
  type TipoIdentificacion as TipoIdentificacionType,
  TipoTicket,
  type TipoTicket as TipoTicketType
} from '../types/ticket';

export function CashierPanel() {
  const {socket, isConnected} = useSocket();
  const navigate = useNavigate();
  const [cajeroId, setCajeroId] = useState('cajero-01');
  const [currentTicket, setCurrentTicket] = useState<LlamadoTicket | null>(null);
  const [recentCalled, setRecentCalled] = useState<LlamadoTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleTicketCalled = (data: { ticket: Ticket; llamado: LlamadoTicket; cajeroId: string }) => {
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

    socket.on('ticket_llamado', handleTicketCalled);
    socket.on('ticket_completado', handleTicketCompleted);
    socket.on('no_hay_tickets', handleNoTickets);
    socket.on('error', handleError);

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
    socket.emit('llamar_siguiente_ticket', {cajeroId});
  };

  const handleCompleteCurrent = () => {
    if (!socket || !isConnected || !currentTicket) {
      return;
    }

    setLoading(true);
    socket.emit('completar_ticket', {
      ticketId: currentTicket.ticketId,
      cajeroId: currentTicket.cajeroId
    });
  };

  const getStatusColor = (status: EstadoTicketType) => {
    const colors = {
      [EstadoTicket.EnEspera]: 'blue',
      [EstadoTicket.Llamado]: 'orange',
      [EstadoTicket.Atendido]: 'green',
      [EstadoTicket.Cancelado]: 'red',
    };
    return colors[status];
  };

  const getTicketTypeColor = (tipo: TipoTicketType) => {
    const colors = {
      [TipoTicket.VENTANILLA]: 'blue',
      [TipoTicket.CAJA]: 'green',
      [TipoTicket.ASESORIA]: 'orange',
    };
    return colors[tipo];
  };

  const getTipoIdentificacionText = (tipo: TipoIdentificacionType) => {
    const texts = {
      [TipoIdentificacion.CI]: 'CI',
      [TipoIdentificacion.PASAPORTE]: 'Pasaporte',
      [TipoIdentificacion.CEDULA_EXTRANJERA]: 'Céd. Ext.',
      [TipoIdentificacion.TELEFONO]: 'Teléfono',
    };
    return texts[tipo];
  };

  return (
    <Stack gap="md" p="md">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16}/>}
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </Group>

      <div>
        <Title order={2}>Panel de Cajero</Title>
        <Text c="dimmed">
          Gestión de tickets y atención al cliente
        </Text>
      </div>

      {!isConnected && (
        <Alert color="red" title="Sin conexión" icon={<IconInfoCircle/>}>
          No hay conexión con el servidor. Verifique que el backend esté ejecutándose.
        </Alert>
      )}

      {error && (
        <Alert color="red" title="Error" icon={<IconInfoCircle/>}>
          {error}
        </Alert>
      )}

      <LoadingOverlay visible={loading}/>

      <Card withBorder>
        <Group justify="space-between">
          <div>
            <Text fw={500}>Identificación de Cajero</Text>
            <Text size="sm" c="dimmed">
              Ingrese su identificador de cajero
            </Text>
          </div>
          <TextInput
            value={cajeroId}
            onChange={(e) => setCajeroId(e.target.value)}
            placeholder="ID del cajero"
            style={{width: 200}}
          />
        </Group>
      </Card>

      <Group gap="md" align="stretch">
        <Card withBorder style={{flex: 1}}>
          <Stack gap="md">
            <div>
              <Text fw={500} size="lg">Llamar Siguiente Ticket</Text>
              <Text size="sm" c="dimmed">
                Llama al siguiente ticket en espera
              </Text>
            </div>

            <Button
              color="blue"
              leftSection={<IconPhone size={16}/>}
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
          <Card withBorder style={{flex: 2}}>
            <Stack gap="md">
              <div>
                <Text fw={500} size="lg">Ticket Actual en Atención</Text>
                <Text size="sm" c="dimmed">
                  Cliente siendo atendido
                </Text>
              </div>

              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="center">
                    <Text size="xl" fw={700}>
                      {currentTicket.ticket.numero}
                    </Text>
                    <Badge color={getTicketTypeColor(currentTicket.ticket.tipo)} size="lg">
                      {currentTicket.ticket.tipo}
                    </Badge>
                  </Group>

                  <Group justify="apart" mt="md">
                    <Stack gap="xs">
                      <Text fw={500}>Información del Cliente</Text>
                      <Text size="sm"><strong>Nombre:</strong> {currentTicket.ticket.clienteNombre}</Text>
                      <Text size="sm">
                        <strong>Identificación:</strong> {getTipoIdentificacionText(currentTicket.ticket.tipoIdentificacion)}
                      </Text>
                      {currentTicket.ticket.clienteDocumento && (
                        <Text size="sm"><strong>Documento:</strong> {currentTicket.ticket.clienteDocumento}</Text>
                      )}
                      {currentTicket.ticket.clienteTelefono && (
                        <Text size="sm"><strong>Teléfono:</strong> {currentTicket.ticket.clienteTelefono}</Text>
                      )}
                    </Stack>
                  </Group>
                </Stack>
              </Paper>

              <Button
                color="green"
                leftSection={<IconCheck size={16}/>}
                onClick={handleCompleteCurrent}
                disabled={!isConnected || loading}
                fullWidth
                size="lg"
              >
                Marcar como Completado
              </Button>
            </Stack>
          </Card>
        )}
      </Group>

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
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Identificación</Table.Th>
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
                  <Table.Td>
                    <Badge color={getTicketTypeColor(llamado.ticket.tipo)}>
                      {llamado.ticket.tipo}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{llamado.ticket.clienteNombre}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{getTipoIdentificacionText(llamado.ticket.tipoIdentificacion)}</Text>
                    {llamado.ticket.clienteDocumento && (
                      <Text size="xs" c="dimmed">{llamado.ticket.clienteDocumento}</Text>
                    )}
                    {llamado.ticket.clienteTelefono && (
                      <Text size="xs" c="dimmed">{llamado.ticket.clienteTelefono}</Text>
                    )}
                  </Table.Td>
                  <Table.Td>{llamado.cajeroId}</Table.Td>
                  <Table.Td>
                    {new Date(llamado.llamadoAt).toLocaleTimeString()}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(llamado.ticket.estado)}>
                      {llamado.ticket.estado}
                    </Badge>
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