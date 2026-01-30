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
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/permissions.guard';
import { AuthenticatedRequest } from '../auth/auth.type';
import {
  CreateArticleDto,
  EditArticleDto,
  GetArticleListDto,
  UpdateArticleStatusDto,
} from './article.dto';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('article')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('create')
  @RequirePermissions('article:create')
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.createArticle(res.user.id, createArticleDto);
  }

  @Post('edit/:id')
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editArticleDto: EditArticleDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.editArticle(res.user.id, id, editArticleDto);
  }

  @Public()
  @Get()
  async getList(@Query() query: GetArticleListDto) {
    return this.articleService.getArticleList(query);
  }

  @Public()
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleById(id);
  }

  @Post('like/:id')
  async likeArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.toggleLike(articleId, res.user.id);
  }

  @Get('me')
  async getMyArticles(
    @Query() query: GetArticleListDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.getMyArticles(res.user.id, query);
  }

  @Post(':id/status')
  async updateArticleStatus(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() dto: UpdateArticleStatusDto,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.updateArticleStatus(res.user.id, articleId, dto);
  }

  @Delete(':id')
  async deleteArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Request() res: AuthenticatedRequest,
  ) {
    return this.articleService.deleteArticle(res.user.id, articleId);
  }
}
