import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesService } from './roles.service';
import { PermissionType } from './schemas/permission.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Get('profile')
  async getRole(@Request() req): Promise<{ role: UserRole }> {
    const role = await this.rolesService.getRole(req.user.userId);
    return { role };
  }

  @Get('check/:type/:resourceId')
  async checkPermission(
    @Request() req,
    @Param('type') type: PermissionType,
    @Param('resourceId') resourceId: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.rolesService.checkPermission(
      req.user.userId,
      type,
      resourceId,
    );
    return { hasPermission };
  }

  @Post('grant/:userId/:type/:resourceId')
  async grantPermission(
    @Request() req,
    @Param('userId') userId: string,
    @Param('type') type: PermissionType,
    @Param('resourceId') resourceId: string,
  ) {
    // Vérifier que l'utilisateur actuel a le droit d'accorder des permissions
    const currentUserRole = await this.rolesService.getRole(req.user.userId);
    if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.EVENT_ADMIN) {
      throw new UnauthorizedException('Insufficient permissions to grant roles');
    }

    return this.rolesService.grantPermission(userId, type, resourceId, req.user.userId);
  }

  @Delete('revoke/:userId/:type/:resourceId')
  async revokePermission(
    @Request() req,
    @Param('userId') userId: string,
    @Param('type') type: PermissionType,
    @Param('resourceId') resourceId: string,
  ) {
    // Vérifier que l'utilisateur actuel a le droit de révoquer des permissions
    const currentUserRole = await this.rolesService.getRole(req.user.userId);
    if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.EVENT_ADMIN) {
      throw new UnauthorizedException('Insufficient permissions to revoke roles');
    }

    return this.rolesService.revokePermission(userId, type, resourceId, req.user.userId);
  }

  @Get('user/:userId')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rolesService.getUserPermissions(userId);
  }

  @Get('resource/:resourceId')
  async getResourcePermissions(@Param('resourceId') resourceId: string) {
    return this.rolesService.getResourcePermissions(resourceId);
  }
}
