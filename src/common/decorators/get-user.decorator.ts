import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  credential: string;
  password?: string;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // 显式检查 user 是否存在，避免 unsafe access
    if (!request || !request.credential) {
      return null;
    }

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return request.credential[data];
    }

    return request.credential;
  },
);
