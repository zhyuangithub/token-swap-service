import { IAggregatorList } from './aggregator-interface';
import axios from 'axios';
import * as constants from '../constants';
import * as utils from '../utils';
import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import * as qs from 'qs';
@Injectable()
export class ZeroXAggregator implements IAggregatorList {
    private urls = {}
    private getUrl(chainId) {
        return this.urls[chainId];
    }
    constructor() {
        this.urls[constants.ethereumChainId] = 'https://api.0x.org/';
        this.urls[constants.polygonChainId] = 'https://polygon.api.0x.org/';
    }
    aggregatorId() {
        return '0xFeeDynamic';
    }
    public async getTokenList() {
        return {}
    }
    public async getQuote(chainId: string, query: {}) {
        const quote = await this.fetchQuote(chainId, query);
        if (quote) {
            try {
                let value = 0;
                if (query['fromToken'].toLowerCase() == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
                    value = query["amount"];
                }
                //console.log(`0x:${quote["buyAmount"]}`)
                const feeAmount = utils.FeeRateProvider.calculateFee(chainId, quote["buyAmount"]);
                const amountAfterFee = utils.FeeRateProvider.calculateAmountAfterFee(chainId, quote["buyAmount"]);
                //const fee = utils.generateFeeData(chainId, query['toToken'], feeAmount)
                const result = {
                    "aggregatorName": this.aggregatorId(), "estimatedGas": 0,
                    "value": value, "outputAmount": amountAfterFee, "fee": feeAmount, "rawData": "",
                    "path": quote["orders"], "source": this.generateSource(quote["sources"])
                }
                //console.log(JSON.stringify(quote));
                if (quote['data']) {
                    const rawData = utils.generateSwapABI(this.aggregatorId(), query['fromToken'], query['toToken'], query['amount'], quote["buyAmount"], quote['data']);
                    result["rawData"] = rawData
                    if (ethers.utils.isAddress(query['takerAddress'])) {
                        const estimatedGas = await utils.Web3Provider.estimateGas(chainId, query['takerAddress'], constants.SwapContractAddress[chainId], value, rawData);
                        result["estimatedGas"] = Math.ceil(estimatedGas * Number(process.env['ESTIMATEGAS_SCALE']));
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
    private async fetchQuote(chainId: string, query: {}) {
        const baseUrl = this.getUrl(chainId)
        let url = ''
        //const amountAfterFee = utils.FeeRateProvider.calculateAmountAfterFee(chainId, query['amount']);
        const params = {
            sellToken: query['fromToken'],
            buyToken: query['toToken'],
            sellAmount: query['amount'],
        }
        if (constants.SwapContractAddress[chainId] != "") {
            params["takerAddress"] = constants.SwapContractAddress[chainId]
        } else {
            params["takerAddress"] = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        }
        //amount afer fee 
        if (constants.SwapContractAddress[chainId] != "" && !isNaN(parseFloat(query['slippage'])) && parseFloat(query['slippage']) <= constants.maxSlippage) {
            params['slippagePercentage'] = query['slippage'] / 100;//0.03 =3%,
            params['skipValidation'] = true
            url = `${baseUrl}swap/v1/quote?${qs.stringify(params)}`
        } else {
            url = `${baseUrl}swap/v1/price?${qs.stringify(params)}`
        }
        try {
            const { data, status } = await axios.get(url)

            if (status == 200) {
                return data
            } else {
                console.log(`${new Date().toLocaleString()} fetch 0x quote status:${status} params:${JSON.stringify(params)} data:${JSON.stringify(data)}`)
                return null
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status != 400) {
                    console.log(`${new Date().toLocaleString()}:fetch 0x quote chainId: ${chainId} params:${JSON.stringify(params)} error${error.toString()}`)
                }
            }
            return null
        }
    }


    private generateSource(data) {
        //[{ name: "POLYGON_BALANCER_V2", proportion: "100", logoURI: "" }]
        const result = []
        for (const i in data) {
            const element = data[i]
            if (element["proportion"] != 0) {
                const source = { logoURI: "" }
                source["name"] = element["name"]
                source["proportion"] = element["proportion"] * 100
                result.push(source)
            }
        }
        return result
    }
}