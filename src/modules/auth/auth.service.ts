import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Prisma } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import {
  JwtPayload,
  DeviceInfo,
  LoginResponse,
  UserInfoResponse,
  AuthenticatedUser,
} from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
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

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userService.findUserByLogin(identifier);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as AuthenticatedUser;
    }
    return null;
  }

  async login(
    user: AuthenticatedUser,
    deviceInfo: DeviceInfo,
  ): Promise<LoginResponse> {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id, deviceInfo);

    const userInfo: UserInfoResponse = {
      id: user.id,
      username: user.username,
      avatar: user?.avatar,
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      userInfo,
    };
  }

  async generateRefreshToken(
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<string> {
    const refreshTokenUUID = randomUUID();
    const hashedRefreshToken = await bcrypt.hash(refreshTokenUUID, 4);
    const refreshToken = await this.userService.createRefreshToken({
      userId,
      tokenHash: hashedRefreshToken,
      deviceIp: deviceInfo.ip,
      userAgent: deviceInfo.ua,
    });
    return `${refreshToken.id}.${refreshTokenUUID}`;
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async refreshToken(rawToken: string, deviceInfo: DeviceInfo) {
    const [idStr, plainUUID] = rawToken.split('.');
    const tokenId = parseInt(idStr, 10);

    if (isNaN(tokenId) || !plainUUID) {
      throw new UnauthorizedException('Invalid token format');
    }

    const oldToken = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
      include: { user: true },
    });

    if (!oldToken) {
      throw new UnauthorizedException('Token不存在');
    }

    if (oldToken.isRevoked) {
      const isWhitInGracePeriod =
        oldToken.revokeAt && new Date() < oldToken.revokeAt;
      if (isWhitInGracePeriod) {
        // 容错窗口内前端多次刷新
        throw new UnauthorizedException('Token is rotating, please retry');
      } else {
        // token视为被窃取
        await this.prisma.refreshToken.updateMany({
          where: { userId: oldToken.userId },
          data: { isRevoked: true, revokeAt: new Date() },
        });
        throw new UnauthorizedException('Security alert: Token reuse detected');
      }
    }
    const isMatch = await bcrypt.compare(plainUUID, oldToken.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid token signature');
    }
    const accessToken = await this.generateAccessToken({
      username: oldToken.user.username,
      sub: oldToken.userId,
    });
    const refreshToken = await this.generateRefreshToken(
      oldToken.userId,
      deviceInfo,
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
