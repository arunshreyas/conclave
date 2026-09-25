import { Module } from '@nestjs/common';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { PrismaModule } from '../prisma.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [PrismaModule, QuestionsModule],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService],
})
export class PapersModule {}
