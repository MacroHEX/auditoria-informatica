import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Paper,
  Grid,
  Alert,
  Badge
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useSocket } from '../hooks/useSocket';
import { type Ticket, type CalledTicket, TicketType, TicketStatus } from '../types/ticket';

// PUNTO DE AUDITORIA (Detect):
// Pantalla pública que muestra información en tiempo real
// No requiere autenticación - diseño intencional para visualización pública

export function DisplayPanel() {
  const { socket, isConnected } = useSocket();
  const [currentTickets, setCurrentTickets] = useState<Ticket[]>([]);
  const [recentCalled, setRecentCalled] = useState<CalledTicket[]>([]);
  const [lastCalled, setLastCalled] = useState<CalledTicket | null>(null);

  // Escuchar eventos del socket para actualizaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleInitialState = (data: { tickets: Ticket[]; ultimosLlamados: CalledTicket[] }) => {
      setCurrentTickets(data.tickets);
      setRecentCalled(data.ultimosLlamados);
      setLastCalled(data.ultimosLlamados[0] || null);
    };

    const handleNewTicket = (ticket: Ticket) => {
      setCurrentTickets(prev => [ticket, ...prev]);
    };

    const handleTicketCalled = (data: { ticket: Ticket; llamado: CalledTicket; cajeroId: string }) => {
      // Actualizar estado del ticket
      setCurrentTickets(prev => 
        prev.map(t => 
          t.id === data.ticket.id ? data.ticket : t
        )
      );
      
      // Agregar a recientemente llamados
      setRecentCalled(prev => [data.llamado, ...prev.slice(0, 9)]);
      setLastCalled(data.llamado);
    };

    const handleTicketCompleted = (ticket: Ticket) => {
      setCurrentTickets(prev => 
        prev.map(t => 
          t.id === ticket.id ? ticket : t
        )
      );
    };

    // Configurar todos los listeners
    socket.on('estado_inicial', handleInitialState);
    socket.on('nuevo_ticket_generado', handleNewTicket);
    socket.on('ticket_llamado', handleTicketCalled);
    socket.on('ticket_completado', handleTicketCompleted);

    // Solicitar estado inicial
    socket.emit('obtener_estado_inicial');

    // Cleanup
    return () => {
      socket.off('estado_inicial', handleInitialState);
      socket.off('nuevo_ticket_generado', handleNewTicket);
      socket.off('ticket_llamado', handleTicketCalled);
      socket.off('ticket_completado', handleTicketCompleted);
    };
  }, [socket]);

  // Filtrar tickets por estado
  const waitingTickets = currentTickets.filter(t => t.estado === TicketStatus.EnEspera);
  const calledTickets = currentTickets.filter(t => t.estado === TicketStatus.Llamado);
  const completedTickets = currentTickets.filter(t => t.estado === TicketStatus.Atrendido);

  const getTicketTypeColor = (tipo: TicketType) => {
    const colors = {
      [TicketType.VENTANILLA]: 'blue',
      [TicketType.CAJA]: 'green',
      [TicketType.ASESORIA]: 'orange',
    };
    return colors[tipo];
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      [TicketStatus.EnEspera]: 'blue',
      [TicketStatus.Llamado]: 'orange',
      [TicketStatus.Atrendido]: 'green',
      [TicketStatus.Cancelado]: 'red',
    };
    return colors[status];
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <Title order={1} c="blue">Sistema de Tickets - Banco</Title>
        <Text size="xl" c="dimmed">Pantalla de Información al Público</Text>
        
        {!isConnected && (
          <Alert color="red" title="Actualización en tiempo real no disponible" icon={<IconInfoCircle />} mt="md">
            Mostrando información estática. Reconectando...
          </Alert>
        )}
      </div>

      {/* Último ticket llamado - Display principal */}
      {lastCalled && (
        <Paper 
          p="xl" 
          withBorder 
          style={{ 
            border: '4px solid var(--mantine-color-orange-filled)',
            background: 'linear-gradient(45deg, var(--mantine-color-orange-1), var(--mantine-color-yellow-1))'
          }}
        >
          <Stack gap="md" align="center">
            <Badge color="orange" size="xl" variant="filled">
              ÚLTIMO TICKET LLAMADO
            </Badge>
            
            <Text 
              style={{ 
                fontSize: '4rem', 
                fontWeight: 900,
                color: 'var(--mantine-color-orange-filled)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {lastCalled.ticket.numero}
            </Text>
            
            <Group gap="xl">
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>Tipo</Text>
                <Badge color={getTicketTypeColor(lastCalled.ticket.tipo)} size="lg">
                  {lastCalled.ticket.tipo}
                </Badge>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>Cajero</Text>
                <Text size="lg">{lastCalled.cajeroId}</Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text fw={500}>Hora</Text>
                <Text size="lg">
                  {new Date(lastCalled.llamadoAt).toLocaleTimeString()}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Grid de información */}
      <Grid gutter="md">
        {/* Tickets en espera */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder h="100%">
            <Stack gap="md">
              <div style={{ textAlign: 'center' }}>
                <Badge color="blue" size="xl" variant="light">
                  En Espera
                </Badge>
                <Text size="2rem" fw={900} c="blue" mt="xs">
                  {waitingTickets.length}
                </Text>
              </div>

              <Stack gap="xs">
                {waitingTickets.slice(0, 5).map(ticket => (
                  <Group key={ticket.id} justify="space-between">
                    <Badge 
                      color={getTicketTypeColor(ticket.tipo)}
                      variant="filled"
                      size="lg"
                    >
                      {ticket.numero}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {ticket.tipo}
                    </Text>
                  </Group>
                ))}
                
                {waitingTickets.length > 5 && (
                  <Text size="sm" c="dimmed" ta="center">
                    +{waitingTickets.length - 5} más en espera
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Recientemente llamados */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder h="100%">
            <Stack gap="md">
              <div style={{ textAlign: 'center' }}>
                <Badge color="orange" size="xl" variant="light">
                  Recientemente Llamados
                </Badge>
              </div>

              <Stack gap="xs">
                {recentCalled.slice(0, 5).map(llamado => (
                  <Group key={llamado.id} justify="space-between">
                    <Group gap="xs">
                      <Badge 
                        color={getTicketTypeColor(llamado.ticket.tipo)}
                        variant="filled"
                      >
                        {llamado.ticket.numero}
                      </Badge>
                      <Text size="sm">{llamado.cajeroId}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {new Date(llamado.llamadoAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </Group>
                ))}
                
                {recentCalled.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center">
                    No hay tickets llamados recientemente
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Estadísticas */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder h="100%">
            <Stack gap="md">
              <div style={{ textAlign: 'center' }}>
                <Badge color="green" size="xl" variant="light">
                  Estadísticas
                </Badge>
              </div>

              <Stack gap="md">
                <Group justify="space-between">
                  <Text>Total Tickets Hoy:</Text>
                  <Badge color="gray" variant="light">
                    {currentTickets.length}
                  </Badge>
                </Group>
                
                <Group justify="space-between">
                  <Text>En Espera:</Text>
                  <Badge color="blue" variant="light">
                    {waitingTickets.length}
                  </Badge>
                </Group>
                
                <Group justify="space-between">
                  <Text>En Atención:</Text>
                  <Badge color="orange" variant="light">
                    {calledTickets.length}
                  </Badge>
                </Group>
                
                <Group justify="space-between">
                  <Text>Completados:</Text>
                  <Badge color="green" variant="light">
                    {completedTickets.length}
                  </Badge>
                </Group>

                {/* PUNTO DE AUDITORIA (Detect): */}
                {/* Información de conexión para monitoreo */}
                <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '16px' }}>
                  <Text size="sm" fw={500} c="dimmed">Estado del Sistema</Text>
                  <Group justify="space-between" mt="xs">
                    <Text size="sm">Conexión:</Text>
                    <Badge color={isConnected ? 'green' : 'red'} variant="light">
                      {isConnected ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Última actualización:</Text>
                    <Text size="sm">{new Date().toLocaleTimeString()}</Text>
                  </Group>
                </div>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Información de tipos de servicio */}
      <Card withBorder>
        <Title order={3} mb="md">Tipos de Servicio</Title>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap="sm">
              <Badge color="blue" variant="filled">V</Badge>
              <Text size="sm">Ventanilla - Atención general y consultas</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap="sm">
              <Badge color="green" variant="filled">C</Badge>
              <Text size="sm">Caja - Depósitos, retiros y transacciones</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap="sm">
              <Badge color="orange" variant="filled">A</Badge>
              <Text size="sm">Asesoría - Asesoramiento financiero</Text>
            </Group>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  );
}