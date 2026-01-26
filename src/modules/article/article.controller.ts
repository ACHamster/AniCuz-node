import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/auth.type';
import {
  CreateArticleDto,
  EditArticleDto,
  GetArticleListDto,
  UpdateArticleStatusDto,
} from './article.dto';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.createArticle(res.user.id, createArticleDto);
  }

  @Post('edit/:id')
  @UseGuards(JwtAuthGuard)
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editArticleDto: EditArticleDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.editArticle(res.user.id, id, editArticleDto);
  }

  @Get()
  async getList(@Query() query: GetArticleListDto) {
    return this.articleService.getArticleList(query);
  }

  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('like/:id')
  async likeArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.toggleLike(articleId, res.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyArticles(
    @Query() query: GetArticleListDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.getMyArticles(res.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  async updateArticleStatus(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() dto: UpdateArticleStatusDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.updateArticleStatus(res.user.id, articleId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.deleteArticle(res.user.id, articleId);
  }
}
