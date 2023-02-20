
import { Module } from '@nestjs/common';
import { OthersController } from './others.controller';
import { CronModule } from '@/utils';
import { OthersService } from './others.service';
@Module({
    imports: [CronModule],
    controllers: [OthersController],
    providers: [OthersService],
})
export class OthersModule { }