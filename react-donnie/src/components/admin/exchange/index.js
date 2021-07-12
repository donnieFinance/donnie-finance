import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import {Div, Span, Flex, Img, Right} from "~/styledComponents/shared";
import { List, Card } from 'antd';
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
            //console.log({lpTokenName});

            // lpToken의 현재 발행량 가져오기
            const currentSupply = await iostApi.getTokenCurrentSupply(lpTokenName);
            //console.log({currentSupply});

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
                <List
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
                                            AmountData : <Span fg={"blue"} bold>{swapItem.amountData}</Span>
                                        </Div>
                                        <Div fontSize={12}>
                                        lpTokenName: <Span fg={"blue"} bold>{swapItem.lpTokenName}</Span>
                                        </Div>
                                        <Div fontSize={12}>
                                        currentSupply: <Span fg={"blue"} bold>{swapItem.currentSupply}</Span>
                                        </Div>
                                    </Card>
                                </Div>
                            }
                        >
                        </List.Item.Meta>
                    )}
                />
            </Div>
        </Div>
    );
};

export default Exchange;
