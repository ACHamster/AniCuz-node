import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
// import { Strategy } from 'passport-local';
import { jwtConfig } from '../../config/jwt.config';
import { Request } from 'express';

const extractJwtFromCookie = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: config.secret as string,
    });
  }

  validate(payload: { username: string; sub: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}
