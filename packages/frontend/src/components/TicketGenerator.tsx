import {useEffect, useState} from 'react';
import {Alert, Button, Card, Group, LoadingOverlay, Paper, Select, Stack, Text, TextInput, Title} from '@mantine/core';
import {useNavigate} from 'react-router-dom';
import {IconArrowLeft, IconInfoCircle, IconTicket} from '@tabler/icons-react';
import {useSocket} from '../hooks/useSocket';
import {
  type CrearTicketData,
  type Ticket,
  type TipoIdentificacion as TipoIdentificacionType,
  TipoIdentificacion,
  type TipoTicket as TipoTicketType,
  TipoTicket
} from '../types/ticket';

export function TicketGenerator() {
  const {socket, isConnected} = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CrearTicketData>({
    tipo: TipoTicket.VENTANILLA,
    clienteNombre: '',
    tipoIdentificacion: TipoIdentificacion.CI,
    clienteDocumento: '',
    clienteTelefono: ''
  });

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

  const handleGenerateTicket = () => {
    if (!socket || !isConnected) {
      setError('No hay conexión con el servidor');
      return;
    }

    if (!formData.clienteNombre.trim()) {
      setError('El nombre del cliente es requerido');
      return;
    }

    if (formData.tipoIdentificacion !== TipoIdentificacion.TELEFONO && !formData.clienteDocumento) {
      setError('El documento es requerido para el tipo de identificación seleccionado');
      return;
    }

    if (formData.tipoIdentificacion === TipoIdentificacion.TELEFONO && !formData.clienteTelefono) {
      setError('El teléfono es requerido para el tipo de identificación seleccionado');
      return;
    }

    setLoading(true);
    setError(null);

    socket.emit('solicitar_ticket', formData);
  };

  const handleInputChange = (field: keyof CrearTicketData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTicketTypeInfo = (tipo: TipoTicketType) => {
    const types = {
      [TipoTicket.VENTANILLA]: {
        label: 'Ventanilla',
        description: 'Atención general y consultas',
        color: 'blue'
      },
      [TipoTicket.CAJA]: {
        label: 'Caja',
        description: 'Depósitos, retiros y transacciones',
        color: 'green'
      },
      [TipoTicket.ASESORIA]: {
        label: 'Asesoría',
        description: 'Asesoramiento financiero',
        color: 'orange'
      },
    };
    return types[tipo];
  };

  const showDocumentField = formData.tipoIdentificacion !== TipoIdentificacion.TELEFONO;
  const showPhoneField = formData.tipoIdentificacion === TipoIdentificacion.TELEFONO;

  return (
    <div style={{maxWidth: 600, margin: '0 auto', padding: '20px'}}>
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16}/>}
        onClick={() => navigate('/')}
        mb="md"
      >
        Volver a la pantalla principal
      </Button>

      <Stack gap="md">
        <div style={{textAlign: 'center'}}>
          <Title order={1}>Generar Nuevo Ticket</Title>
          <Text c="dimmed" size="lg">
            Complete sus datos para obtener un ticket
          </Text>
        </div>

        {!isConnected && (
          <Alert
            color="red"
            title="Sin conexión"
            icon={<IconInfoCircle/>}
          >
            No hay conexión con el servidor. Verifique que el backend esté ejecutándose.
          </Alert>
        )}

        {error && (
          <Alert
            color="red"
            title="Error"
            icon={<IconInfoCircle/>}
          >
            {error}
          </Alert>
        )}

        <LoadingOverlay visible={loading}/>

        {/* Formulario de datos del cliente */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Datos Personales</Title>

            <TextInput
              label="Nombre completo"
              placeholder="Ingrese su nombre completo"
              value={formData.clienteNombre}
              onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
              required
            />

            <Select
              label="Tipo de identificación"
              placeholder="Seleccione tipo"
              value={formData.tipoIdentificacion}
              onChange={(value) => handleInputChange('tipoIdentificacion', value as TipoIdentificacionType)}
              data={[
                {value: TipoIdentificacion.CI, label: 'Cédula de Identidad'},
                {value: TipoIdentificacion.PASAPORTE, label: 'Pasaporte'},
                {value: TipoIdentificacion.CEDULA_EXTRANJERA, label: 'Cédula Extranjera'},
                {value: TipoIdentificacion.TELEFONO, label: 'Teléfono'},
              ]}
              required
            />

            {showDocumentField && (
              <TextInput
                label="Número de documento"
                placeholder="Ingrese su documento"
                value={formData.clienteDocumento}
                onChange={(e) => handleInputChange('clienteDocumento', e.target.value)}
                required
              />
            )}

            {showPhoneField && (
              <TextInput
                label="Número de teléfono"
                placeholder="Ingrese su teléfono"
                value={formData.clienteTelefono}
                onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
                required
              />
            )}
          </Stack>
        </Card>

        {/* Selección de tipo de servicio */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Tipo de Servicio</Title>
            <Text c="dimmed">Seleccione el tipo de servicio que necesita</Text>

            <Group gap="md" grow>
              {Object.values(TipoTicket).map((tipo) => {
                const info = getTicketTypeInfo(tipo);

                return (
                  <Card
                    key={tipo}
                    padding="md"
                    withBorder
                    style={{
                      border: formData.tipo === tipo ? `2px solid var(--mantine-color-${info.color}-filled)` : '1px solid var(--mantine-color-gray-3)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('tipo', tipo)}
                  >
                    <Stack gap="sm" align="center">
                      <Text fw={500} c={info.color}>
                        {info.label}
                      </Text>
                      <Text size="sm" c="dimmed" style={{textAlign: 'center'}}>
                        {info.description}
                      </Text>
                    </Stack>
                  </Card>
                );
              })}
            </Group>

            <Button
              size="lg"
              leftSection={<IconTicket size={20}/>}
              onClick={handleGenerateTicket}
              disabled={!isConnected || loading || !formData.clienteNombre.trim()}
              fullWidth
              mt="md"
            >
              Generar Ticket
            </Button>
          </Stack>
        </Card>

        {/* Último ticket generado */}
        {lastTicket && (
          <Paper
            p="xl"
            withBorder
            style={{
              border: `4px solid var(--mantine-color-blue-filled)`,
              background: 'linear-gradient(45deg, var(--mantine-color-blue-1), var(--mantine-color-cyan-1))',
              textAlign: 'center'
            }}
          >
            <Stack gap="md">
              <Text fw={700} size="xl">¡Ticket Generado Exitosamente!</Text>
              <Text size="lg" c="dimmed">
                Su número de ticket es:
              </Text>
              <Text
                style={{
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: 'var(--mantine-color-blue-filled)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {lastTicket.numero}
              </Text>
              <Text size="sm">
                Por favor espere a ser llamado en la pantalla de visualización.
              </Text>
              <Text size="xs" c="dimmed">
                Tipo: {getTicketTypeInfo(lastTicket.tipo).label} |
                Cliente: {lastTicket.clienteNombre}
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </div>
  );
}