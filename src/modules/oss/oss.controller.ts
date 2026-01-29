import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedRequest } from '../auth/auth.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OssService } from './oss.service';
import { Express } from 'express';
import { UploadImageResponse } from './oss.type';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Request()
    res: AuthenticatedRequest,
  ): Promise<UploadImageResponse> {
    const uploadRes = await this.ossService.uploadImage(
      file,
      'articles',
      res.user.id,
    );
    return uploadRes;
  }
}
