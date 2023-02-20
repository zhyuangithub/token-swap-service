export interface IAggregatorList {
    getTokenList(): any,//{chainId:[token]}
    getQuote(chainId: string, query: {}): any,//{}
    aggregatorId(): string
}
