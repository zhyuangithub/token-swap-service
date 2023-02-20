import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { SupportedTokenListService } from './supported-token-list-service';

@Module({
    providers: [CronService, SupportedTokenListService],
    imports: [SupportedTokenListService],
    exports: [CronService],
})
export class CronModule { }