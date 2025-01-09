import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedSocket } from '../types/socket.types';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Token not provided');
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        throw new WsException('Invalid token');
      }

      // Attacher l'utilisateur au socket
      client.user = {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
      };

      return true;
    } catch (err) {
      throw new WsException(err.message);
    }
  }

  private extractToken(client: AuthenticatedSocket): string | null {
    const auth = client.handshake?.auth?.token;
    if (!auth) {
      return null;
    }
    return auth;
  }
}
