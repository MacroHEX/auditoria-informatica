export const TipoTicket = {
  VENTANILLA: 'VENTANILLA',
  CAJA: 'CAJA',
  ASESORIA: 'ASESORIA'
} as const;

export type TipoTicket = typeof TipoTicket[keyof typeof TipoTicket];

export const EstadoTicket = {
  EnEspera: 'EnEspera',
  Llamado: 'Llamado',
  Atendido: 'Atendido',
  Cancelado: 'Cancelado'
} as const;

export type EstadoTicket = typeof EstadoTicket[keyof typeof EstadoTicket];

export const TipoIdentificacion = {
  CI: 'CI',
  PASAPORTE: 'PASAPORTE',
  CEDULA_EXTRANJERA: 'CEDULA_EXTRANJERA',
  TELEFONO: 'TELEFONO'
} as const;

export type TipoIdentificacion = typeof TipoIdentificacion[keyof typeof TipoIdentificacion];

export interface Ticket {
  id: string;
  numero: string;
  tipo: TipoTicket;
  estado: EstadoTicket;
  clienteNombre: string;
  tipoIdentificacion: TipoIdentificacion;
  clienteDocumento?: string;
  clienteTelefono?: string;
  createdAt: string;
  updatedAt: string;
  llamadoAt?: string;
}

export interface CrearTicketData {
  tipo: TipoTicket;
  clienteNombre: string;
  tipoIdentificacion: TipoIdentificacion;
  clienteDocumento?: string;
  clienteTelefono?: string;
}

export interface LlamadoTicket {
  id: string;
  ticketId: string;
  cajeroId: string;
  llamadoAt: string;
  completado: boolean;
  ticket: Ticket;
}

export interface SocketEvents {
  // Eventos que el cliente RECIBE del servidor
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  estado_inicial: (data: { tickets: Ticket[]; ultimosLlamados: LlamadoTicket[] }) => void;
  nuevo_ticket_generado: (ticket: Ticket) => void;
  ticket_llamado: (data: { ticket: Ticket; llamado: LlamadoTicket; cajeroId: string }) => void;
  ticket_completado: (ticket: Ticket) => void;
  no_hay_tickets: (data: { mensaje: string }) => void;
  error: (data: { mensaje: string }) => void;
  ticket_generado: (ticket: Ticket) => void;

  // Eventos que el cliente ENVÍA al servidor
  obtener_estado_inicial: () => void;
  solicitar_ticket: (data: CrearTicketData) => void;
  llamar_siguiente_ticket: (data: { cajeroId: string }) => void;
  completar_ticket: (data: { ticketId: string; cajeroId: string }) => void;
}