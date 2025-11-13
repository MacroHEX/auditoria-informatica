import {useEffect, useRef, useState} from 'react';
import {Socket} from 'socket.io-client';
import {socketService} from '../utils/socket';
import type {SocketEvents} from '../types/ticket';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<SocketEvents> | null>(null);

  useEffect(() => {
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

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