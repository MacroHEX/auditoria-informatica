import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server as SocketIOServer} from 'socket.io';
import {errorHandler} from './middleware/errorHandler';
import {setupSocketHandlers} from './sockets/socketHandlers';
import ticketRoutes from './controllers/ticketController';

// Configuración centralizada de la aplicación Express
class App {
  public app: express.Application;
  public server: ReturnType<typeof createServer>;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketHandlers();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Middleware para parsing JSON
    this.app.use(express.json());

    // Configuración de CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true
    }));

    // Middleware de logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Rutas de la API REST
    this.app.use('/api/tickets', ticketRoutes);

    // Ruta de health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Ticket System API'
      });
    });

    // Endpoint de debug (vulnerabilidad intencional para demostración)
    this.app.get('/api/debug/tickets', async (req, res) => {
      try {
        const {PrismaClient} = require('@prisma/client');
        const prisma = new PrismaClient();
        const tickets = await prisma.ticket.findMany();
        res.json(tickets);
      } catch (error) {
        res.status(500).json({error: 'Error al obtener tickets'});
      }
    });
  }

  private initializeSocketHandlers(): void {
    setupSocketHandlers(this.io);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }
}

export default App;