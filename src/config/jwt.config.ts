import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    signOptions: { expiresIn: Number(process.env.JWT_EXPIRES) || 3600 },
  }),
);
