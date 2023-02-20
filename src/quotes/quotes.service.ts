import { Injectable } from '@nestjs/common';
import * as constants from '@/utils/constants';
import { SupportedTokenListService } from '@/utils';
import { ethers } from "ethers";
import { OneInchAggregator } from '@/utils/aggregator/oneinch';
import { ZeroXAggregator } from '@/utils/aggregator/zerox';
import * as utils from '@/utils';
@Injectable()
export class QuotesService {
    private web3Provider = {}
    private uniswapRouter = {}
    private oneInchAggregator
    private zeroXAggregator
    constructor() {
        this.oneInchAggregator = new OneInchAggregator()
        this.zeroXAggregator = new ZeroXAggregator()

    }
    async fetchQuotes(chainId: string, query: {}) {
        if (!this.checkQuoteParams(chainId, query)) {
            return { error: 'invalid params' }
        }
        const quotes = await Promise.all([this.oneInchAggregator.getQuote(chainId, query), this.zeroXAggregator.getQuote(chainId, query)]);
        return this.generateResult(chainId, quotes, query)

    }
    /*
    async fetchUni(chainId: string, query: {}) {
        if (!this.checkQuoteParams(chainId, query)) {
            return 'invalid params'
        }
        const res = await this.fetchuniSwapQuote(parseInt(chainId), query)
        return res
    }*/

    private checkQuoteParams(chainId: string, query: {}): boolean {
        //from contract address in list
        let amount: BigInt
        try {
            amount = BigInt(query['amount'])
        } catch (error) {
            return false
        }
        return !isNaN(parseInt(chainId)) && SupportedTokenListService.isValidToken(parseInt(chainId), query['fromToken'])
            && SupportedTokenListService.isValidToken(parseInt(chainId), query['toToken'])
            && query['fromToken'] != query['toToken']
    }
    /*
        private async fetchuniSwapQuote(chainId: number, query: {}) {
    
            const fromToken = this.getToken(chainId, query['fromToken'])
            const toToken = this.getToken(chainId, query['toToken'])
            const amount = CurrencyAmount.fromRawAmount(fromToken, query['amount']);
            const slippage = 2
            const route = await this.getUniswapRouter(chainId).route(
                amount,
                toToken,
                TradeType.EXACT_INPUT,
                {
                    recipient: query['recipient'],
                    slippageTolerance: new Percent(slippage, 100),
                    //deadline: Math.floor(Date.now() / 1000 + 1800)
                }
            );
            return route
        }*/
    private async generate1inchABI() {

    }
    private async generateuniSwapABI() {

    }
    private generateResult(chainId, quotes, query) {
        const fromToken = SupportedTokenListService.getTokenInfo(chainId, query['fromToken'])
        const toToken = SupportedTokenListService.getTokenInfo(chainId, query['toToken'])
        //const fee = utils.FeeRateProvider.calculateFee(chainId, query['amount']);
        const result = {
            "name": "Nothing swap quotes", "version": "1.0", "chainId": chainId,
            "fromToken": fromToken, "toToken": toToken, "inputAmount": query['amount'], "timestamp": Date.now(),
            "router": constants.SwapContractAddress[chainId], "routes": []
        }
        const routes = [].concat(this.sortQuotes(quotes))//sort best price in first
        /*
        quotes.forEach(quote => {
            if (quote) {
                routes.push(quote)
            }
        })*/
        result['routes'] = routes
        return result
    }
    private sortQuotes(quotes) {
        const selectArr = (arr) => {
            for (let i = 0; i < arr.length - 1; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    if (compareElement(arr[i], arr[j])) {
                        let temp = arr[i]
                        arr[i] = arr[j]
                        arr[j] = temp
                    }
                }
            }
            return [].concat(removeEmpty(arr));
        }
        const compareElement = (a, b) => {
            let outPutAmountA = BigInt(0)
            try {
                outPutAmountA = BigInt(a["outputAmount"])
            } catch (error) { }
            let outPutAmountB = BigInt(0)
            try {
                outPutAmountB = BigInt(b["outputAmount"])
            } catch (error) { }
            return outPutAmountA < outPutAmountB
        }
        const removeEmpty = (arr) => {
            const res = [];
            arr.forEach(e => {
                try {
                    BigInt(e["outputAmount"])
                    res.push(e)
                } catch (error) { }
            });
            return res;
        }
        return [].concat(selectArr(quotes));
    }
    private getBestQuote(quotes) {
        let bestQuote = { "outputAmount": 0 }
        quotes.forEach(quote => {
            if (quote) {
                const outPutAmount = BigInt(quote["outputAmount"])
                const bestQuoteAmount = BigInt(bestQuote["outputAmount"])
                console.log(`aggregator:${quote["aggregatorName"]} output:${quote["outputAmount"]}`)
                if (outPutAmount > bestQuoteAmount) {
                    bestQuote = Object.assign({}, quote);
                }
            }
        })
        return [bestQuote]
    }
    /*
        private async getUniswapRoute(chainId: string, query: {}) {
            const uniswapQuote = await this.fetchuniSwapQuote(parseInt(chainId), query)
            if (uniswapQuote) {
                //BigInt(uniswapQuote['estimatedGasUsed']['hex']).toString()
                try {
                    const result = {
                        "aggregatorName": "uniswap", "estimategas": BigInt(uniswapQuote['estimatedGasUsed']['_hex']).toString(),
                        "outputAmount": uniswapQuote['quote'].quotient.toString(), "rawData": "0x…",
                        "path": uniswapQuote["trade"]['swaps']
                    }
                    return result
                } catch (error) {
                    return null
                }
    
            } else {
                return null
            }
        }
    private getToken(chainId: number, address: string) {
        const token = SupportedTokenListService.getTokenInfo(chainId, address)
        return new Token(
            chainId,
            token['address'],
            token['decimals'],
            token['symbol'],
            token['name']
        );
    }
    private async isExternalAddress(chainId: number, address: string) {
        try {
            const code = await this.web3Provider[chainId].getCode(address);

            return code == '0x' && ethers.utils.isAddress(address)
        } catch (error) {
            //console.log(error.toString())
            return false;
        }
    }*/
    /*
    private getUniswapRouter(chainId: number) {
        const provider = this.getProvider(chainId)
        if (!this.uniswapRouter[chainId]) {
            this.uniswapRouter[chainId] = new AlphaRouter({ chainId: chainId, provider: provider });
        }
        return this.uniswapRouter[chainId]
    }*/
}