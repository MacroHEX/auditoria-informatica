// PUNTO DE AUDITORIA (Identify): 
// Tipos bien definidos para el sistema de tickets
// Facilita el mantenimiento y comprensión del código

export enum TicketType {
  VENTANILLA = 'VENTANILLA',
  CAJA = 'CAJA',
  ASESORIA = 'ASESORIA'
}

export enum TicketStatus {
  EnEspera = 'EnEspera',
  Llamado = 'Llamado',
  Atendido = 'Atendido',
  Cancelado = 'Cancelado'
}

export interface Ticket {
  id: string;
  numero: string;
  tipo: TicketType;
  estado: TicketStatus;
  createdAt: string;
  updatedAt: string;
  llamadoAt: string | null;
}

export interface CalledTicket {
  id: string;
  ticketId: string;
  cajeroId: string;
  llamadoAt: string;
  completado: boolean;
  ticket: Ticket;
}

export interface SocketEvents {
  // Eventos emitidos por el cliente
  'solicitar_ticket': (data: { tipo: TicketType }) => void;
  'llamar_siguiente_ticket': (data: { cajeroId: string }) => void;
  'completar_ticket': (data: { ticketId: string; cajeroId: string }) => void;
  'obtener_estado_inicial': () => void;
  
  // Eventos recibidos del servidor
  'estado_inicial': (data: { tickets: Ticket[]; ultimosLlamados: CalledTicket[] }) => void;
  'nuevo_ticket_generado': (ticket: Ticket) => void;
  'ticket_llamado': (data: { ticket: Ticket; llamado: CalledTicket; cajeroId: string }) => void;
  'ticket_completado': (ticket: Ticket) => void;
  'no_hay_tickets': (data: { mensaje: string }) => void;
  'error': (data: { mensaje: string }) => void;
}