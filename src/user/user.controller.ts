import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { userResponseInterface } from "./types/userResponse.interface";
import { loginUserDto } from "./dto/loginUser.dto";
import { ExpressRequest } from "@app/types/expressRequest.interface";
import { User } from "./user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./dto/update.dto";

@Controller()
export class UserController{
    constructor(private readonly userService:UserService){}
    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto:CreateUserDto):Promise<userResponseInterface>{
        const user = await this.userService.createUser(createUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(
        @Body('user') loginDto : loginUserDto
    ) : Promise<userResponseInterface>{
        console.log('loginDto', loginDto)
        // return 'login' as any
        const user = await this.userService.login(loginDto)
        return this.userService.buildUserResponse(user)
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async currentUser (@User() user:UserEntity):Promise<userResponseInterface>{
        return this.userService.buildUserResponse(user);
    }


    @Patch('user')
    @UseGuards(AuthGuard)

    async updateCurrentUser(@User('id') currentUserId: number, @Body('user') updateUserDto:UpdateUserDto,
):Promise<userResponseInterface>{
    const user = await this.userService.updateUser(currentUserId, updateUserDto);
    return this.userService.buildUserResponse(user);
}
}
