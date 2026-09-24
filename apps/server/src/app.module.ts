import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [PrismaModule, UserProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
