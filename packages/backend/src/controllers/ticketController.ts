import { Router, Request, Response } from 'express';
import { TicketService } from '../services/ticketService';

const router = Router();
const ticketService = new TicketService();

// 📝 PUNTO DE AUDITORÍA (Protect): 
// Controlador sin middleware de autenticación implementado
// Esto será un hallazgo crítico en la auditoría

// Obtener todos los tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const tickets = await ticketService.obtenerTodosLosTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar nuevo ticket
router.post('/generar', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: 'El tipo de ticket es requerido' });
    }

    const nuevoTicket = await ticketService.generarNuevoTicket(tipo);
    res.status(201).json(nuevoTicket);
  } catch (error) {
    console.error('Error al generar ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Llamar siguiente ticket
router.post('/llamar-siguiente', async (req: Request, res: Response) => {
  try {
    const { cajeroId } = req.body;

    if (!cajeroId) {
      return res.status(400).json({ error: 'El ID del cajero es requerido' });
    }

    const ticketLlamado = await ticketService.llamarSiguienteTicket(cajeroId);
    
    if (!ticketLlamado) {
      return res.status(404).json({ error: 'No hay tickets en espera' });
    }

    res.json(ticketLlamado);
  } catch (error) {
    console.error('Error al llamar siguiente ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Completar ticket actual
router.post('/completar/:ticketId', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { cajeroId } = req.body;

    if (!cajeroId) {
      return res.status(400).json({ error: 'El ID del cajero es requerido' });
    }

    const ticketCompletado = await ticketService.completarTicket(ticketId, cajeroId);
    
    if (!ticketCompletado) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json(ticketCompletado);
  } catch (error) {
    console.error('Error al completar ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📝 PUNTO DE AUDITORÍA (Detect): 
// Endpoint de diagnóstico sin protección - podría exponer información sensible
router.get('/estado-sistema', async (req: Request, res: Response) => {
  try {
    const estado = await ticketService.obtenerEstadoSistema();
    res.json(estado);
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;