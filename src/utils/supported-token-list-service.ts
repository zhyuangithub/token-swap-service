import axios from 'axios';
import * as constants from './constants';
import * as fs from 'fs';
import { OneInchAggregator } from './aggregator/oneinch';


export class SupportedTokenListService {
    private dataName = 'Nothing swap supported token list'
    private version = '1.0'
    private static tokenList = {}//{chainid:data}
    private oneInchAggregator

    //private static ethereumTokenList = this.initList(constants.ethereumChainId)
    //private static polygonTokenList = this.initList(constants.polygonChainId)


    constructor() {
        this.oneInchAggregator = new OneInchAggregator();

        SupportedTokenListService.tokenList = this.initList();
    }
    public async fetchTokens() {
        console.log(`${new Date().toLocaleString()} fetch tokens`)
        /*
        const fetchUni = async () => {
            //const testData = await fs.readFileSync(__dirname + '/uni.json')
            //const uniTokenData = JSON.parse(testData.toString())
            const uniTokenData = await this.getUniswapTokenList()
            return uniTokenData
        }
        let results = await Promise.all([this.get1inchTokenList(constants.ethereumChainId), this.get1inchTokenList(constants.polygonChainId)]);
        this.mergeTokens(results)*/
        let results = await Promise.all([this.oneInchAggregator.getTokenList()]);
        this.mergeTokens(results)
    }
    private mergeTokens(results) {
        //1inch 0x
        //{}{}不清，{1}{}清,{1}{124}清
        let isClear = false
        results.forEach(result => {//{chainid:data}
            isClear = isClear || Object.keys(result).length != 0
        })
        //全无{},则清空list
        if (isClear) {
            this.emptyList()
        }
        results.forEach(result => {//{chainid:tokens}
            constants.chainIdList.forEach(chainId => {
                SupportedTokenListService.tokenList[chainId]['tokens'] =
                    this.mergeArray(SupportedTokenListService.tokenList[chainId]['tokens'],
                        result[chainId]);
                SupportedTokenListService.tokenList[chainId]['timestamp'] = Date.now()
            })
        })
        let log = `${new Date().toLocaleString()} merged `
        constants.chainIdList.forEach(chainId => {
            log = log + `${chainId}:${SupportedTokenListService.tokenList[chainId]['tokens'].length} `
        })
        console.log(log)
    }

    public static getSupportedTokens(chainId: number) {
        const res = SupportedTokenListService.tokenList[chainId]
        if (res) {
            return res
        } else {
            return {}
        }
        //return SupportedTokenListService.tokenList[chainId]
    }
    private mergeArray(arr1, arr2) {
        const res = [].concat(arr1);
        if (!arr2) {
            return res;
        }
        arr2.forEach(arr2E => {
            let isExist = false
            arr1.forEach(arr1E => {
                isExist = isExist || arr1E['address'] == arr2E['address']
            });
            if (!isExist) {
                res.push(arr2E)
            }
        });
        return res
    }
    private emptyList() {
        console.log(`${new Date().toLocaleString()}empty token list`)
        SupportedTokenListService.tokenList = this.initList()
    }
    private initList() {
        const list = {}
        constants.chainIdList.forEach(chainId => {
            list[chainId] = { "name": this.dataName, "timestamp": 0, "version": this.version, "chainId": chainId, "tokens": [] }
        })
        return list
    }
    public static getTokenInfo(chainId: number, address: string) {
        let tokens = []
        tokens = [].concat(this.tokenList[chainId]['tokens'])
        for (let val in tokens) {
            const token = tokens[val]
            if (address.toLowerCase() == token['address']) {
                return token
            }
        }
        return {}
    }
    public static isValidToken(chainId: number, address: string): boolean {
        return Object.keys(this.getTokenInfo(chainId, address)).length != 0
    }
    public static isValidDecimals(chainId: number, address: string, amount: BigInt): boolean {
        const token = this.getTokenInfo(chainId, address)
        const decimals = parseInt(token['decimals'])
        return Object.keys(token).length != 0 && !isNaN(decimals)// && String(amount).length <= decimals
    }
}