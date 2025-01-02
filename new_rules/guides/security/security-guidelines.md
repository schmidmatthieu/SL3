# Guide de Sécurité

## Principes Fondamentaux

### Authentication
- JWT pour l'API
- Sessions Redis
- Refresh tokens
- Protection CSRF

### Authorization
- RBAC (Role Based Access Control)
- Permissions granulaires
- Validation côté serveur

## Implémentation

### JWT Configuration
```typescript
// config/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '15m',
  refreshExpiresIn: '7d',
  algorithm: 'HS256',
};
```

### Middleware d'Authentication
```typescript
// middleware/auth.middleware.ts
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      const decoded = verify(token, jwtConfig.secret);
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
```

### Guards RBAC
```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

## Protection des Données

### Encryption
```typescript
// utils/encryption.ts
export class Encryption {
  static async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 12);
  }
  
  static async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
```

### Validation des Données
```typescript
// dto/user.dto.ts
export class CreateUserDTO {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  password: string;
  
  @IsEmail()
  email: string;
}
```

## Sécurité Frontend

### XSS Protection
```typescript
// utils/sanitize.ts
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
};
```

### CSRF Protection
```typescript
// middleware/csrf.middleware.ts
app.use(csurf());

// Dans les composants
function Form() {
  const csrfToken = useCsrfToken();
  
  return (
    <form>
      <input type="hidden" name="_csrf" value={csrfToken} />
    </form>
  );
}
```

## Sécurité API

### Rate Limiting
```typescript
// middleware/rate-limit.middleware.ts
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite par IP
  })
);
```

### Validation Headers
```typescript
// middleware/security-headers.middleware.ts
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

## Audit et Logging

### Audit Logs
```typescript
// services/audit.service.ts
@Injectable()
export class AuditService {
  async log(
    userId: string,
    action: string,
    resource: string,
    details: any
  ): Promise<void> {
    await this.auditModel.create({
      userId,
      action,
      resource,
      details,
      timestamp: new Date(),
      ip: request.ip,
    });
  }
}
```

### Error Logging
```typescript
// middleware/error.middleware.ts
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date(),
  });
  
  res.status(500).json({
    message: 'Internal server error',
  });
});
```

## Tests de Sécurité

### Tests d'Authentication
```typescript
describe('Authentication', () => {
  it('should prevent unauthorized access', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'invalid-token');
    
    expect(response.status).toBe(401);
  });
});
```

### Tests de Validation
```typescript
describe('Input Validation', () => {
  it('should validate user input', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'invalid-email',
        password: 'weak',
      });
    
    expect(response.status).toBe(400);
  });
});
```

## Monitoring

### Alerting
```typescript
// services/monitoring.service.ts
@Injectable()
export class MonitoringService {
  async alertSecurityEvent(
    event: SecurityEvent
  ): Promise<void> {
    if (event.severity === 'high') {
      await this.notificationService.alert({
        type: 'security',
        message: event.message,
        details: event.details,
      });
    }
  }
}
```

### Métriques
```typescript
// middleware/metrics.middleware.ts
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordHttpRequest({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  
  next();
});
```
