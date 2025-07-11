import { AWSController } from './aws.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from 'src/configs/config.module';
import { ConfigService } from 'src/configs/config.service';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';

@Module({
  imports: [ConfigModule],
  controllers: [AWSController],
  providers: [AwsService, ConfigService],
  exports: [AwsService]
})
export class AwsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AWSController);
  }
}
