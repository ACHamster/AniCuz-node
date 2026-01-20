import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { AuthenticatedRequest } from '../../modules/auth/auth.type';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    const header = request.headers['user-agent'];

    const parser = new UAParser(header);

    return parser.getResult();
  },
);
