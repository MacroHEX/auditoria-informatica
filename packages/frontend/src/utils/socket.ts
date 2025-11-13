import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types/ticket';

// PUNTO DE AUDITORIA (Protect):
// Configuración centralizada del socket
// Nota: En producción, la URL debería venir de variables de entorno

const SOCKET_URL = 'http://10.10.10.33:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket<SocketEvents> {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      // PUNTO DE AUDITORIA (Detect):
      // Manejadores de eventos de conexión para monitoreo
      this.socket.on('connect', () => {
        console.log('Socket conectado:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket desconectado:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión socket:', error);
      });
    }

    return this.socket as Socket<SocketEvents>;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket<SocketEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();