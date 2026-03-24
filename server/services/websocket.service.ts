import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';

let io: Server | null = null;

export const initializeWebSocket = (socketServer: Server) => {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('subscribe', (data) => {
      if (data.room === 'leaderboard') {
        socket.join('leaderboard');
        logger.info(`Client ${socket.id} joined leaderboard room`);
      }
    });

    socket.on('unsubscribe', (data) => {
      if (data.room === 'leaderboard') {
        socket.leave('leaderboard');
        logger.info(`Client ${socket.id} left leaderboard room`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });
};

export const broadcastSaleUpdate = (data: any) => {
  if (!io) {
    logger.warn('WebSocket server not initialized');
    return;
  }

  io.to('leaderboard').emit('saleUpdate', {
    agentId: data.agentId,
    agentName: data.agentName,
    saleAmount: data.saleAmount,
    dailySales: data.dailySales,
    dailyRevenue: data.dailyRevenue,
    weeklySales: data.weeklySales,
    weeklyRevenue: data.weeklyRevenue,
    timestamp: new Date().toISOString(),
  });

  if (data.previousRank !== data.newRank) {
    io.to('leaderboard').emit('rankUpdate', {
      agentId: data.agentId,
      previousRank: data.previousRank,
      newRank: data.newRank,
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Broadcast sale update for agent ${data.agentName}`);
};

export const broadcastLeaderboardReset = () => {
  if (!io) {
    logger.warn('WebSocket server not initialized');
    return;
  }

  io.to('leaderboard').emit('leaderboardReset', {
    timestamp: new Date().toISOString(),
  });

  logger.info('Broadcast leaderboard reset');
};