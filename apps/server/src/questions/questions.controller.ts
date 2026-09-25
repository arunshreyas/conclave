import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('subjects')
  async getSubjects() {
    return this.questionsService.getSubjectsAndMetadata();
  }

  @Get('saved/all')
  async getSavedQuestions(@CurrentUserId() userId: string) {
    return this.questionsService.getSavedQuestions(userId);
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsService.getQuestionById(id);
  }

  @Post(':id/save')
  async saveQuestion(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.questionsService.saveQuestion(userId, id, notes);
  }

  @Delete(':id/save')
  async unsaveQuestion(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.questionsService.unsaveQuestion(userId, id);
  }
}
