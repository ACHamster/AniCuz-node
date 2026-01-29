import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';

@Module({
  imports: [ConfigModule],
  controllers: [OssController],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule {}
