import { Injectable } from "@nestjs/common";

@Injectable()
export class ArticleService{    
    async createArticle(){
        return 'Create Article from services';    
    }
}