import {Server as SocketIOServer} from 'socket.io';
import {TicketService} from '../services/ticketService';
import {TipoIdentificacion, TipoTicket} from '@prisma/client';

const ticketService = new TicketService();

export function setupSocketHandlers(io: SocketIOServer): void {
  console.log('Configurando handlers de Socket.IO...');

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Emitir estado inicial del sistema al nuevo cliente
    socket.on('obtener_estado_inicial', async () => {
      try {
        const [tickets, ultimosLlamados] = await Promise.all([
          ticketService.obtenerTodosLosTickets(),
          ticketService.obtenerTicketsLlamadosRecientes(10)
        ]);

        socket.emit('estado_inicial', {
          tickets,
          ultimosLlamados,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error al obtener estado inicial:', error);
        socket.emit('error', {mensaje: 'Error al obtener estado inicial'});
      }
    });

    // Escuchar solicitud de nuevo ticket con información del cliente
    socket.on('solicitar_ticket', async (data: {
      tipo: string;
      clienteNombre: string;
      tipoIdentificacion: string;
      clienteDocumento?: string;
      clienteTelefono?: string;
    }) => {
      try {
        console.log(`Solicitud de nuevo ticket tipo: ${data.tipo} para cliente: ${data.clienteNombre}`);

        const nuevoTicket = await ticketService.generarNuevoTicket({
          tipo: data.tipo as TipoTicket,
          clienteNombre: data.clienteNombre,
          tipoIdentificacion: data.tipoIdentificacion as TipoIdentificacion,
          clienteDocumento: data.clienteDocumento,
          clienteTelefono: data.clienteTelefono
        });

        // Emitir a TODOS los clientes el nuevo ticket
        io.emit('nuevo_ticket_generado', nuevoTicket);

        // Confirmación al cliente que solicitó
        socket.emit('ticket_generado', nuevoTicket);

      } catch (error: any) {
        console.error('Error al generar ticket:', error);
        socket.emit('error', {
          mensaje: error.message || 'Error al generar ticket'
        });
      }
    });

    // Escuchar llamado de siguiente ticket
    socket.on('llamar_siguiente_ticket', async (data: { cajeroId: string }) => {
      try {
        console.log(`Cajero ${data.cajeroId} llamando siguiente ticket`);

        const resultado = await ticketService.llamarSiguienteTicket(data.cajeroId);

        if (resultado) {
          // Emitir a TODOS los clientes el ticket llamado
          io.emit('ticket_llamado', {
            ticket: resultado.ticket,
            llamado: resultado.llamado,
            cajeroId: data.cajeroId
          });

          console.log(`Ticket ${resultado.ticket.numero} llamado públicamente`);
        } else {
          socket.emit('no_hay_tickets', {mensaje: 'No hay tickets en espera'});
        }

      } catch (error) {
        console.error('Error al llamar siguiente ticket:', error);
        socket.emit('error', {mensaje: 'Error al llamar siguiente ticket'});
      }
    });

    // Escuchar completado de ticket
    socket.on('completar_ticket', async (data: { ticketId: string; cajeroId: string }) => {
      try {
        console.log(`Completando ticket ${data.ticketId} por cajero ${data.cajeroId}`);

        const ticketCompletado = await ticketService.completarTicket(
          data.ticketId,
          data.cajeroId
        );

        if (ticketCompletado) {
          // Emitir a TODOS los clientes la actualización
          io.emit('ticket_completado', ticketCompletado);
          console.log(`Ticket ${ticketCompletado.numero} marcado como completado`);
        } else {
          socket.emit('error', {mensaje: 'No se pudo completar el ticket'});
        }

      } catch (error) {
        console.error('Error al completar ticket:', error);
        socket.emit('error', {mensaje: 'Error al completar ticket'});
      }
    });

    // Manejo de desconexión
    socket.on('disconnect', (reason) => {
      console.log(`Cliente desconectado: ${socket.id} - Razón: ${reason}`);
    });

    // Manejo de errores de socket
    socket.on('error', (error) => {
      console.error(`Error en socket ${socket.id}:`, error);
    });
  });

  console.log('Handlers de Socket.IO configurados correctamente');
}