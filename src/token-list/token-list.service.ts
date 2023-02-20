import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenListService {
    getSupportedTokens(chainId: string): string {
        return 'token list Hello World!' + chainId;
    }
}

