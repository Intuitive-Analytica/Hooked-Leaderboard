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
import { globalRateLimiter, apiRateLimiter, salesRateLimiter } from './middleware/rateLimit.middleware';
import { auditLogger } from './middleware/audit.middleware';
import leaderboardRoutes from './routes/leaderboard.routes';
import agentRoutes from './routes/agent.routes';
import salesRoutes from './routes/sales.routes';
import analyticsRoutes from './routes/analytics.routes';
import { initializeWebSocket } from './services/websocket.service';
import logger from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
}));

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }: any) => {
    logger.warn(`Attempted NoSQL injection from IP ${req.ip} in ${key}`);
  }
}));

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(globalRateLimiter);

app.use('/api/v1', apiRateLimiter);
// app.use('/api/v1', auditLogger); // Disabled - MongoDB user lacks write permissions

app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/sales', salesRateLimiter, salesRoutes);
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