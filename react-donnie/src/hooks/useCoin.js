import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import BigNumber from 'bignumber.js'
import properties from "~/properties";
import useInterval from "~/hooks/useInterval";

// contract 정보 (iost 및 don)
const contractList = properties.contractList;

const calcAPR = (symbol, total, dony, usd) => {
    return (((symbol / (total < 1 ? 1 : total) * dony) * 360 * 24 * 60 * 60) / usd) * 100;
}

//현재 사용하지 않음
const useCoin = (uniqueKey
                 //{pool, tokenName, startTime, img}
) => {

    const {pool, tokenName, img} = contractList[uniqueKey]

    const [state, setState] = useState(
        {
            pool,
            tokenName,
            img,
            // name: tokenName,
            // img: img,
            startTime: null,
            total: null,
            usd: 0,
            isOpen: true,   //컨트랙트가 열려 있는지 여부
            totalBalance: 0,
            status: null,
            loading: true,
            decimals: 8,
            precision: 8,
            rate: 0,
            dony: 0
        }
    )

    const [refreshInterval, setRefreshInterval] = useState(null);

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const res = await Promise.all([
            getTotalSupply(),
            getCoinUsdPrice(),
            getDonUsdPrice(),
            // iostApi.getPoolIsOpen(pool) //컨트랙트가 열려 있는지 여부 //null
        ])

        console.log({useCoin: res})


        if (res[0] === null) {
            return
        }

        const total = res[0]
        const usd = res[1]
        const dony = res[2]
        const isOpen = true//(res[3] === 'true')

        const rate = await getRewardRate({total, usd, dony})


        let totalBalance;

        if (typeof (total) === 'number' && typeof (usd) === 'number') {
            totalBalance = new BigNumber(total).times(usd).toNumber();
        }

        // console.info({total,usd,dony, isOpen, rate})

        setState({
            ...state,
            total, usd, dony, isOpen, rate, totalBalance,
            loading: false
        })

    }

    const getTotalSupply = async () => {
        const total = await iostApi.getPoolTotalSupply(pool)
        if (total === null) {
            return null
        }

        //TODO 대니 테스트 husd 100000으로 고정
        // if (tokenName === 'husd') {
        //     return 100000
        // }

        const totalSupply = isNaN(total) ? 0 : parseFloat(total)
        return totalSupply
    }

    const getCoinUsdPrice = async () => {
        let coinUsdPrice = 0.03; //default value, in case of error.
        try {
            //let {data: res} = await priceApi.getCmcUsd(2405);
            let {data: coinUsdPrice} = await priceApi.getCoinUsdPrice(tokenName);
            if (coinUsdPrice && !isNaN(coinUsdPrice)) {
                coinUsdPrice = parseFloat(coinUsdPrice);
                return new BigNumber(coinUsdPrice).toNumber()
            }

        }catch (error) {
            console.log(error);
            return coinUsdPrice;
        }
        return coinUsdPrice
    }

    const getDonUsdPrice = async () => {
        let donUsdPrice = 2.5; //2.5달러 기본값
        try {
            let {data:res} = await priceApi.getCoinUsdPrice('don');
            if (res) {
                let tempPrice = res; //data USD parsing
                if (tempPrice && !isNaN(tempPrice)) {
                    donUsdPrice =  parseFloat(tempPrice);
                }
                console.log({donUsdPrice})
                return donUsdPrice;
            }
        } catch (error) {
            console.log(error);
            console.log({catchdonUsdPrice:donUsdPrice})
            return donUsdPrice; //2.5달러 기본값
        }
        return donUsdPrice;
    }

    const getRewardRate = async ({total, usd, dony}) => {
        try{
            const rewardRate = await iostApi.getPoolRewardRate(pool);
            if (rewardRate) {
                return calcAPR(rewardRate, total, dony, usd)
            }
        }
        catch (error) {
            console.log(error);
            return 0
        }

        return 0
    }

    // openTimeInterval
    useInterval(async() => {
        search()
    }, refreshInterval);


    return [state, search, setRefreshInterval]
};


export default useCoin;
