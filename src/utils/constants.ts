import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const ethereumChainId = 1
const polygonChainId = 137
const chainIdList = [ethereumChainId, polygonChainId]
const maxSlippage = 20;//20%
enum CronServicePeriods {
    millisecond = 1,
    second = CronServicePeriods.millisecond * 1000,
    minute = CronServicePeriods.second * 60,
    hour = CronServicePeriods.minute * 60,
    day = CronServicePeriods.hour * 24,
    week = CronServicePeriods.day * 7,
}
const timeInterval = CronServicePeriods.hour * Number(process.env['TIME_INTERVAL']);

const SwapContractAddress = { 1: process.env['ETH_CONTRACT'], 137: process.env['POLYGON_CONTRACT'] };//

export {
    ethereumChainId, polygonChainId,
    timeInterval, chainIdList, maxSlippage, SwapContractAddress
}