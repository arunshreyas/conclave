import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { RapidFireService } from './rapid-fire.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('rapid-fire')
@UseGuards(JwtAuthGuard)
export class RapidFireController {
  constructor(private readonly rapidFireService: RapidFireService) {}

  @Post('start')
  async startSession(
    @CurrentUserId() userId: string,
    @Body()
    dto: {
      mode?: string;
      subject?: string;
      topic?: string;
      questionCount?: number;
    },
  ) {
    return this.rapidFireService.startSession(userId, dto);
  }

  @Post(':sessionId/answer')
  async answerQuestion(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
    @Body()
    dto: {
      questionId: string;
      selectedAnswer: string;
      timeTakenSec?: number;
    },
  ) {
    return this.rapidFireService.answerQuestion(userId, sessionId, dto);
  }

  @Post(':sessionId/finish')
  async finishSession(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.rapidFireService.finishSession(userId, sessionId);
  }

  @Get(':sessionId')
  async getSession(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.rapidFireService.getSessionDetails(userId, sessionId);
  }
}
