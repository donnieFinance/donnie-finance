import React, {useState, useEffect} from 'react';
import iostApi, {getAmountData} from "~/lib/iostApi";
import {useRecoilState} from "recoil";
import {liquidityInfo, usdPriceState} from "~/hooks/atomState";
import openApi from "~/lib/openApi";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";
import properties from "~/properties";

//exchange 의 최상단 total 에서 사용 중
const useLpInfo = ({delay = null}) => {

    const [lpInfo, setLpInfo] = useRecoilState(liquidityInfo)

    const [refreshInterval, setRefreshInterval] = useState(delay)

    //1분마다 갱신되는 usdPrice
    const [usdPrice] = useRecoilState(usdPriceState)

    const refresh = async () => {

        try{
            const swapPairsData = await iostApi.getSwapPairs();

            const result = await Promise.all([
                iostApi.getSwapPairs(),
                openApi.getIostContract()
            ])

            let temp_pairsData = result[0]//swapPairsData;

            let totalCurrentSupply = 0;
            let totalCurrentPrice = 0;
            const res = await temp_pairsData.map(async (itemPairkey, idx) => {
                return iostApi.getLpTokenInfo(itemPairkey).then(async(item)=>{
                    const lpTokenName = item && item.LpTokenName || null;
                    const amountItemData = item && item.AmountData || null;
                    const currentSupply = item && item.TokenCurrentSupply || null;

                    const swapSymbol = itemPairkey.split('_');
                    const symbol1 = swapSymbol[0];
                    const symbol2 = swapSymbol[1];

                    //symbol1 밸런스
                    const symbol1Liquidity = new BigNumber(amountItemData && amountItemData[symbol1])

                    //symbol2 밸런스
                    const symbol2Liquidity = new BigNumber(amountItemData && amountItemData[symbol2])

                    //symbol1 달러
                    const symbol1LiquidityUsd = symbol1Liquidity.multipliedBy(usdPrice && usdPrice[symbol1] || properties.USD_PRICE[symbol1])
                    //symbol2 달러
                    const symbol2LiquidityUsd = symbol2Liquidity.multipliedBy(usdPrice && usdPrice[symbol2] || properties.USD_PRICE[symbol2])

                    //평가 가치 (Estimated value)
                    const totalLiquidity = parseFloat(symbol1LiquidityUsd.plus(symbol2LiquidityUsd).toFixed());

                    return {"idx":idx+1,"swapPairKey":itemPairkey,"amountData":JSON.stringify(amountItemData), "lpTokenName":lpTokenName, "currentSupply":currentSupply, "currentPrice":totalLiquidity};
                });
            });
            const dataResult = await Promise.all(res);

            dataResult.map(dataItem => {
                totalCurrentSupply += dataItem.currentSupply;
                totalCurrentPrice += dataItem.currentPrice;
            });

            const newLpInfo = {
                totalCurrentSupply: totalCurrentSupply,
                totalCurrentPrice: totalCurrentPrice,
                timesOfCall: result[1].total,
                list: dataResult,
                loading: false
            }

            //console.log({newLpInfo})

            setLpInfo(newLpInfo)
        }catch (err) {

        }
    }

    useEffect(() => {
        refresh()
    }, [])

    return {lpInfo, setRefreshInterval}
};

export default useLpInfo;
