import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './user/middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [ 
    TypeOrmModule.forRoot(ormconfig),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'I0Y%zAfUdPm^Z&3L',
      appSecret: 'o9TZ6LoUbslbZCG4Zb1Td1b5i9HCSMHFMm1JmwO2TUDFc',
      serviceId: 'started',
    }),
    TagModule,
    UserModule,
    ArticleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer){
    consumer.apply(AuthMiddleware).forRoutes({
      path:"*",
      method:RequestMethod.ALL,
    });
  }
}
