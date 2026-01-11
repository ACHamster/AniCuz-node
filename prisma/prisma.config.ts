import 'dotenv/config';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import { expand } from 'dotenv-expand';
expand(config());

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // URL 在应用程序启动时动态注入，而非解析 schema 文件
    url: process.env.DATABASE_URL,
  },
});
