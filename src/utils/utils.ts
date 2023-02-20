import * as constants from './constants';
import { ethers } from "ethers";
import { SupportedTokenListService } from './supported-token-list-service';
function generateToken(token) {
    return {
        address: token['address'].toLowerCase(), name: token['name'],
        symbol: token['symbol'], decimals: token['decimals'],
        logoURI: token['logoURI']
    }
}
function generateSwapABI(aggregatorId, tokenFrom, tokenTo, amount, outputAmount, data) {
    const myABI = ["function swap(string memory aggregatorId, address tokenFrom, address tokenTo, uint256 amount, uint256 outputAmount, bytes memory data)"];
    const iface = new ethers.utils.Interface(myABI);
    //string memory aggregatorId, address tokenFrom, uint256 amount, bytes memory data
    const abidata = iface.encodeFunctionData("swap",
        [aggregatorId, tokenFrom, tokenTo, amount, outputAmount, data]);
    //console.log(abidata);
    return abidata;
}
function generateFeeData(chainId, tokenAddress, amount) {
    const token = SupportedTokenListService.getTokenInfo(chainId, tokenAddress);
    return { amount: amount, symbol: token['symbol'], decimals: token['decimals'], logoURI: token["logoURI"] }

}
class Web3Provider {
    private static web3Provider = {};
    public static getProvider(chainId: number) {
        if (!this.web3Provider[chainId]) {
            let url = ''
            if (chainId == constants.ethereumChainId) {
                url = process.env['ALCHEMY_ETH']

            } else if (chainId == constants.polygonChainId) {
                url = process.env['ALCHEMY_POLYGON']
            }
            this.web3Provider[chainId] = new ethers.providers.JsonRpcProvider(url);
        }
        return this.web3Provider[chainId]
    }
    public static async estimateGas(chainId, from, to, value, data) {
        const provider = this.getProvider(chainId);
        const estimatedGas = await provider.estimateGas({
            from: from,
            to: to,
            data: data,
            value: value
        }).catch(error => {
            //console.log(error)
        });
        if (estimatedGas) {
            return parseInt(estimatedGas['_hex'], 16);
        }
        return 1000000
    }

}
class FeeRateProvider {
    private static feeRates = {};
    public static getFeeRate(chainId: number) {
        return this.feeRates[chainId];
    }
    public static setFeeRate(chainId: number, feeRate: number) {
        this.feeRates[chainId] = feeRate / this.feeRateUnit();//1% 10000=>0.01
    }
    private static feeRateUnit() {
        return 10 ** 6;
    }
    public static calculateFee(chainId, amount) {
        const amountInBigNumber = ethers.BigNumber.from(amount);
        let feeRate = this.feeRates[chainId];
        if (!feeRate) {
            feeRate = 0;
        }
        const unit = this.feeRateUnit();
        return amountInBigNumber.mul(feeRate * unit).div(unit).toString();
    }
    public static calculateAmountAfterFee(chainId, amount) {
        const fee = this.calculateFee(chainId, amount);
        const amountInBigNumber = ethers.BigNumber.from(amount);
        return amountInBigNumber.sub(fee).toString();
    }
}
export { generateToken, generateSwapABI, generateFeeData, Web3Provider, FeeRateProvider }