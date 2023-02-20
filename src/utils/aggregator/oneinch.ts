import { IAggregatorList } from './aggregator-interface';
import axios from 'axios';
import * as constants from '../constants';
import * as utils from '../utils';
import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import * as qs from 'qs';
@Injectable()
export class OneInchAggregator implements IAggregatorList {
    private getUrl() {
        return 'https://api.1inch.io/v4.0/';
    }
    aggregatorId() {
        return 'oneInchV4FeeDynamic';
    }
    public async getTokenList() {
        const fetchFunctions = []
        constants.chainIdList.forEach((chainId) => {
            fetchFunctions.push(this.get1inchTokenList(chainId))

        })
        const tokenList = await Promise.all(fetchFunctions);
        const result = this.generateTokenList(tokenList);//{chainId:tokens}
        return result
    }
    public async getQuote(chainId: string, query: {}) {
        const quote = await this.fetch1inchQuote(chainId, query);
        if (quote) {
            try {
                let value = 0;
                if (query['fromToken'].toLowerCase() == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
                    value = query["amount"];
                }
                //console.log(`1inch:${quote["toTokenAmount"]}`)
                const feeAmount = utils.FeeRateProvider.calculateFee(chainId, quote["toTokenAmount"]);
                const amountAfterFee = utils.FeeRateProvider.calculateAmountAfterFee(chainId, quote["toTokenAmount"]);
                const result = {
                    "aggregatorName": this.aggregatorId(), "estimatedGas": 0,
                    "value": value, "outputAmount": amountAfterFee, "fee": feeAmount, "rawData": "",
                    "path": quote["protocols"], "source": this.generateSource(quote["protocols"], query['fromToken'], chainId)
                }
                if (quote['tx']) {
                    if (quote['tx']['data']) {
                        const rawData = utils.generateSwapABI(this.aggregatorId(), query['fromToken'], query['toToken'], query['amount'], quote["toTokenAmount"], quote['tx']['data']);
                        result["rawData"] = rawData
                        if (ethers.utils.isAddress(query['takerAddress'])) {
                            const estimatedGas = await utils.Web3Provider.estimateGas(chainId, query['takerAddress'], constants.SwapContractAddress[chainId], value, rawData);
                            result["estimatedGas"] = Math.ceil(estimatedGas * Number(process.env['ESTIMATEGAS_SCALE']));
                        }
                    }
                }
                return result
            } catch (error) {
                return null
            }
        } else {
            return null
        }

    }
    private async fetch1inchQuote(chainId: string, query: {}) {
        const baseUrl = this.getUrl();
        let url = ''
        const params = {
            fromTokenAddress: query['fromToken'],
            toTokenAddress: query['toToken'],
            amount: query['amount']
        }
        if (constants.SwapContractAddress[chainId] != "" && !isNaN(parseFloat(query['slippage'])) && parseFloat(query['slippage']) <= constants.maxSlippage) {
            params['slippage'] = query['slippage']//0.5 = 0.5%
            params['destReceiver'] = constants.SwapContractAddress[chainId]
            params['disableEstimate'] = true
            params["fromAddress"] = constants.SwapContractAddress[chainId]
            url = `${baseUrl}${chainId}/swap?${qs.stringify(params)}`
        } else {
            url = `${baseUrl}${chainId}/quote?${qs.stringify(params)}`
        }
        try {
            const { data, status } = await axios.get(url)

            if (status == 200) {
                return data
            } else {
                console.log(`${new Date().toLocaleString()} fetch 1inch quote status:${status} params:${JSON.stringify(params)} data:${JSON.stringify(data)}`)
                return null
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status != 400) {
                    console.log(`${new Date().toLocaleString()}:fetch 1inch quote chainId: ${chainId} params:${JSON.stringify(params)} error${error.toString()}`)
                }
            }
            return null
        }
    }
    private async get1inchTokenList(chainId: number) {
        //console.log(`${new Date().toLocaleString()}:fetch 1inch ${chainId}`)
        const oneInchUrl = this.getUrl() + `${chainId}/tokens`;
        try {
            const { data, status } = await axios.get(oneInchUrl)
            //console.log(`${new Date().toLocaleString()}:fetch 1inch ${chainId} done`)
            if (status == 200) {
                const result = {}
                result[chainId] = data
                //if (chainId == 1) {return { 'error': 1 }}
                return result
            } else {
                console.log(`${new Date().toLocaleString()} fetch 1inch list status:${status} data:${JSON.stringify(data)}`)
                return { 'error': 1 }
            }
        } catch (error) {
            console.log(`${new Date().toLocaleString()}:fetch 1inch list ${chainId} error${error.toString()}`)
            return { 'error': 1 }
        }
    }
    private generateTokenList(tokenList) {
        // {chainId:tokens}
        const result = {}
        tokenList.forEach((list) => {
            if (!list['error']) {
                const tokens = []
                try {
                    const chainId = Object.keys(list)[0]
                    const originTokens = list[chainId]['tokens']
                    for (let val in originTokens) {
                        const token = originTokens[val]
                        tokens.push(utils.generateToken(token))
                    }
                    result[chainId] = tokens
                } catch (error) { }
            }
        })
        return result
    }
    private generateSource(protocols, fromTokenAddress, chainId) {
        const sources = {}
        for (const i in protocols) {
            const protocol = protocols[i];
            protocol.forEach(element => {
                element.forEach(e => {
                    //[{ name: "POLYGON_BALANCER_V2", proportion: "100", logoURI: "" }]
                    if (this.checkEqualToFrom(e['fromTokenAddress'].toLowerCase(), fromTokenAddress.toLowerCase(), chainId)) {
                        const source = { logoURI: "" }
                        source['proportion'] = e['part']
                        source['name'] = e['name']
                        sources[e['name']] = source
                    }
                })
            })
        }
        return [].concat(Object.values(sources))
    }
    private checkEqualToFrom(addressToCheck, fromTokenAddress, chainId) {
        const systemTokenAddress = {}
        systemTokenAddress[constants.ethereumChainId] = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        systemTokenAddress[constants.polygonChainId] = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
        if (fromTokenAddress == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            return addressToCheck == fromTokenAddress || addressToCheck == systemTokenAddress[chainId]
        } else {
            return addressToCheck == fromTokenAddress
        }
    }
}