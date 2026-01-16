import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(data: Prisma.UserCreateInput) {
    const existingUsers = await this.userService.findConflicts(
      data.username,
      data.email,
    );

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

  async validateUser(identifier: string, password: string) {
    const user = await this.userService.findUserByLogin(identifier);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      access_token: accessToken,
      userInfo: {
        id: user.id,
        username: user.username,
        avatar: user?.avatar,
      },
    };
  }
}
