
import { Controller, Get, Param } from '@nestjs/common';
import { SupportedTokenListService } from '@/utils';
//import * as utils from '@/utils';

@Controller("v1/tokens")
export class TokenListController {
    constructor() { }
    @Get(':chainId')
    tokens(@Param('chainId') chainId: number) {
        return SupportedTokenListService.getSupportedTokens(chainId)
    }
}