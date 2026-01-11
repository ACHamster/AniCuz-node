import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async register(data: Prisma.UserCreateInput) {
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
        errorMessages.push('用户名已被注册');
      }
      if (existingUsers.some((u) => u.email === data.email)) {
        errorMessages.push('邮箱已被注册');
      }
      console.log(existingUsers);
      if (errorMessages.length > 0) {
        throw new ConflictException(errorMessages.join('且'));
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 8);
    return this.userService.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async signIn(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        password: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      return isPasswordCorrect;
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
