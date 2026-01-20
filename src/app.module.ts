import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/article/article.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, UserModule, AuthModule, ArticleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
