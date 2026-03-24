import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import useLeaderboardStore from '../store/leaderboardStore';

let socket: Socket | null = null;

const useWebSocket = () => {
  const { updateAgent, setConnectionStatus } = useLeaderboardStore();

  const connect = useCallback(() => {
    if (socket?.connected) return;

    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket?.emit('subscribe', { room: 'leaderboard' });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('rankUpdate', (data) => {
      updateAgent(data.agentId, {
        rank: data.newRank,
        previousRank: data.previousRank,
      });
    });

    socket.on('saleUpdate', (data) => {
      updateAgent(data.agentId, {
        dailySales: data.dailySales,
        dailyRevenue: data.dailyRevenue,
        weeklySales: data.weeklySales,
        weeklyRevenue: data.weeklyRevenue,
      });

      toast.success(
        `New sale by ${data.agentName}: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(data.saleAmount)}`
      );
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error. Retrying...');
    });
  }, [updateAgent, setConnectionStatus]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      setConnectionStatus('disconnected');
    }
  }, [setConnectionStatus]);

  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, emit };
};

export default useWebSocket;