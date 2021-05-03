import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import BigNumber from "bignumber.js";

import properties from "~/properties";
import {Div, Span, Flex, Img, Right} from "~/styledComponents/shared";
import {Space, Table} from "antd";
import AdminApi from "~/lib/adminApi";
import ComUtil from "~/util/ComUtil";

const Exchange = () => {

    const [data, setData] = useState([])

    useEffect(() => {
        async function fetch(){
            await search()
        }
        fetch();
    }, [])

    const search = async () => {
        const swapPairsData = await iostApi.getSwapPairs();
        let temp_pairsData = swapPairsData;
        let result = [];
        const res = await temp_pairsData.map(async (item, idx) => {

            // 해당 pair의 lpTokenName 가져오기
            const lpTokenName = await iostApi.getLpTokenName(item);
            console.log({lpTokenName});

            // lpToken의 현재 발행량 가져오기
            const currentSupply = await iostApi.getTokenCurrentSupply(lpTokenName);
            console.log({currentSupply});

            return iostApi.getAmountData(item).then(async(res)=>{
                return {"idx":idx+1,"swapPairKey":item,"amountData":JSON.stringify(res), "lpTokenName":lpTokenName, "currentSupply":currentSupply};
            });
        });
        const dataResult = await Promise.all(res);
        setData(dataResult);
    }

    return (
        <Div>
            <Div fontSize={18} mb={10}>
                Exchange 현황
            </Div>
            <Div>
                <Flex mb={10}>
                    {/*<Flex bc={'secondary'} rounded={5} p={10}>*/}
                    {/*    <Div fontSize={18} mr={10}>USD</Div>*/}
                    {/*    <Div fontSize={30} bold></Div>*/}
                    {/*</Flex>*/}
                </Flex>
                <Div>
                    {
                        data.map((swapItem, index) =>
                            <Div key={`swapItem${index}`} bg={'white'} fg={'black'} fontSize={18} mb={2}>
                                <Flex>
                                    <Div fontSize={12} p={10} bc={'secondary'}>{swapItem.idx}</Div>
                                    <Div fontSize={12} p={10} bc={'secondary'} ml={0.9}>swapPairKey : <Span fg={"brown"} bold>{swapItem.swapPairKey}</Span></Div>
                                    <Div fontSize={12} p={10} bc={'secondary'} ml={0.9}>
                                        AmountData : <Span fg={"blue"} bold>{swapItem.amountData}</Span> <br/>
                                        lpTokenName: <Span fg={"blue"} bold>{swapItem.lpTokenName}</Span> <br/>
                                        currentSupply: <Span fg={"blue"} bold>{swapItem.currentSupply}</Span>
                                    </Div>
                                    <Flex flexGrow={1} fontSize={12} p={10} bc={'secondary'} ml={0.9}>
                                        &nbsp;
                                    </Flex>
                                </Flex>
                            </Div>
                        )
                    }
                </Div>
            </Div>
        </Div>
    );
};

export default Exchange;
