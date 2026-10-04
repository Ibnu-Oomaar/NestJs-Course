import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.inerface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from '../types/articleResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleReponsitory: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleReponsitory.save(article);
  }

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBilder = this.articleReponsitory
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBilder.andWhere('article.tagList LIKE:tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author,
        },
      });

      if (!author) {
        throw new HttpException('Oops! not found', HttpStatus.NOT_FOUND);
      }
      queryBilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });

      const ids = author.favorites.map((el)=>el.id);
      
      if(ids.length > 0){
        queryBilder.andWhere('articles.id IN (:...ids)', {ids});
      } else {
        queryBilder.andWhere('1=0');
      }
    }

    if(query.favorited){
      const author = await this.userRepository.findOne({
        where:{
          username: query.favorited,
        },
        relations:{
          favorites:true
        }
      });
    }

    queryBilder.orderBy('articles.createdAt', 'DESC');

    let favoritedIds:number[]=[];

    if(currentUserId){
      const currentUser = await this.userRepository.findOne({
        where:{
          id: currentUserId,
        },
        relations:{
          favorites:true,
        },
      }); 
      const favoritedIds = await currentUser?.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBilder.getMany();
    const articleWithFavorited = articles.map((article)=>{
      const favorited = favoritedIds.includes(article.id);
      return {
        ...article,
        favorited,
      }
    });
    
    const articlesCount = await queryBilder.getCount();

    return {
      articles,
      articlesCount,
    };

    if (query.limit) {
      queryBilder.limit(query.limit);
    }

    if (query.offset) {
      queryBilder.offset(query.offset);
    }
  }



  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleReponsitory.findOne({
      where: {
        slug,
      },
    });

    if (!article) {
      throw new HttpException(
        'Oops! Not found this Article',
        HttpStatus.NOT_FOUND,
      );
    }
    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(
        'Oops! this article is Not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('Oops! are you not Author', HttpStatus.FORBIDDEN);
    }

    return this.articleReponsitory.delete({ slug });
  }

  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(
        'Oops! this article is Not found',
        HttpStatus.FORBIDDEN,
      );
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('Oops! you are not author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleReponsitory.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

 async addArticleToFavorite(
  slug: string,
  userId: number,
): Promise<ArticleEntity> {
  const article = await this.findBySlug(slug);

  const user = await this.userRepository.findOne({
    where: {
      id: userId,
    },
    relations: {
      favorites: true,
    },
  });

  if (!user) {
    throw new HttpException(
      'Oops! User not found',
      HttpStatus.NOT_FOUND,
    );
  }

  const isNotFavorited =
    user.favorites.findIndex(
      (articleInFavorite) => articleInFavorite.id === article.id,
    ) === -1;

  if (isNotFavorited) {
    user.favorites.push(article);

    article.favoritesCount++;

    await this.userRepository.save(user);
    await this.articleReponsitory.save(article);
  }

  return article;
}

 async deleteArticleFromFavorite(
  slug: string,
  userId: number,
): Promise<ArticleEntity> {
  const article = await this.findBySlug(slug);

  const user = await this.userRepository.findOne({
    where: {
      id: userId,
    },
    relations: {
      favorites: true,
    },
  });

  if (!user) {
    throw new HttpException(
      'Oops! User not found',
      HttpStatus.NOT_FOUND,
    );
  }

  const articleIndex =
    user.favorites.findIndex(
      (articleInFavorite) => articleInFavorite.id === article.id,
    );

  if (articleIndex >= 0) {
    user.favorites.splice(articleIndex, 1);
    article.favoritesCount--;

    await this.userRepository.save(user);
    await this.articleReponsitory.save(article);
  }

  return article; 
}

}
