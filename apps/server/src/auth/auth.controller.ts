import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { CurrentClerkId } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getMe(@CurrentClerkId() clerkId: string) {
    return this.authService.getAuthStatus(clerkId);
  }
}
