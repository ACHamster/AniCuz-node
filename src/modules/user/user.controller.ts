import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { AuthenticatedRequest } from '../auth/auth.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async permissionsList(@Request() res: AuthenticatedRequest) {
    return this.UserService.getUserPermissions(res.user.id);
  }
}
