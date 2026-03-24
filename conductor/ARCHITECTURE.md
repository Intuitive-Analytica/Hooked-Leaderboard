# System Architecture

## Overview
The Hooked Leaderboard follows a three-tier architecture with clear separation of concerns between the presentation layer (React), business logic layer (Express), and data layer (MongoDB).

## Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   React     │  │  Socket.io  │  │   Service   │   │
│  │   App       │  │   Client    │  │   Worker    │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼─────────────────┼────────────────┼──────────┘
          │                 │                │
          ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Express   │  │  Socket.io  │  │   Rate      │   │
│  │   Server    │  │   Server    │  │   Limiter   │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼─────────────────┼────────────────┼──────────┘
          │                 │                │
          ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Sales     │  │ Leaderboard │  │   Agent     │   │
│  │   Service   │  │   Service   │  │   Service   │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼─────────────────┼────────────────┼──────────┘
          │                 │                │
          ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   MongoDB   │  │    Redis    │  │   File      │   │
│  │             │  │   (Cache)   │  │   Storage   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Architecture
```
src/
├── components/
│   ├── common/
│   │   ├── Layout/
│   │   ├── Header/
│   │   └── Footer/
│   ├── leaderboard/
│   │   ├── LeaderboardContainer/
│   │   ├── AgentRow/
│   │   ├── RankBadge/
│   │   └── SalesMetric/
│   └── notifications/
│       ├── Toast/
│       └── AlertBanner/
├── hooks/
│   ├── useWebSocket.ts
│   ├── useLeaderboard.ts
│   └── useAnimation.ts
├── services/
│   ├── api.ts
│   ├── websocket.ts
│   └── storage.ts
├── store/
│   ├── leaderboardStore.ts
│   └── notificationStore.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

### Backend Architecture
```
server/
├── routes/
│   ├── leaderboard.routes.ts
│   ├── agent.routes.ts
│   └── sales.routes.ts
├── controllers/
│   ├── leaderboard.controller.ts
│   ├── agent.controller.ts
│   └── sales.controller.ts
├── services/
│   ├── leaderboard.service.ts
│   ├── aggregation.service.ts
│   └── notification.service.ts
├── models/
│   ├── Agent.model.ts
│   ├── Sale.model.ts
│   └── Leaderboard.model.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
└── utils/
    ├── database.ts
    ├── logger.ts
    └── cache.ts
```

## Data Flow

### Real-time Update Flow
1. Sale recorded in CRM
2. Webhook triggers API endpoint
3. Express validates and processes sale
4. MongoDB updates agent statistics
5. Aggregation service recalculates rankings
6. Socket.io broadcasts update
7. React app receives update
8. UI animates change with notification

### Daily Reset Flow
1. Cron job triggers at midnight
2. Archive current day's data
3. Reset daily counters
4. Maintain weekly cumulative
5. Broadcast reset event
6. UI refreshes with new day

## Security Architecture

### API Security
- JWT authentication for admin endpoints
- API key validation for webhook endpoints
- Rate limiting per IP
- Input sanitization
- SQL injection prevention
- XSS protection

### Data Security
- Encrypted connections (TLS/SSL)
- Sensitive data never exposed to frontend
- MongoDB connection string in environment variables
- Bcrypt for password hashing
- Secure session management

## Performance Architecture

### Caching Strategy
- Redis for frequently accessed data
- 5-minute cache for leaderboard data
- Browser caching for static assets
- Service Worker for offline capability

### Optimization Techniques
- Database indexing on frequently queried fields
- Aggregation pipelines for complex calculations
- Debounced WebSocket emissions
- Virtual scrolling for large lists
- Lazy loading for routes

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in Redis
- Load balancer ready
- Microservices architecture

### Database Scaling
- MongoDB replica sets
- Read/write splitting
- Sharding strategy for growth
- Regular archiving of old data

## Monitoring & Logging

### Application Monitoring
- Request/response logging
- Error tracking with stack traces
- Performance metrics collection
- Real-time health checks

### Infrastructure Monitoring
- Server resource usage
- Database performance metrics
- API response times
- WebSocket connection stats

## Deployment Architecture

### Container Strategy
```yaml
services:
  frontend:
    - React app container
    - Nginx for static serving
  backend:
    - Node.js API container
    - PM2 for process management
  database:
    - MongoDB container
    - Volume for data persistence
  cache:
    - Redis container
    - Persistence optional
```

### Environment Configuration
- Development: Local containers
- Staging: Mirrored production
- Production: Cloud deployment with auto-scaling