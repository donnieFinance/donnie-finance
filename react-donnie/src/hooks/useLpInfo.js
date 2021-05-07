import React, {useState, useEffect} from 'react';
import iostApi from "~/lib/iostApi";
import {useRecoilState} from "recoil";
import {liquidityInfo} from "~/hooks/atomState";
import openApi from "~/lib/openApi";

//exchange 의 최상단 total 에서 사용 중
const useLpInfo = ({delay = null}) => {

    const [lpInfo, setLpInfo] = useRecoilState(liquidityInfo)

    // const [lpInfo, setLpInfo] = useState({
    //     totalCurrentSupply: 0,
    //     list: []
    // })
    // const [loading, setLoading] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState(delay)

    const refresh = async () => {

        try{
            const swapPairsData = await iostApi.getSwapPairs();

            const result = await Promise.all([
                iostApi.getSwapPairs(),
                openApi.getIostContract()
            ])

            console.log({result})

            let temp_pairsData = result[0]//swapPairsData;

            let totalCurrentSupply = 0;
            const res = await temp_pairsData.map(async (item, idx) => {

                // 해당 pair의 lpTokenName 가져오기
                const lpTokenName = await iostApi.getLpTokenName(item);
                // console.log({lpTokenName});

                // lpToken의 현재 발행량 가져오기
                const currentSupply = await iostApi.getTokenCurrentSupply(lpTokenName);
                // console.log({currentSupply});

                totalCurrentSupply += currentSupply

                return iostApi.getAmountData(item).then(async(res)=>{
                    return {"idx":idx+1,"swapPairKey":item,"amountData":JSON.stringify(res), "lpTokenName":lpTokenName, "currentSupply":currentSupply};
                });
            });
            const dataResult = await Promise.all(res);

            const newLpInfo = {
                totalCurrentSupply: totalCurrentSupply,
                timesOfCall: result[1].total,
                list: dataResult,
                loading: false
            }

            console.log({newLpInfo})

            setLpInfo(newLpInfo)
        }catch (err) {

        }


    }

    useEffect(() => {
        refresh()


        // openApi.getIostContract(1,1).then(result => console.log({result}))

        // axios.get(`https://www.iostabc.com/api/contract/ContractL3GFG4Wo5XmpUpoJ8LctTA3VFbwTi9x9AEWDKNzg1VR/actions?page=1&size=50`).then(result => console.log({result}))

    }, [])

    return {lpInfo, setRefreshInterval}
};

export default useLpInfo;
