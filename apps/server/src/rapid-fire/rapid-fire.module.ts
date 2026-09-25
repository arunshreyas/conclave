import { Module } from '@nestjs/common';
import { RapidFireController } from './rapid-fire.controller';
import { RapidFireService } from './rapid-fire.service';
import { PrismaModule } from '../prisma.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [PrismaModule, QuestionsModule],
  controllers: [RapidFireController],
  providers: [RapidFireService],
  exports: [RapidFireService],
})
export class RapidFireModule {}
