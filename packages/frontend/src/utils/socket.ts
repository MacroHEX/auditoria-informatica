import {io, Socket} from 'socket.io-client';
import type {SocketEvents} from '../types/ticket';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket<SocketEvents, SocketEvents> | null = null;

  connect(): Socket<SocketEvents, SocketEvents> {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

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

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket<SocketEvents, SocketEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();