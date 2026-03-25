# Hooked CRM Leaderboard Component

A high-performance, real-time sales leaderboard component designed to be embedded within the Hooked CRM application. Built with React, TypeScript, Node.js, and MongoDB.

## Overview

This leaderboard component provides real-time sales tracking and agent ranking functionality for the Hooked CRM system. It features daily and weekly views, live updates via WebSocket connections, and a mobile-responsive design.

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: MongoDB (read-only access)
- **State Management**: Zustand, React Query
- **Real-time**: WebSocket connections for live updates
- **Animations**: Framer Motion

### Project Structure
```
├── src/                     # Frontend application
│   ├── components/         # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Layout.tsx
│   │   └── LeaderboardTable.tsx
│   ├── pages/             # Route-level components
│   │   └── Dashboard.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useTheme.ts
│   │   └── useWebSocket.ts
│   ├── services/          # API calls and data services
│   │   └── api.ts
│   ├── store/            # State management
│   │   └── leaderboardStore.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Helper functions
│       └── formatters.ts
├── server/                # Backend API
│   ├── routes/           # Express API endpoints
│   │   ├── agent.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── leaderboard.routes.ts
│   │   └── sales.routes.ts
│   ├── models/           # MongoDB schemas
│   │   ├── Agent.ts
│   │   ├── AuditLog.ts
│   │   └── Sale.ts
│   ├── middleware/       # Express middleware
│   │   ├── audit.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── controllers/      # Route handlers
│   │   ├── agent.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   └── sales.controller.ts
│   ├── services/         # Business logic
│   │   ├── analytics.service.ts
│   │   ├── leaderboard.service.ts
│   │   └── websocket.service.ts
│   ├── config/          # Configuration
│   │   └── database.ts
│   └── utils/           # Utilities
│       ├── logger.ts
│       └── validators.ts
└── dist/                # Production build
```

## Features

### Security
- Rate limiting with multiple tiers (global, API, sales-specific)
- Input validation using Joi schemas
- CORS protection with configurable origins
- Helmet.js security headers
- MongoDB sanitization
- React error boundaries

### Performance
- Real-time WebSocket updates
- Indexed MongoDB queries
- Response caching
- Code splitting and lazy loading
- Gzip compression

### User Experience
- Mobile responsive design
- Dark mode support
- Toast notifications for sales updates
- WebSocket connection status indicator
- Automatic reconnection and retry logic
- Smooth animations with Framer Motion

## Installation

### Prerequisites
- Node.js 18+
- MongoDB connection string
- Environment variables configuration

### Quick Start
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Environment Variables
```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB (Read-only access)
MONGODB_URI=mongodb://...

# Client URLs (comma-separated for multiple origins)
CLIENT_URL=http://localhost:3000,http://localhost:3001

# WebSocket
VITE_WS_URL=http://localhost:5001
VITE_API_URL=http://localhost:5001
```

## Development

### Available Scripts
```bash
npm run dev          # Start both frontend and backend
npm run dev:server   # Start backend only (port 5001)
npm run dev:client   # Start frontend only (port 3001)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run test         # Run tests
npm start           # Run production server
```

### Development URLs
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001
- WebSocket: ws://localhost:5001

## API Endpoints

### Leaderboard
- `GET /api/v1/leaderboard/daily` - Daily rankings
- `GET /api/v1/leaderboard/weekly` - Weekly rankings
- `GET /api/v1/leaderboard/agent/:id` - Agent details

### Sales
- `GET /api/v1/sales/recent` - Recent sales
- `POST /api/v1/sales` - Record new sale (rate limited)
- `GET /api/v1/sales/agent/:id` - Agent sales history

### Analytics
- `GET /api/v1/analytics/performance` - Performance metrics
- `GET /api/v1/analytics/trends` - Sales trends
- `GET /api/v1/analytics/summary` - Dashboard summary

### Health Check
- `GET /health` - Server health status

## Security Considerations

This component is designed to be embedded within the Hooked CRM application, which handles authentication.

- No user authentication (handled by parent CRM)
- Read-only database access
- Rate limiting to prevent abuse
- Input sanitization
- CORS restricted to configured origins
- No sensitive data in error messages

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Hooked CRM Internal Use Only