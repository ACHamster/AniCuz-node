import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UpdateRolePermissionsDto, UpdateUserRoleDto } from './admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 获取权限元数据 - 用于前端 Checkbox
  @Get('permissions/metadata')
  @RequirePermissions('admin:manage')
  async getPermissionsMetadata() {
    return this.adminService.getPermissionsMetadata();
  }

  // 获取角色列表
  @Get('roles')
  @RequirePermissions('admin:manage')
  async getRoles() {
    return this.adminService.getRoles();
  }

  // 更新角色权限
  @Patch('roles/:id/permissions')
  @RequirePermissions('admin:manage')
  async updateRolePermissions(
    @Param('id') roleId: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.adminService.updateRolePermissions(roleId, dto);
  }

  // 更新用户角色
  @Patch('users/:id/role')
  @RequirePermissions('admin:manage')
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto);
  }
}
