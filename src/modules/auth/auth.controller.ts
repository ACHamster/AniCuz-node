import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { IResult, UAParser } from 'ua-parser-js';
import { Prisma } from '../../../generated/prisma/client';
import { UserAgent } from '../../common/decorators/useragent.decorator';
import { getClientIp } from '../../utils/utils';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  DeviceInfo,
  LoginResponse,
  UserInfoResponse,
  RefreshTokenResponse,
  RefreshSuccessResponse,
  AuthenticatedRequest,
} from './auth.type';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

enum CookieNames {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async createUser(@Body() createUserDto: RegisterDto) {
    const input = createUserDto satisfies Prisma.UserCreateInput;
    return await this.authService.register(input);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() ua: IResult,
  ): Promise<UserInfoResponse> {
    const ip = getClientIp(req);
    const deviceInfo: DeviceInfo = {
      ip: ip,
      ua: ua.ua,
      browser: `${ua.browser.name} ${ua.browser.version}`,
      os: `${ua.os.name} ${ua.os.version}`,
      device: ua.device.type || 'unknow',
    };
    const { access_token, refresh_token, userInfo }: LoginResponse =
      await this.authService.login(req.user, deviceInfo);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 3600 * 24 * 7,
    });
    return userInfo;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(CookieNames.ACCESS_TOKEN);
    res.clearCookie(CookieNames.REFRESH_TOKEN);
    return { message: '已退出登录' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: string | undefined = req.cookies?.refresh_token as
      | string
      | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.authService.logoutAll(req.user.id);

    res.clearCookie(CookieNames.ACCESS_TOKEN);
    res.clearCookie(CookieNames.REFRESH_TOKEN);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): UserInfoResponse {
    return req.user;
  }

  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshSuccessResponse> {
    const refreshToken: string | undefined = req.cookies?.refresh_token as
      | string
      | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // 获取当前请求的设备信息
    const userAgent = req.headers['user-agent'];
    const deviceInfo: DeviceInfo = {
      ip: req.ip,
      ua: typeof userAgent === 'string' ? userAgent : userAgent?.[0],
    };

    const { access_token, refresh_token }: RefreshTokenResponse =
      await this.authService.refreshToken(refreshToken, deviceInfo);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 3600 * 24 * 7,
    });

    return { message: 'Token refreshed successfully' };
  }
}
