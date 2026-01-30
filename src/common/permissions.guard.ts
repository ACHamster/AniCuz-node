import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './decorators/require-permissions.decorator';

interface RequestWithUser extends Request {
  user?: {
    role?: {
      permissions?: string[];
    };
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user || !user.role) {
      return false;
    }

    const userPermissions = user.role.permissions as string[];

    if (userPermissions.includes('*')) {
      return true;
    }

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
