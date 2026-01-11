import { IsEmail, IsString } from 'class-validator';

export class CreatUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  password: string;

  avatar?: string;
}
