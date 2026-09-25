import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PapersService } from './papers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('papers')
@UseGuards(JwtAuthGuard)
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Post('generate')
  async generatePaper(
    @CurrentUserId() userId: string,
    @Body()
    dto: {
      title?: string;
      subject?: string;
      chapter?: string;
      topics?: string[];
      difficulty?: string;
      durationMinutes?: number;
      totalQuestions?: number;
    },
  ) {
    return this.papersService.generatePaper(userId, dto);
  }

  @Get()
  async getPapers(@CurrentUserId() userId: string) {
    return this.papersService.getUserPapers(userId);
  }

  @Get(':id')
  async getPaperDetails(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.papersService.getPaperDetails(userId, id);
  }

  @Post(':id/submit')
  async submitPaper(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body()
    dto: {
      answers: Array<{
        questionId: string;
        selectedAnswer?: string;
        timeSpentSec?: number;
      }>;
      totalTimeSpentSec?: number;
    },
  ) {
    return this.papersService.submitPaper(userId, id, dto);
  }
}
