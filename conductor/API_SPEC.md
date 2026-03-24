# API Specification

## Base Configuration
- Base URL: `https://api.hookedleaderboard.com`
- Version: v1
- Authentication: Bearer Token (JWT)
- Content-Type: application/json

## Endpoints

### Leaderboard Endpoints

#### GET /api/v1/leaderboard/daily
Retrieve daily leaderboard data

**Response:**
```json
{
  "date": "2024-03-24",
  "agents": [
    {
      "id": "agent_123",
      "name": "John Doe",
      "rank": 1,
      "dailySales": 15,
      "dailyRevenue": 45000,
      "changeFromYesterday": 25.5,
      "avatar": "https://..."
    }
  ],
  "lastUpdated": "2024-03-24T14:30:00Z"
}
```

#### GET /api/v1/leaderboard/weekly
Retrieve weekly cumulative leaderboard

**Response:**
```json
{
  "weekStart": "2024-03-18",
  "weekEnd": "2024-03-24",
  "agents": [
    {
      "id": "agent_123",
      "name": "John Doe",
      "rank": 1,
      "weeklySales": 67,
      "weeklyRevenue": 201000,
      "dailyAverage": 13.4,
      "daysActive": 5
    }
  ]
}
```

#### GET /api/v1/leaderboard/live
WebSocket endpoint for real-time updates

**WebSocket Events:**
```javascript
// Client -> Server
socket.emit('subscribe', { room: 'leaderboard' });

// Server -> Client
socket.on('rankUpdate', {
  agentId: 'agent_123',
  previousRank: 3,
  newRank: 2,
  timestamp: '2024-03-24T14:30:00Z'
});

socket.on('saleUpdate', {
  agentId: 'agent_123',
  saleAmount: 3000,
  totalDaily: 48000,
  totalWeekly: 204000,
  timestamp: '2024-03-24T14:30:00Z'
});
```

### Agent Endpoints

#### GET /api/v1/agents/:id
Get specific agent details

**Response:**
```json
{
  "id": "agent_123",
  "name": "John Doe",
  "email": "john.doe@hooked.com",
  "department": "Sales",
  "team": "Team Alpha",
  "joinDate": "2023-01-15",
  "stats": {
    "currentRank": 2,
    "dailySales": 15,
    "weeklySales": 67,
    "monthlySales": 245,
    "totalSales": 1834,
    "averageTicket": 3000,
    "conversionRate": 0.24
  }
}
```

#### GET /api/v1/agents/:id/history
Get agent's historical performance

**Query Parameters:**
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date
- `interval`: day|week|month

**Response:**
```json
{
  "agentId": "agent_123",
  "history": [
    {
      "date": "2024-03-24",
      "sales": 15,
      "revenue": 45000,
      "rank": 2
    }
  ]
}
```

### Sales Endpoints

#### POST /api/v1/sales/record
Record a new sale (webhook from CRM)

**Request Body:**
```json
{
  "agentId": "agent_123",
  "saleAmount": 3000,
  "productId": "product_456",
  "customerId": "customer_789",
  "timestamp": "2024-03-24T14:30:00Z",
  "metadata": {
    "source": "inbound",
    "dealType": "new"
  }
}
```

**Response:**
```json
{
  "saleId": "sale_abc123",
  "processed": true,
  "agentStats": {
    "newDailyTotal": 48000,
    "newWeeklyTotal": 204000,
    "newRank": 2
  }
}
```

#### GET /api/v1/sales/summary
Get sales summary for a period

**Query Parameters:**
- `period`: today|week|month|custom
- `startDate`: ISO 8601 date (for custom)
- `endDate`: ISO 8601 date (for custom)

**Response:**
```json
{
  "period": "week",
  "totalSales": 1245,
  "totalRevenue": 3735000,
  "topAgent": "agent_123",
  "averagePerAgent": 62250,
  "growthRate": 15.5
}
```

### Analytics Endpoints

#### GET /api/v1/analytics/trends
Get performance trends

**Response:**
```json
{
  "daily": [
    {
      "date": "2024-03-24",
      "totalSales": 245,
      "totalRevenue": 735000,
      "activeAgents": 20
    }
  ],
  "predictions": {
    "endOfWeek": 1500000,
    "endOfMonth": 6000000
  }
}
```

#### GET /api/v1/analytics/rankings
Get ranking analytics

**Response:**
```json
{
  "movements": {
    "up": 5,
    "down": 3,
    "unchanged": 12
  },
  "topPerformers": ["agent_123", "agent_456"],
  "mostImproved": "agent_789",
  "streaks": {
    "agent_123": 5
  }
}
```

## Error Responses

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid agent ID format",
    "details": {
      "field": "agentId",
      "value": "invalid_id"
    }
  },
  "timestamp": "2024-03-24T14:30:00Z"
}
```

### Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting
- Default: 100 requests per minute per IP
- WebSocket: 10 messages per second
- Bulk endpoints: 10 requests per minute

## Pagination
For endpoints returning lists:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Headers:**
```
X-Total-Count: 245
X-Page: 1
X-Limit: 20
Link: <.../api/v1/agents?page=2>; rel="next"
```

## Webhooks

### Sale Recorded
```json
{
  "event": "sale.recorded",
  "data": {
    "saleId": "sale_123",
    "agentId": "agent_456",
    "amount": 3000
  },
  "timestamp": "2024-03-24T14:30:00Z"
}
```

### Rank Changed
```json
{
  "event": "rank.changed",
  "data": {
    "agentId": "agent_123",
    "previousRank": 3,
    "newRank": 2
  },
  "timestamp": "2024-03-24T14:30:00Z"
}
```

## Authentication

### Token Request
POST /api/v1/auth/token

**Request:**
```json
{
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "refreshToken": "refresh_token_here"
}
```

### Using Token
Include in headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```