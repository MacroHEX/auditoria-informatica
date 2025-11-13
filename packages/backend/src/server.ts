import App from './app';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Crear instancia de la aplicación
const appInstance = new App();
const server = appInstance.server;

// Manejo de errores no capturados
process.on('uncaughtException', (error: Error) => {
  console.error('ERROR NO CAPTURADO:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('PROMESA RECHAZADA NO MANEJADA en:', promise, 'razón:', reason);
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('Conectado a la base de datos PostgreSQL');

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`Health check disponible en: http://localhost:${PORT}/health`);
      console.log(`Socket.IO configurado para conexiones en tiempo real`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo graceful de shutdown
process.on('SIGTERM', async () => {
  console.log('Recibido SIGTERM, cerrando servidor gracefulmente...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar la aplicación
startServer();