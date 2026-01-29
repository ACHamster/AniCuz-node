import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadImageResponse } from './oss.type';

@Injectable()
export class OssService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly logger = new Logger(OssService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('OSS_BUCKET');
    this.publicDomain =
      this.configService.getOrThrow<string>('OSS_PUBLIC_DOMAIN');

    const region = this.configService.getOrThrow<string>('OSS_REGION');
    const endpoint = this.configService.getOrThrow<string>('OSS_ENDPOINT');
    const accessKeyId =
      this.configService.getOrThrow<string>('OSS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'OSS_SECRET_ACCESS_KEY',
    );
    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'misc',
    userId: number,
  ): Promise<UploadImageResponse> {
    const imageHash = createHash('sha256').update(file.buffer).digest('hex');

    const existImage = await this.prisma.upload.findUnique({
      where: { hash: imageHash },
    });

    if (existImage) {
      return { url: existImage.url, id: existImage.id, isNew: false };
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;

    const key = `${folder}/${year}/${month}/${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `${this.publicDomain}/${key}`;

      await this.prisma.upload.create({
        data: {
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          key: url.split(this.publicDomain + '/')[1], // 从 URL 反推 Key，或者 uploadToB2 返回 Key
          url: url,
          hash: imageHash,
          uploaderId: userId,
        },
      });

      this.logger.log(`Image uploaded successfully: ${url}`);
      return { url, isNew: true };
    } catch (error) {
      this.logger.error(`OSS Upload Error: ${error.message}`, error.stack);
      throw error; // 抛出异常让 Controller 处理
    }
  }
}
