
import { Controller, Get, Param, Query } from '@nestjs/common';
import * as utils from '@/utils';
import * as constants from '@/utils/constants';
import { OthersService } from './others.service';
import { ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';

@Controller("v1")
export class OthersController {
    constructor(private readonly othersService: OthersService) { }
    @Get('feeRate/:chainId')
    feeRate(@Param('chainId') chainId: number) {
        return utils.FeeRateProvider.getFeeRate(chainId);
    }
    @ApiExcludeEndpoint()
    @Get('feerate/:chainId')
    feerate(@Param('chainId') chainId: number) {
        return utils.FeeRateProvider.getFeeRate(chainId);
    }
    @Get('contract/:chainId')
    contract(@Param('chainId') chainId: number) {
        return constants.SwapContractAddress[chainId];
    }
    @ApiQuery({
        name: "contract", type: "string", description: `contract address of erc20 token`,
        required: true,
    })
    @ApiQuery({
        name: "owner", type: "string", description: `owner address`,
        required: true,
    })
    @ApiQuery({
        name: "spender", type: "string", description: `spender address`,
        required: true,
    })
    @Get('allowance/:chainId')
    async allowance(@Param('chainId') chainId: number, @Query() query: {}) {
        return this.othersService.allowance(chainId, query);
    }
}