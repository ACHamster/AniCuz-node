import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

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
}
