import { Module } from '@nestjs/common';
import { TokenListModule } from '@/token-list';
import { QuotesModule } from '@/quotes';
import { OthersModule } from '@/others';
import { AppController } from './app.controller';
import { CronModule } from '@/utils';
//import { Name } from '@/helpers';
@Module({
  imports: [TokenListModule,
    QuotesModule, CronModule, OthersModule],
  controllers: [AppController],

})
export class AppModule { }
