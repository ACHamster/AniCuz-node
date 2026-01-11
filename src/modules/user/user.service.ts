import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            username: data.username,
          },
          {
            email: data.email,
          },
        ],
      },
      select: {
        username: true,
        email: true,
      },
    });
    if (existingUsers.length > 0) {
      const errorMessages: string[] = [];
      if (existingUsers.some((u) => u.username === data.username)) {
        errorMessages.push('用户名重复');
      }
      if (existingUsers.some((u) => u.email === data.email)) {
        errorMessages.push('用户名重复');
      }
      if (errorMessages.length > 0) {
        throw new ConflictException(errorMessages.join('且'));
      }
    }
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }
}
