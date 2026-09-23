import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JWT_SECRET } from "@app/config";
import { sign } from "jsonwebtoken";
import { userResponseInterface } from "./types/userResponse.interface";
import { loginUserDto } from "./dto/loginUser.dto";
import * as argon2 from 'argon2';
import { UpdateUserDto } from "./dto/update.dto";



@Injectable()
export class UserService{
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository:Repository<UserEntity>
    ){}
    async createUser(createUserDto:CreateUserDto):Promise<any>{

        const userByEmail = await this.userRepository.findOne({
            where:{
                email:createUserDto.email,
            },
        });

        const userByName = await this.userRepository.findOne({
            where:{
                username:createUserDto.username,
            },
        });

        if(userByEmail || userByName){
            throw new HttpException('Email or username are taking', 
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const newUser = new UserEntity();
        Object.assign(newUser,createUserDto);
        console.log('newUser',newUser);
        return await this.userRepository.save(newUser);
    } 

    async findById(id:number):Promise<UserEntity | null>{
        return this.userRepository.findOne({where:{id}})
    }

   async login(loginUserDto: loginUserDto): Promise<UserEntity> {
  const user = await this.userRepository.findOne({
    where: {
      email: loginUserDto.email,
    },
    select:{
        'id':true,
        'username':true,
        'email':true,
        'bio':true,
        'image':true,
        'password':true
    }
  });

  if (!user) {
    throw new HttpException(
      'Credentials are not valid',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  const isCorrectPassword = await argon2.verify(
    user.password,
    loginUserDto.password,
  );

  if (!isCorrectPassword) {
    throw new HttpException(
      'Credentials are not valid',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  return user;
}

async updateUser(userId:number, updateUserDto:UpdateUserDto): Promise<UserEntity>{
    const user = await this.findById(userId);

    if(!user){
        throw new HttpException('Not found user', HttpStatus.NOT_FOUND);
    }

     Object.assign(user, updateUserDto);
      return await this.userRepository.save(user)

}

    generateJwt(user:UserEntity):string{
       return sign(
        {
        id: user.id,
        username:user.username,
        email:user.email

       },JWT_SECRET
    )
    }

    buildUserResponse(user:UserEntity):userResponseInterface{
        delete (user as Partial<UserEntity>).password;
        return{
            user:{
                ...user,
                token: this.generateJwt(user)
            }
        }
    }
}