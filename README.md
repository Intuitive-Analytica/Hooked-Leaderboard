# Hooked Leaderboard

Real-time sales leaderboard for Hooked CRM agents with gamification features.

## Quick Start

1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies: `npm install`
4. Start MongoDB locally or configure Atlas connection
5. Run development: `npm run dev`

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Express, MongoDB, Socket.io
- **State**: Zustand, React Query
- **Animations**: Framer Motion

## Project Structure

```
├── src/              # React application
├── server/           # Express backend
├── conductor/        # Documentation
└── dist/            # Production build
```

## Development

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- WebSocket: ws://localhost:5000

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm test` - Run tests

## Features

- Real-time leaderboard updates
- Daily/weekly sales tracking
- Mobile responsive design
- Dark mode support
- Live notifications
- Smooth animations

## License

Private - Hooked CRM