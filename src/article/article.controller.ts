import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/user.decorator';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.inerface';
import { UpdateArticleDto } from './dto/updateArticle.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') CreateArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      CreateArticleDto,
    );
    return this.articleService.buildArticleResponse(article)
  }

  @Get(':slug')
  async getSingleArticle(@Param('slug')slug:string):Promise<ArticleResponseInterface>{
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(@User('id') currentUserId:number ,@Param('slug') slug:string){
    return await this.articleService.deleteArticle(slug , currentUserId)
  }

    @Patch(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateArticle(@User('id') currentUserId:number, @Param('slug') slug:string, @Body('article')
    updateArtticleDto:CreateArticleDto){
        const article = await this.articleService.updateArticle(slug , updateArtticleDto , currentUserId)
        return await this.articleService.buildArticleResponse(article);
    }
}