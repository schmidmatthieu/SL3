# Live Streaming Event Platform Documentation

## Technology Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- SWR/TanStack Query for data fetching
- Socket.IO client for real-time features

### Backend

- Node.js 22.10.2
- NestJS
- TypeScript
- MongoDB with Mongoose
- Redis for caching and real-time features
- Socket.IO for WebSocket

### Infrastructure

- GitHub Actions for CI/CD
- MongoDB for primary database
- Redis for caching and real-time features
- HLS for video streaming

## Project Structure

```
/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/        # Next.js app router
│   │   │   ├── components/ # Shared components
│   │   │   ├── lib/       # Utilities and helpers
│   │   │   └── styles/    # Global styles
│   └── api/                # NestJS backend
│       ├── src/
│       │   ├── modules/    # Feature modules
│       │   ├── common/     # Shared resources
│       │   └── main.ts     # Application entry
├── packages/               # Shared packages
│   ├── eslint-config/     # ESLint configuration
│   ├── typescript-config/ # TypeScript configuration
│   └── ui/                # Shared UI components
└── pnpm-workspace.yaml
```

## Core Features

### User Roles & Permissions

1. Platform Admin

   - Full system access
   - User management
   - Platform configuration

2. Event Admin

   - Event management
   - Session scheduling
   - Participant management

3. Moderator

   - Stream management
   - Chat moderation
   - Q&A management

4. Speaker

   - Session management
   - Presentation controls
   - Q&A interaction

5. Participant
   - View streams
   - Participate in chat
   - Ask questions

### Streaming Features

- HLS streaming with multi-quality support
- Multiple audio track support
- Real-time chat
- Q&A system
- File sharing
- Analytics and monitoring

### Real-time Architecture

- WebSocket-based communication
- Room-based connections
- Automatic reconnection
- Message queueing
- Rate limiting
- Fallback mechanisms

### Caching Strategy

- Redis for session data
- MongoDB aggregation caching
- Static asset caching
- API response caching
- Proper cache invalidation

### Security

- JWT authentication
- Role-based access control
- Rate limiting
- CSRF protection
- Input validation
- XSS prevention

## Environment Configuration

Essential environment variables are categorized as follows:

### Application

```env
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:8000
PORT=3000
```

### Security

```env
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
COOKIE_SECRET=your-cookie-secret
CORS_ORIGINS=http://localhost:3000
```

### Databases

```env
MONGODB_URI=mongodb://localhost:27017/event_platform
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Streaming

```env
STREAM_SERVER_URL=rtmp://localhost/live
HLS_SERVER_URL=http://localhost:8080/hls
MAX_BITRATE=5000000
```

### WebSocket

```env
WS_PORT=8080
WS_PATH=/ws
MAX_CONNECTIONS_PER_IP=100
```

## Performance Optimizations

### Frontend

- Code splitting
- Image optimization
- Lazy loading
- Bundle size optimization
- Proper caching strategies

### Backend

- Database indexing
- Query optimization
- Caching layers
- Connection pooling
- Rate limiting

### WebSocket

- Message batching
- Compression
- Connection pooling
- Health monitoring
- Automatic scaling

## Testing Strategy

### Frontend

- Jest for unit testing
- React Testing Library
- Cypress for E2E testing

### Backend

- Jest for unit testing
- Supertest for API testing
- Integration tests
- Load testing

## Monitoring & Logging

- Health checks
- Performance metrics
- Error tracking
- Usage analytics
- Audit logging
