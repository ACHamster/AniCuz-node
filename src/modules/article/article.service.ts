import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateArticleDto,
  EditArticleDto,
  GetArticleListDto,
  UpdateArticleStatusDto,
} from './article.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async createArticle(userId: number, dto: CreateArticleDto) {
    const tagsConnect = dto.tags?.map((tagName) => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    const articleData: Prisma.ArticleCreateInput = {
      title: dto.title,
      description: dto.description || '',
      content: dto.content,
      cover: dto.cover,
      user: {
        connect: { id: userId },
      },
      ...(dto.boardId && {
        board: {
          connect: { id: dto.boardId },
        },
      }),
      ...(tagsConnect && {
        tags: {
          connectOrCreate: tagsConnect,
        },
      }),
    };
    return this.prisma.article.create({
      data: articleData,
      include: {
        tags: true,
        board: true,
      },
    });
  }

  async editArticle(userId: number, articleId: number, dto: EditArticleDto) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }

    if (userId !== existingArticle.userId) {
      throw new UnauthorizedException(`You are not the author of this article`);
    }

    const updateArticleData: Prisma.ArticleUpdateInput = {
      title: dto.title,
      description: dto.description,
      content: dto.content,
      cover: dto.cover,
      ...(dto.boardId && {
        board: {
          connect: { id: dto.boardId },
        },
      }),
    };

    if (dto.tags) {
      updateArticleData.tags = {
        set: [], // 先清空关联
        connectOrCreate: dto.tags.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      };
    }

    return this.prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        ...updateArticleData,
      },
      include: { tags: true, board: true },
    });
  }

  async getArticleList(dto: GetArticleListDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    const orderBy =
      dto.sort === 'popular'
        ? { viewCount: Prisma.SortOrder.desc }
        : { createdAt: Prisma.SortOrder.desc };

    const where: Prisma.ArticleWhereInput = {
      status: 'PUBLISHED',
      ...(dto.boardId && { boardId: dto.boardId }),
      ...(dto.keyword && {
        OR: [
          { title: { contains: dto.keyword, mode: 'insensitive' } },
          { description: { contains: dto.keyword, mode: 'insensitive' } },
        ],
      }),
      ...(dto.authorId && { userId: dto.authorId }),
      ...(dto.tag && { tags: { some: { name: dto.tag } } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatar: true } }, // 只取必要字段
          tags: true,
          board: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getArticleById(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        cover: true,
        createdAt: true,
        viewCount: true,
        likeCount: true,
        user: {
          select: {
            id: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('这篇文章不见了');
    }

    await this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async toggleLike(articleId: number, userId: number) {
    const existingLike = await this.prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      return this.prisma.$transaction([
        this.prisma.articleLike.delete({
          where: {
            articleId_userId: {
              articleId,
              userId,
            },
          },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
    } else {
      return this.prisma.$transaction([
        this.prisma.articleLike.create({
          data: {
            articleId,
            userId,
          },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
    }
  }

  async getMyArticles(userId: number, dto: GetArticleListDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    const orderBy = { createdAt: Prisma.SortOrder.desc };

    const where: Prisma.ArticleWhereInput = {
      userId,
      ...(dto.keyword && {
        OR: [
          { title: { contains: dto.keyword, mode: 'insensitive' } },
          { description: { contains: dto.keyword, mode: 'insensitive' } },
        ],
      }),
      ...(dto.boardId && { boardId: dto.boardId }),
      ...(dto.tag && { tags: { some: { name: dto.tag } } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          tags: true,
          board: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateArticleStatus(
    userId: number,
    articleId: number,
    dto: UpdateArticleStatusDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }

    if (userId !== article.userId) {
      throw new ForbiddenException(
        `You don't have permission to modify this article`,
      );
    }

    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: dto.status },
      include: {
        tags: true,
        board: true,
      },
    });
  }

  async deleteArticle(userId: number, articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }

    if (userId !== article.userId) {
      throw new ForbiddenException(
        `You don't have permission to delete this article`,
      );
    }

    await this.prisma.article.delete({
      where: { id: articleId },
    });

    return { message: 'Article deleted successfully' };
  }
}
