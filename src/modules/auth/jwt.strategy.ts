import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
// import { Strategy } from 'passport-local';
import { jwtConfig } from '../../config/jwt.config';
import { Request } from 'express';
import { JwtPayload } from './auth.type';
import { UserService } from '../user/user.service';

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
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: config.secret as string,
    });
  }

  async validate(payload: JwtPayload) {
    return await this.userService.findUserByIdWithRole(payload.sub);
  }
}
