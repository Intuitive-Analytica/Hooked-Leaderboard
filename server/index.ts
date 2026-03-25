import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import leaderboardRoutes from './routes/leaderboard.routes';
import agentRoutes from './routes/agent.routes';
import salesRoutes from './routes/sales.routes';
import analyticsRoutes from './routes/analytics.routes';
import { initializeWebSocket } from './services/websocket.service';
import logger from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.CLIENT_URL
      ? [process.env.CLIENT_URL]
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use('/api/v1', rateLimiter);

app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.use(errorHandler);

initializeWebSocket(io);

const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };