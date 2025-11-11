import { PrismaClient, TipoTicket, EstadoTicket, Ticket, LlamadoTicket } from '@prisma/client';

// 📝 PUNTO DE AUDITORÍA (Identify): 
// Servicio bien estructurado que sigue principios SOLID
// Fácil de auditar y mantener

export class TicketService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Genera un nuevo ticket basado en el tipo especificado
   */
  async generarNuevoTicket(tipo: TipoTicket): Promise<Ticket> {
    try {
      // Obtener el último número de ticket del mismo tipo
      const ultimoTicket = await this.prisma.ticket.findFirst({
        where: { tipo },
        orderBy: { createdAt: 'desc' },
      });

      // Generar nuevo número de ticket
      const nuevoNumero = this.generarNumeroTicket(tipo, ultimoTicket?.numero);

      // Crear el nuevo ticket en la base de datos
      const ticket = await this.prisma.ticket.create({
        data: {
          numero: nuevoNumero,
          tipo: tipo,
          estado: EstadoTicket.EnEspera,
        },
      });

      console.log(`🎫 Nuevo ticket generado: ${nuevoNumero}`);
      return ticket;

    } catch (error) {
      console.error('❌ Error en generarNuevoTicket:', error);
      throw new Error('No se pudo generar el ticket');
    }
  }

  /**
   * Genera el número de ticket secuencial (V01, V02, C01, etc.)
   */
  private generarNumeroTicket(tipo: TipoTicket, ultimoNumero?: string): string {
    const prefijos = {
      [TipoTicket.VENTANILLA]: 'V',
      [TipoTicket.CAJA]: 'C',
      [TipoTicket.ASESORIA]: 'A'
    };

    const prefijo = prefijos[tipo];
    let siguienteNumero = 1;

    if (ultimoNumero) {
      const ultimoNum = parseInt(ultimoNumero.slice(1));
      siguienteNumero = ultimoNum + 1;
    }

    return `${prefijo}${siguienteNumero.toString().padStart(2, '0')}`;
  }

  /**
   * Llama al siguiente ticket en espera
   */
  async llamarSiguienteTicket(cajeroId: string): Promise<{ticket: Ticket, llamado: LlamadoTicket} | null> {
    // 📝 PUNTO DE AUDITORÍA (Respond): 
    // Transacción de base de datos con manejo de errores
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Buscar el siguiente ticket en espera (más antiguo primero)
        const siguienteTicket = await tx.ticket.findFirst({
          where: { estado: EstadoTicket.EnEspera },
          orderBy: { createdAt: 'asc' },
        });

        if (!siguienteTicket) {
          return null;
        }

        // Actualizar estado del ticket a "Llamado"
        const ticketActualizado = await tx.ticket.update({
          where: { id: siguienteTicket.id },
          data: { 
            estado: EstadoTicket.Llamado,
            llamadoAt: new Date()
          },
        });

        // Registrar el llamado
        const registroLlamado = await tx.llamadoTicket.create({
          data: {
            ticketId: ticketActualizado.id,
            cajeroId: cajeroId,
            llamadoAt: new Date(),
          },
          include: { ticket: true }
        });

        console.log(`📢 Ticket ${ticketActualizado.numero} llamado por cajero ${cajeroId}`);

        return {
          ticket: ticketActualizado,
          llamado: registroLlamado
        };
      });

    } catch (error) {
      console.error('❌ Error en llamarSiguienteTicket:', error);
      throw new Error('No se pudo llamar el siguiente ticket');
    }
  }

  /**
   * Completa la atención de un ticket
   */
  async completarTicket(ticketId: string, cajeroId: string): Promise<Ticket | null> {
    try {
      // Verificar que el ticket existe y fue llamado por el mismo cajero
      const llamado = await this.prisma.llamadoTicket.findFirst({
        where: { 
          ticketId,
          cajeroId,
          completado: false
        },
        include: { ticket: true }
      });

      if (!llamado) {
        return null;
      }

      // Actualizar el ticket a estado "Atendido"
      const ticketCompletado = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { estado: EstadoTicket.Atrendido },
      });

      // Marcar el llamado como completado
      await this.prisma.llamadoTicket.update({
        where: { id: llamado.id },
        data: { completado: true },
      });

      console.log(`✅ Ticket ${ticketCompletado.numero} completado por cajero ${cajeroId}`);

      return ticketCompletado;

    } catch (error) {
      console.error('❌ Error en completarTicket:', error);
      throw new Error('No se pudo completar el ticket');
    }
  }

  /**
   * Obtiene todos los tickets
   */
  async obtenerTodosLosTickets(): Promise<Ticket[]> {
    try {
      return await this.prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('❌ Error en obtenerTodosLosTickets:', error);
      throw new Error('No se pudieron obtener los tickets');
    }
  }

  /**
   * Obtiene los tickets llamados recientemente
   */
  async obtenerTicketsLlamadosRecientes(limite: number = 10): Promise<LlamadoTicket[]> {
    try {
      return await this.prisma.llamadoTicket.findMany({
        where: { completado: false },
        include: { ticket: true },
        orderBy: { llamadoAt: 'desc' },
        take: limite,
      });
    } catch (error) {
      console.error('❌ Error en obtenerTicketsLlamadosRecientes:', error);
      throw new Error('No se pudieron obtener los tickets llamados');
    }
  }

  /**
   * Obtiene el estado actual del sistema para auditoría
   */
  async obtenerEstadoSistema(): Promise<any> {
    try {
      const [
        totalTickets,
        ticketsEnEspera,
        ticketsLlamados,
        ticketsAtendidos,
        ultimosLlamados
      ] = await Promise.all([
        this.prisma.ticket.count(),
        this.prisma.ticket.count({ where: { estado: EstadoTicket.EnEspera } }),
        this.prisma.ticket.count({ where: { estado: EstadoTicket.Llamado } }),
        this.prisma.ticket.count({ where: { estado: EstadoTicket.Atrendido } }),
        this.obtenerTicketsLlamadosRecientes(5)
      ]);

      return {
        totalTickets,
        ticketsEnEspera,
        ticketsLlamados,
        ticketsAtendidos,
        ultimosLlamados,
        timestamp: new Date().toISOString(),
        // 📝 PUNTO DE AUDITORÍA (Detect): 
        // Información del sistema expuesta - podría ser sensible en producción
        entorno: process.env.NODE_ENV,
        baseDeDatos: 'PostgreSQL'
      };

    } catch (error) {
      console.error('❌ Error en obtenerEstadoSistema:', error);
      throw new Error('No se pudo obtener el estado del sistema');
    }
  }
}