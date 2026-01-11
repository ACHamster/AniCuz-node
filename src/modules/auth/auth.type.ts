import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  password: string;

  avatar?: string;
}

export class LoginDto {
  @IsString()
  username: string;

  password: string;
}
