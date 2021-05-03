import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import useInterval from "~/hooks/useInterval";
import {useRecoilState} from "recoil";
import {swapPairsState} from "~/hooks/atomState";

const useSwapPairs = (props) => {
    const [swapPairs, setSwapPairs] = useRecoilState(swapPairsState)
    useEffect(() => {
        refresh()
    }, [])

    //refresh 하기위해 나중에 주석 풀 것
    useInterval(() => {
        refresh()
    }, 10000)

    const refresh = async () => {
        const pairNames = await getSwapPairNames()
        const promises = pairNames && pairNames.map(pairName => getSwapPairAmounts(pairName))
        const res = await Promise.all(promises)
        // console.log('============================[useSwapPairs]==============================')
        // console.log({pairNames, res})

        setSwapPairs(res)
    }

    const getSwapPairNames = async () => {
        return await iostApi.getSwapPairs()
    }

    const getSwapPairAmounts = async (pairKey) => {
        const amountData = await iostApi.getAmountData(pairKey)
        amountData.pairKey = pairKey
        return amountData
    }

    return {swapPairs, refresh}
};

export default useSwapPairs;
