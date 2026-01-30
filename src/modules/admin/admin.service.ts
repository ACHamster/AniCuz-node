import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateRolePermissionsDto, UpdateUserRoleDto } from './admin.dto';
import { PERMISSIONS_DEFINITIONS } from '../../common/constants/permissions';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 根据已定义的权限生成元数据
  private buildPermissionsMetadata() {
    // 按组分类权限
    const groupMap = new Map<string, any[]>();

    PERMISSIONS_DEFINITIONS.forEach((permission) => {
      if (!groupMap.has(permission.group)) {
        groupMap.set(permission.group, []);
      }
      groupMap.get(permission.group)!.push({
        key: permission.code,
        label: permission.code.split(':').pop() || permission.code,
        description: permission.desc,
      });
    });

    // 转换为分类格式
    const categories = Array.from(groupMap.entries()).map(
      ([group, permissions]) => ({
        name: this.getGroupDisplayName(group),
        key: group.toLowerCase(),
        permissions,
      }),
    );

    return { categories };
  }

  // 获取组的显示名称
  private getGroupDisplayName(group: string): string {
    const displayNames: Record<string, string> = {
      Article: '文章管理',
      Comment: '评论管理',
      Upload: '上传管理',
      User: '用户管理',
      Board: '板块管理',
      Tag: '标签管理',
      Role: '角色管理',
      Level: '等级管理',
      Reward: '奖励管理',
      System: '系统管理',
      Moderation: '审核管理',
      All: '超级管理员',
    };
    return displayNames[group] || group;
  }

  getPermissionsMetadata() {
    return this.buildPermissionsMetadata();
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        permissions: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map((role) => ({
      ...role,
      permissions: role.permissions as string[],
      userCount: role._count.users,
    }));
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 验证权限格式 - 从 PERMISSIONS_DEFINITIONS 获取所有有效权限
    const allValidPermissions = PERMISSIONS_DEFINITIONS.map((p) => p.code);

    const invalidPermissions = dto.permissions.filter(
      (p) => !allValidPermissions.includes(p),
    );

    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `无效的权限: ${invalidPermissions.join(', ')}`,
      );
    }

    // 更新角色权限
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: dto.permissions,
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
      },
    });

    return {
      ...updatedRole,
      permissions: updatedRole.permissions as string[],
    };
  }

  async updateUserRole(userId: number, dto: UpdateUserRoleDto) {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查角色是否存在（如果提供了角色ID）
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new NotFoundException('角色不存在');
      }
    }

    // 更新用户角色
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: dto.roleId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }
}
