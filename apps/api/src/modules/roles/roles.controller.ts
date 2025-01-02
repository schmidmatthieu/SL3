import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesService } from './roles.service';
import { PermissionType } from './schemas/permission.schema';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('profile')
  async getRole(@Request() req) {
    return this.rolesService.getRole(req.user.userId);
  }

  @Get('check/:type/:resourceId')
  async checkPermission(
    @Request() req,
    @Param('type') type: PermissionType,
    @Param('resourceId') resourceId: string,
  ) {
    return this.rolesService.checkPermission(req.user.userId, type, resourceId);
  }
}
