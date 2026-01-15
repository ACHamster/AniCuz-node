import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
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
  async login(@GetUser() user) {
    return this.AuthService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user) {
    return user;
  }
}
