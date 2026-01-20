import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { CreateRefreshTokenData } from '../auth/auth.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }

  async findUserByLogin(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
  }

  async findConflicts(username: string | undefined, email: string | undefined) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
      select: {
        username: true,
        email: true,
      },
    });
  }

  async createRefreshToken(data: CreateRefreshTokenData) {
    return this.prisma.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        deviceIp: data.deviceIp,
        userAgent: data.userAgent,
        device: data.device,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: data.userId,
        isRevoked: false,
      },
    });
  }
}
