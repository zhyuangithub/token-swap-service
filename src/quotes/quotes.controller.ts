import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';

@Controller('v1/quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }
    //v1/quotes/${chainId}?fromToken=xxx&toToken=xxx&amount=xxx&recipient=xxx&slippage=0.5
    @ApiQuery({
        name: "fromToken", type: "string", description: `contract address of from token`,
        required: true,
    })
    @ApiQuery({
        name: "toToken", type: "string", description: `contract address of to token`,
        required: true,
    })
    @ApiQuery({
        name: "amount", type: "number", description: `from token amount in basic unit`,
        required: true,
    })
    @ApiQuery({
        name: "takerAddress", type: "string", description: "The address which will fill the quote. When provided the gas will be estimated",
        required: false,
    })
    @ApiQuery({
        name: "slippage", type: "number", description: `limit of price slippage you are willing to accept in percentage, 0.5 means 0.5%, when provided the rawData will be generated`,
        required: false,
    })
    @Get(':chainId')
    async fetchQuotes(@Param('chainId') chainId: string, @Query() query: {}) {
        return this.quotesService.fetchQuotes(chainId, query)
    }
    /*
    @ApiExcludeEndpoint()
    @Get('uni/:chainId')
    async fetchUni(@Param('chainId') chainId: string, @Query() query: {}) {
        return this.quotesService.fetchUni(chainId, query)
    }
    
    @Get('1inch/:chainId')
    async fetch1inch(@Param('chainId') chainId: string, @Query() query: {}) {
        return this.quotesService.fetch1inch(chainId, query)
    }*/
}
