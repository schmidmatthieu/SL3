# Guide de Performance

## Principes de Base

### Objectifs

- First Contentful Paint < 1.8s
- Time to Interactive < 3.8s
- Total Blocking Time < 200ms
- Cumulative Layout Shift < 0.1

## Frontend

### Code Splitting

```typescript
// Lazy loading des routes
const EventPage = lazy(() => import('@/pages/event'));

// Lazy loading des composants lourds
const HeavyComponent = lazy(() => import('@/components/heavy'));
```

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['assets.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

// Utilisation
function OptimizedImage() {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      loading="lazy"
    />
  );
}
```

### Bundle Optimization

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Config
});
```

### State Management

```typescript
// Zustand store optimisé
interface Store {
  data: Data[];
  // Sélecteurs memoizés
  filteredData: (filter: Filter) => Data[];
}

const useStore = create<Store>((set, get) => ({
  data: [],
  filteredData: filter => useMemo(() => get().data.filter(filterFn), [get().data, filter]),
}));
```

## Backend

### Caching Redis

```typescript
// services/cache.service.ts
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl || 3600);
  }
}
```

### Query Optimization

```typescript
// repositories/event.repository.ts
@Injectable()
export class EventRepository {
  async findWithRelations(id: string): Promise<Event> {
    return this.eventModel
      .findById(id)
      .select('name description')
      .populate({
        path: 'speakers',
        select: 'name avatar',
      })
      .lean();
  }
}
```

### WebSocket Optimization

```typescript
// gateways/event.gateway.ts
@WebSocketGateway()
export class EventGateway {
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket): void {
    // Joindre une room spécifique
    client.join(roomId);
  }

  // Broadcast optimisé
  async broadcastToRoom(roomId: string, event: string, data: any): Promise<void> {
    this.server.to(roomId).emit(event, data);
  }
}
```

## Monitoring

### Performance Metrics

```typescript
// middleware/performance.middleware.ts
app.use((req, res, next) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    metrics.recordLatency({
      route: req.route?.path,
      method: req.method,
      duration,
    });
  });

  next();
});
```

### Error Tracking

```typescript
// services/error-tracking.service.ts
@Injectable()
export class ErrorTrackingService {
  track(error: Error, context?: any): void {
    Sentry.captureException(error, {
      extra: {
        ...context,
        timestamp: new Date(),
      },
    });
  }
}
```

## Optimisations Avancées

### Virtual Scrolling

```typescript
// components/virtual-list.tsx
function VirtualList({ items }: Props) {
  return (
    <VirtualScroll
      height={400}
      itemCount={items.length}
      itemSize={50}
      width={600}
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index]}
        </div>
      )}
    </VirtualScroll>
  );
}
```

### Debounce & Throttle

```typescript
// hooks/use-debounce.ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Memoization

```typescript
// components/expensive-component.tsx
const ExpensiveComponent = memo(
  function ExpensiveComponent({ data }: Props) {
    const processedData = useMemo(
      () => expensiveCalculation(data),
      [data]
    );

    return <div>{processedData}</div>;
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps.data, nextProps.data);
  }
);
```

## Tests de Performance

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v3
        with:
          urls: |
            https://staging.example.com/
          budgetPath: ./budget.json
```

### Load Testing

```typescript
// tests/load/event-stream.test.ts
import { LoadTest } from 'k6';

export default function () {
  const virtualUsers = 100;
  const duration = '30s';

  const test = new LoadTest({
    scenarios: {
      stream: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '10s', target: virtualUsers },
          { duration, target: virtualUsers },
          { duration: '10s', target: 0 },
        ],
      },
    },
  });

  test.run();
}
```
