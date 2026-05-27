import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const socketEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_SOCKET === 'true';

  useEffect(() => {
    if (!socketEnabled) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    if (user) {
      const newSocket = io('/', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join', {
          userId: user.id,
          role: user.role
        });
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, socketEnabled]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
