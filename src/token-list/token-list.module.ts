
import { Module } from '@nestjs/common';
import { TokenListController } from './token-list.controller';
import { TokenListService } from './token-list.service';
import { CronModule } from '@/utils';

@Module({
    imports: [CronModule],
    controllers: [TokenListController],
    providers: [TokenListService],
})
export class TokenListModule { }