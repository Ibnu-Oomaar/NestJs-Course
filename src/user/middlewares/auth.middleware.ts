import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService
    ) {}

    async use(
        req: ExpressRequest,
        _: Response,
        next: NextFunction,
    ) {
        console.log('authmiddle', req.headers);

        if (!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization.split(' ')[1];

        console.log('token', token);

        try {
            const decode = verify(token, JWT_SECRET);

            if (typeof decode === 'string') {
                req.user = null;
                next();
                return;
            }

            const user = await this.userService.findById(decode.id);

            req.user = user;

            console.log('decode', decode);
            console.log('user', user);

            next();

        } catch (err) {
            req.user = null;
            next();
        }
    }
}