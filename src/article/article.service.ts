import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "@app/user/user.entity";
import { DeleteResult, Repository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.inerface";
import slugify from 'slugify'
import { title } from "process";


@Injectable()
export class ArticleService{    
    constructor(@InjectRepository(ArticleEntity) private readonly articleReponsitory:Repository<ArticleEntity>){}
    async createArticle(currentUser:UserEntity , createArticleDto:CreateArticleDto):Promise<ArticleEntity>{
        const article = new ArticleEntity()
        Object.assign(article, createArticleDto) 
        
        if(!article.tagList){
          article.tagList=[];
        }

        article.slug = this.getSlug(createArticleDto.title);

        article.author = currentUser;


        return await this.articleReponsitory.save(article);
    }

    async findBySlug(slug:string):Promise<ArticleEntity>{
        const article =await this.articleReponsitory.findOne({
            where:{
                slug
            }
        });

        if(!article){
            throw new HttpException('Oops! Not found this Article' ,
                HttpStatus.NOT_FOUND
            )
        }
        return article;
    }

    async deleteArticle (slug:string, currentUserId:number):Promise<DeleteResult>{
        const article = await this.findBySlug(slug)

        if(!article){
            throw new HttpException('Oops! this article is Not found',
                HttpStatus.NOT_FOUND
            )
        }

        if( article.author.id !== currentUserId){
            throw new HttpException('Oops! are you not Author',
                HttpStatus.FORBIDDEN
            )
        }
        
        return this.articleReponsitory.delete({slug});
    }

    async updateArticle(slug:string , updateArticleDto:CreateArticleDto, currentUserId:number):Promise<ArticleEntity>{
        const article = await this.findBySlug(slug)

        if(!article){
            throw new HttpException('Oops! this article is Not found' ,
                HttpStatus.FORBIDDEN
            );
        }

        if(article.author.id !== currentUserId){
            throw new HttpException('Oops! you are not author',
                HttpStatus.FORBIDDEN
            );
        }

        Object.assign(article, updateArticleDto);

        return await this.articleReponsitory.save(article);
    }
    
    buildArticleResponse(article:ArticleEntity):ArticleResponseInterface{
        return {article};
    }
 
    private getSlug(title:string): string{
        return(
            slugify(title ,{lower:true}) + '-' + ((Math.random()* Math.pow(36, 6)) | 0).toString(36)
        );
    }
}