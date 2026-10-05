import { ArticleEntity } from "@app/article/article.entity";

export type ArticleResponseArticle = Omit<ArticleEntity, "updateTimestamp"> & {
    favorited: boolean;
};

export interface ArticlesResponseInterface{
    articles?: ArticleResponseArticle[];
    articlesCount:number;
}