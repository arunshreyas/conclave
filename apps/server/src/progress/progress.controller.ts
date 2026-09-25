import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUserId() userId: string) {
    return this.progressService.getDashboard(userId);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUserId() userId: string) {
    return this.progressService.getAnalytics(userId);
  }

  @Get('attempts')
  async getAttempts(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : 50;
    return this.progressService.getAttempts(userId, numLimit);
  }
}
