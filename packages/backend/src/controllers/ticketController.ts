import {Request, Response, Router} from 'express';
import {CrearTicketData, TicketService} from '../services/ticketService';
import {TipoIdentificacion, TipoTicket} from '@prisma/client';

const router: Router = Router();
const ticketService = new TicketService();

// Obtener todos los tickets
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tickets = await ticketService.obtenerTodosLosTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

// Generar nuevo ticket con información del cliente
router.post('/generar', async (req: Request, res: Response) => {
  try {
    const {
      tipo,
      clienteNombre,
      tipoIdentificacion,
      clienteDocumento,
      clienteTelefono
    } = req.body;

    // Validaciones básicas
    if (!tipo || !clienteNombre || !tipoIdentificacion) {
      return res.status(400).json({
        error: 'El tipo de ticket, nombre del cliente y tipo de identificación son requeridos'
      });
    }

    // Validar tipo de ticket
    if (!Object.values(TipoTicket).includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de ticket inválido'
      });
    }

    // Validar tipo de identificación
    if (!Object.values(TipoIdentificacion).includes(tipoIdentificacion)) {
      return res.status(400).json({
        error: 'Tipo de identificación inválido'
      });
    }

    const ticketData: CrearTicketData = {
      tipo,
      clienteNombre,
      tipoIdentificacion,
      clienteDocumento,
      clienteTelefono
    };

    const nuevoTicket = await ticketService.generarNuevoTicket(ticketData);
    res.status(201).json(nuevoTicket);
  } catch (error: any) {
    console.error('Error al generar ticket:', error);

    if (error.message.includes('Se requiere')) {
      return res.status(400).json({error: error.message});
    }

    res.status(500).json({error: 'Error interno del servidor'});
  }
});

// Llamar siguiente ticket
router.post('/llamar-siguiente', async (req: Request, res: Response) => {
  try {
    const {cajeroId} = req.body;

    if (!cajeroId) {
      return res.status(400).json({error: 'El ID del cajero es requerido'});
    }

    const ticketLlamado = await ticketService.llamarSiguienteTicket(cajeroId);

    if (!ticketLlamado) {
      return res.status(404).json({error: 'No hay tickets en espera'});
    }

    res.json(ticketLlamado);
  } catch (error) {
    console.error('Error al llamar siguiente ticket:', error);
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

// Completar ticket actual
router.post('/completar/:ticketId', async (req: Request, res: Response) => {
  try {
    const {ticketId} = req.params;
    const {cajeroId} = req.body;

    if (!cajeroId) {
      return res.status(400).json({error: 'El ID del cajero es requerido'});
    }

    const ticketCompletado = await ticketService.completarTicket(ticketId, cajeroId);

    if (!ticketCompletado) {
      return res.status(404).json({error: 'Ticket no encontrado'});
    }

    res.json(ticketCompletado);
  } catch (error) {
    console.error('Error al completar ticket:', error);
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

// Obtener tickets recientemente llamados
router.get('/llamados-recientes', async (req: Request, res: Response) => {
  try {
    const limite = parseInt(req.query.limite as string) || 10;
    const ticketsLlamados = await ticketService.obtenerTicketsLlamadosRecientes(limite);
    res.json(ticketsLlamados);
  } catch (error) {
    console.error('Error al obtener tickets llamados:', error);
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

// Endpoint de diagnóstico del sistema
router.get('/estado-sistema', async (_req: Request, res: Response) => {
  try {
    const estado = await ticketService.obtenerEstadoSistema();
    res.json(estado);
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    res.status(500).json({error: 'Error interno del servidor'});
  }
});

export default router;