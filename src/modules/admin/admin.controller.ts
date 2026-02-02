import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import {
  UpdateRolePermissionsDto,
  UpdateUserRoleDto,
  AdjustUserPointDto,
} from './admin.dto';
import { CreateItemDto, UpdateItemDto } from '../store/store.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 获取权限元数据 - 用于前端 Checkbox
  @Get('permissions/metadata')
  @RequirePermissions('admin:manage')
  getPermissionsMetadata() {
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

  // ============ 商品管理 ============

  // 创建商品
  @Post('items')
  @RequirePermissions('admin:manage')
  createItem(@Body() dto: CreateItemDto) {
    return this.adminService.createItem(dto);
  }

  // 更新商品（下架、改价等）
  @Patch('items/:id')
  @RequirePermissions('admin:manage')
  updateItem(@Param('id') itemId: string, @Body() dto: UpdateItemDto) {
    return this.adminService.updateItem(itemId, dto);
  }

  // 删除商品
  @Delete('items/:id')
  @RequirePermissions('admin:manage')
  deleteItem(@Param('id') itemId: string) {
    return this.adminService.deleteItem(itemId);
  }

  // ============ 积分管理 ============

  // 管理员调整用户积分
  @Post('users/:userId/point')
  @RequirePermissions('admin:manage')
  adjustUserPoint(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AdjustUserPointDto,
  ) {
    return this.adminService.adjustUserPoint(userId, dto);
  }
}
