import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import {Div, Span, Flex, Img, Right} from "~/styledComponents/shared";
import { List, Card, Spin} from 'antd';
import BigNumber from "bignumber.js";
import properties from "~/properties";
import {useRecoilState} from "recoil";
import {usdPriceState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
const Exchange = () => {

    //1분마다 갱신되는 usdPrice
    const [usdPrice] = useRecoilState(usdPriceState)

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetch(){
            await search()
        }
        fetch();
    }, [])

    const search = async () => {
        setLoading(true);
        const swapPairsData = await iostApi.getSwapPairs();
        let temp_pairsData = swapPairsData;
        let result = [];
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

                return {"idx":idx+1,"swapPairKey":itemPairkey,"symbol1":symbol1,"symbol2":symbol2,"symbol1Amount":amountItemData[symbol1], "symbol2Amount":amountItemData[symbol2], "invariant":amountItemData["invariant"], "lpTokenName":lpTokenName, "currentSupply":currentSupply, "currentPrice":totalLiquidity};

            });
        });
        const dataResult = await Promise.all(res);
        setData(dataResult);
        setLoading(false);
    }

    return (
        <Div>
            <Div fontSize={18} mb={10}>
                Exchange 현황
            </Div>
            <Div>
                <Spin spinning={loading}>
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={data}
                    renderItem={(swapItem, index) => (
                        <List.Item.Meta
                            description={
                                <Div mb={10}>
                                    <Card
                                        title={
                                            <Div fontSize={12}>swapPairKey : <Span fg={"brown"} bold>{swapItem.swapPairKey}</Span></Div>
                                        }
                                    >
                                        <Div fontSize={12}>
                                            lpTokenName: <Span fg={"blue"} bold>{swapItem.lpTokenName}</Span>
                                        </Div>
                                        <Div fontSize={12}>
                                            {swapItem.symbol1} : <Span fg={"blue"} bold>{swapItem.symbol1Amount}</Span>, {swapItem.symbol2} : <Span fg={"blue"} bold>{swapItem.symbol2Amount}</Span>, invariant : <Span fg={"blue"} bold>{swapItem.invariant}</Span>
                                        </Div>
                                        <Div fontSize={12}>
                                            currentSupply: <Span fg={"blue"} bold>{swapItem.currentSupply}</Span>, totalLiquidity: <Span fg={"blue"} bold>${swapItem.currentPrice.toFixed(2)}</Span>
                                        </Div>
                                    </Card>
                                </Div>
                            }
                        >
                        </List.Item.Meta>
                    )}
                />
                </Spin>
            </Div>
        </Div>
    );
};

export default Exchange;
