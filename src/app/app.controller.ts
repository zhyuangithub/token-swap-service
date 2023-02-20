import { Controller, Get, Param } from '@nestjs/common';
import { CronService } from '@/utils';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('v1/app')
export class AppController {
    constructor(private readonly cronService: CronService) {
        this.cronService.start();
        //listen on rate change event
    }
    @ApiExcludeEndpoint()
    @Get('hello')
    hello(): string {
        return `hello ${process.env['VERSION']}:${new Date().toLocaleString()}`;
    }
}