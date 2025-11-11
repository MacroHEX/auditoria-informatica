import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../utils/socket';
import type { SocketEvents } from '../types/ticket';

// PUNTO DE AUDITORIA (Identify):
// Hook personalizado que encapsula la lógica de Socket.IO
// Sigue el principio de responsabilidad única

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<SocketEvents> | null>(null);

  useEffect(() => {
    // Conectar al socket al montar el componente
    const socket = socketService.connect();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      console.log('useSocket: Conectado al servidor');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('useSocket: Desconectado del servidor');
    };

    // Configurar listeners de conexión
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Verificar estado actual de conexión
    if (socket.connected) {
      setIsConnected(true);
    }

    // Cleanup al desmontar el componente
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
  };
}