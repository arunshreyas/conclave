import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async uploadDocument(
    @CurrentUserId() userId: string,
    @Body()
    dto: {
      title: string;
      docType?: string;
      fileType?: string;
      fileUrl?: string;
      text?: string;
    },
  ) {
    return this.documentsService.uploadDocument(userId, dto);
  }

  @Get()
  async getUserDocuments(@CurrentUserId() userId: string) {
    return this.documentsService.getUserDocuments(userId);
  }

  @Get(':id')
  async getDocumentDetails(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocumentDetails(userId, id);
  }
}
