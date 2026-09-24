import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getAuth } from '@clerk/express';

export const CurrentAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return getAuth(request);
  },
);

export const CurrentClerkId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const auth = getAuth(request);
    return auth?.userId ?? null;
  },
);
