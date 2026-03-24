# Hooked Leaderboard Development Guidelines

## Core Principles
- Clean, minimalist code with zero unnecessary comments
- Mobile-first, fully responsive design
- Secure architecture with Express/MongoDB backend
- Real-time updates with smooth animations
- Gamification-focused UX for agent motivation

## Code Standards

### JavaScript/React
- Use functional components with hooks exclusively
- Minimize bundle size through code splitting and lazy loading
- Consolidate redundant logic into custom hooks and utilities
- Use arrow functions consistently
- Destructure props and state
- No inline styles - use CSS modules or styled-components

### File Structure
```
src/
  components/     # Reusable UI components
  pages/          # Route-level components
  hooks/          # Custom React hooks
  services/       # API calls and data services
  utils/          # Helper functions
  styles/         # Global styles and themes
server/
  routes/         # Express API endpoints
  models/         # MongoDB schemas
  middleware/     # Auth and security middleware
  controllers/    # Route handlers
```

### Security
- Never expose MongoDB credentials or sensitive data to frontend
- All data fetching through Express API endpoints
- Implement proper authentication and authorization
- Sanitize all user inputs
- Use environment variables for configuration

### Performance
- Implement React.memo for expensive components
- Use useMemo and useCallback appropriately
- Lazy load routes and heavy components
- Optimize re-renders with proper state management
- Minimize API calls with intelligent caching

### UI/UX Requirements
- Design inspiration from https://hookedcrm.com
- Real-time notifications for sales updates
- Smooth animations for leaderboard changes
- Daily and weekly cumulative sales tracking
- Mobile-responsive breakpoints: 320px, 768px, 1024px, 1440px
- Accessibility compliance (WCAG 2.1 AA)

### Data Flow
- MongoDB → Express API → React Frontend
- WebSocket or SSE for real-time updates
- State management with Context API or Zustand (no Redux)
- Optimistic UI updates with rollback on error

### Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing with React Testing Library
- E2E testing for critical user flows

### Git Workflow
- Meaningful commit messages describing the "why"
- Feature branches from main
- Pull requests for all changes
- No direct commits to main branch

### Dependencies
- Keep dependencies minimal and up-to-date
- Prefer native solutions over libraries
- Document any non-obvious dependency choices
- Regular security audits with npm audit

## Project-Specific Rules
1. Every component must be mobile-responsive
2. All monetary values displayed with proper formatting
3. Agent data must update in real-time without page refresh
4. Animations should be smooth but not distracting
5. Dark mode support from initial release
6. Loading states for all async operations
7. Error boundaries for graceful failure handling
8. Proper TypeScript types for all data structures

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Bundle size: < 200KB gzipped
- API response time: < 200ms

## Forbidden Practices
- No console.log in production code
- No hardcoded values or magic numbers
- No synchronous API calls
- No direct DOM manipulation
- No global variables
- No commented-out code
- No TODO comments - use GitHub issues instead