import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { RapidFireModule } from './rapid-fire/rapid-fire.module';
import { PapersModule } from './papers/papers.module';
import { ProgressModule } from './progress/progress.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    PrismaModule,
    UserProfileModule,
    AuthModule,
    QuestionsModule,
    RapidFireModule,
    PapersModule,
    ProgressModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
