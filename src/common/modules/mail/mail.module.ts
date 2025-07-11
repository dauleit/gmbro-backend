import { join } from 'path';
import * as AWS from 'aws-sdk';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/configs/config.module';
import { ConfigService } from 'src/configs/config.service';

@Global() // 👈 optional to make module global
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        return {
          transport: {
            SES: new AWS.SES({
              accessKeyId: '',
              secretAccessKey: '',
              region: ''
            })
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true
            }
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
