import React, {useEffect, useState} from 'react';
import properties from "~/properties";
import BigNumber from "bignumber.js";
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import useInterval from "~/hooks/useInterval";

const useCoinInfo = ({delay = null}) => {
    const [coinInfo, setCoinInfo] = useState({
        totalUsd: 0,
        totalHarvestedDonBalance: 0,
        list: []
    })
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        refresh().then(() => {
            setLoading(false)
        })
    }, [])

    //props 로 delay 가 넘어오면 자동으로 인터벌 수행 하도록 함
    useInterval(() => {
        refresh()
    }, delay)

    const refresh = async () => {

        const coins = []

        const allCoinPromises = Object.keys(properties.contractList).map(uniqueKey => {

            coins.push({uniqueKey: uniqueKey})

            return getCoinInfo(uniqueKey)
        })

        const res = await Promise.all([...allCoinPromises])

        console.log({res})

        // const donUsdPrice = await getDonUsdPrice()

        let totalUsd = 0;
        let totalHarvestedDonBalance = 0;

        res.map((coin, index) => {

            const v_total = coin[0]         //
            const v_usd = coin[1]
            const v_harvestedDonBalance = coin[2]     //현재까지 수확된 토큰수(DON)

            let usd = 0

            if (typeof (v_total) === 'number' && typeof (v_usd) === 'number') {
                usd = new BigNumber(v_total).times(v_usd).toNumber();
            }


            coins[index].total = v_total
            coins[index].usd = usd
            coins[index].harvestedDonBalance = v_harvestedDonBalance

            //합계
            totalUsd = totalUsd + usd
            totalHarvestedDonBalance = totalHarvestedDonBalance + v_harvestedDonBalance;

        })


        console.log({
            totalUsd: totalUsd,                                 //usd 합계
            totalHarvestedDonBalance: totalHarvestedDonBalance, //현재까지 수확된 토큰수 합계(DON)
            list: coins                                         //상세 리스트
        })


        setCoinInfo({
            totalUsd: totalUsd,
            totalHarvestedDonBalance: totalHarvestedDonBalance,
            list: coins
        })

        // setCoins(coins)
        // setTotalUsd(totalUsd)
        //
        // console.log({tokens: coins, totalUsd})
    }

    const getCoinInfo = (uniqueKey) => {
        const contract = properties.contractList[uniqueKey]
        const {tokenName, pool, totalDon} = contract

        return Promise.all([
            getTotalSupply(pool),
            getCoinUsdPrice(tokenName),
            getStakedPoolTokenBalance(pool, tokenName, totalDon)
        ])
        // console.log({getCoinInfo:res})
    }

    const getTotalSupply = async (pool) => {
        const total = await iostApi.getPoolTotalSupply(pool)
        if (total === null) {
            return null
        }

        const totalSupply = isNaN(total) ? 0 : parseFloat(total)
        return totalSupply
    }

    const getCoinUsdPrice = async (tokenName) => {
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

    //풀의 현재까지 수확된 토큰수(DON)
    const getStakedPoolTokenBalance = async (pool, tokenName, totalDon) => {

        //풀이 있을 경우만 계산
        if (pool) {

            //남은 채굴양
            const remainedBalance = await iostApi.getPoolTokenBalance({
                pool: pool,
                tokenName: tokenName
            })

            return totalDon - remainedBalance
        }

        return 0
    }

    return {coinInfo, refresh, loading}

}
export default useCoinInfo