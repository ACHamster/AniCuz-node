import { Body, Controller, Post } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async createUser(@Body() createUserDto: RegisterDto) {
    const input = createUserDto satisfies Prisma.UserCreateInput;
    return await this.AuthService.register(input);
  }

  @Post('login')
  async signIn(@Body() signInDto: LoginDto) {
    return this.AuthService.signIn(signInDto.username, signInDto.password);
  }
}
