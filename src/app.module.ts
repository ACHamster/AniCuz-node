import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/article/article.module';
import { OssModule } from './modules/oss/oss.module';
import { AdminModule } from './modules/admin/admin.module';
import { TaskService } from './modules/task/task.service';
import { StoreModule } from './modules/store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    ArticleModule,
    OssModule,
    AdminModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule {}
