import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import { Web3Provider } from '@/utils';
@Injectable()
export class OthersService {
    async allowance(chainId: number, query: {}) {
        //contract owner spender
        if (!this.checkAllowanceParams(query)) {
            return { res: '-1', error: 'invalid parameters' };
        }
        const provider = Web3Provider.getProvider(chainId);
        return await this.checkAllowance(provider, query['contract'], query['owner'], query['spender'])
    }
    private checkAllowanceParams(query: {}): boolean {
        return ethers.utils.isAddress(query['contract']) && ethers.utils.isAddress(query['owner'])
            && ethers.utils.isAddress(query['spender']);
    }
    private async checkAllowance(provider, contractAddr, owner, spender) {
        const iface = new ethers.utils.Interface(["function allowance(address owner, address spender) view returns (uint256 value)"]);
        const contract = new ethers.Contract(contractAddr, iface, provider);
        try {
            const res = await contract.allowance(owner, spender);
            return { res: ethers.BigNumber.from(res).toString(), error: '' };
        } catch (error) {
            return { res: '-1', error: error.toString() };
        }
    }
}