import { Injectable } from '@nestjs/common';
import { SupportedTokenListService } from './supported-token-list-service';
import * as constants from './constants';
import { ethers } from "ethers";
import { Web3Provider, FeeRateProvider } from './utils';


@Injectable()
export class CronService {
    private timeInterval = constants.timeInterval;
    private static tickerId;
    private contracts = {};
    //private provider = ethers.getDefaultProvider();

    constructor(private readonly supportedTokenListService: SupportedTokenListService) {
        this.initFeeRate().then(() => { });
        //this.listenOnFeeRate();
    }
    public start() {
        setTimeout(() => {
            this.supportedTokenListService.fetchTokens()
        }, 2000)
        CronService.tickerId = setInterval(() => {
            this.supportedTokenListService.fetchTokens()
        }, this.timeInterval)
    }
    public stop() {
        if (CronService.tickerId) {
            clearInterval(CronService.tickerId)
            CronService.tickerId = null
        }
    }
    private listenOnFeeRate() {
        for (let index = 0; index < constants.chainIdList.length; index++) {
            const chainId = constants.chainIdList[index];
            const contract = this.getContract(chainId);

            contract.on("FeeRateChanged", (newFeeRate, event) => {
                FeeRateProvider.setFeeRate(chainId, newFeeRate);
                console.log(`fee rate updated ${chainId}:${newFeeRate}`);
            });
        }
    }
    private async initFeeRate() {
        for (let index = 0; index < constants.chainIdList.length; index++) {
            const chainId = constants.chainIdList[index];
            const contract = this.getContract(chainId);
            try {
                const res = await contract.feeRate();
                const feeRate = parseInt(res["_hex"], 16);
                console.log(`init fee rate ${chainId}:${feeRate}`);
                FeeRateProvider.setFeeRate(chainId, feeRate);
            } catch (error) { }
        }
    }
    private getContract(chainId: number) {
        const abi = ["function feeRate() view returns (uint256 value)", "event FeeRateChanged(uint256 newFeeRate)"];
        if (!this.contracts[chainId]) {
            const provider = Web3Provider.getProvider(chainId);
            const contractAddress = constants.SwapContractAddress[chainId];
            this.contracts[chainId] = new ethers.Contract(contractAddress, abi, provider);
        }
        return this.contracts[chainId];
    }

    public asyncTest(start: string): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const end = new Date().toLocaleString()
                resolve(`start:${start} end:${end}`)
            }, 5000)

        })
    }

}