import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth } from '@clerk/express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = getAuth(request);

    if (!auth || !auth.userId) {
      throw new UnauthorizedException(
        'Unauthorized: Missing or invalid authentication token',
      );
    }

    return true;
  }
}
