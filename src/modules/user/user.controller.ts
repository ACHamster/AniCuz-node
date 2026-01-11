import { Body, Controller, Post } from '@nestjs/common';
import { Prisma, User } from '../../../generated/prisma/client';
import { UserService } from './user.service';
import { CreatUserDto } from './user.type';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('sign-up')
  async createUser(@Body() createUserDto: CreatUserDto): Promise<User> {
    const input = createUserDto satisfies Prisma.UserCreateInput;
    return await this.UserService.createUser(input);
  }
}
