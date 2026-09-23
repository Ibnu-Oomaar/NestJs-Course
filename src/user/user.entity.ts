  import { ArticleEntity } from "@app/article/article.entity";
import * as argon2 from "argon2";
  import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

  @Entity({name:'users'})
  export class UserEntity{
      @PrimaryGeneratedColumn()
      id:number;

      @Column()
      email:string;

      @Column()
      username:string;

      @Column({default:''})
      bio:string;

      @Column({default:''})
      image:string;

      @Column({select:false})
      password:string;

      @BeforeInsert()
      async hashPassword(){
        this.password = await argon2.hash(this.password);
      }

      @OneToMany(()=> ArticleEntity, (article) => article.author)
      articles:ArticleEntity[];

  }