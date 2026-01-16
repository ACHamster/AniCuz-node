import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../../generated/prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth.type';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async createUser(@Body() createUserDto: RegisterDto) {
    const input = createUserDto satisfies Prisma.UserCreateInput;
    return await this.AuthService.register(input);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, userInfo } = await this.AuthService.login(req.user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });
    return userInfo;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
