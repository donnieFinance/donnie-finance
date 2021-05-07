import React, {useEffect, useState} from 'react';
import properties from "~/properties";
import BigNumber from "bignumber.js";
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import useInterval from "~/hooks/useInterval";
import {useRecoilState} from "recoil";
import {usdPriceState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";

const useCoinInfo = ({delay = null}) => {

    const [usdPrice] = useRecoilState(usdPriceState)

    const [coinInfo, setCoinInfo] = useState({
        totalUsd: 0,
        totalHarvestedDonBalance: 0,
        list: []
    })

    const [loading, setLoading] = useState(true)
    //usdPrice 가 있는지 확인하기 위한 딜레이
    const [checkUsdInterval, setCheckUsdInterval] = useState(100)
    //얼마 간격으로 갱신할지 딜레이
    const [refreshInterval, setRefreshInterval] = useState(null);

    useEffect(() => {
        //캐시된 시간이 1시간 이전이면.. 기본값을 캐시데이터로 우선시함
        if (ComUtil.isCached()){

            const storageData = localStorage.getItem('coinInfo')
            if (storageData) {

                //에러가 났을경우 아무행동을 하지 않게끔 함, 대신 다음 인터벌에서 알아서 localStorage 값이 업데이트 됨(정상적으로)
                try{

                    const cachedData = JSON.parse(storageData)

                    //밸리데이션 체크
                    if (cachedData.hasOwnProperty('totalUsd') && cachedData.hasOwnProperty('totalHarvestedDonBalance')) {
                        setCoinInfo(cachedData)
                        setLoading(false)
                    }
                }catch (err){
                }
            }
        }
    }, [])

    //usdPrice 가 조회 될때까지 확인해서 조회가 되면 코인을 3초마다 갱신 하도록 함
    useInterval(() => {
        if (usdPrice) {
            //최초 갱신
            refresh().then(() => setLoading(false))

            //현재 인터벌 종료
            setCheckUsdInterval(null)

            //기본 딜레이 : 1분(파라미터가 없을경우)
            const defaultDealy = 1000 * 60

            //앞으로 1분마다 갱신
            setRefreshInterval(delay ? delay : defaultDealy)
        }
    }, checkUsdInterval)

    //1분마다 갱신
    useInterval(async() => {
        refresh()
    }, refreshInterval);

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

            const tempCoin = coins[index]

            tempCoin.total = v_total
            tempCoin.usd =  usd
            tempCoin.harvestedDonBalance = v_harvestedDonBalance

            //합계
            totalUsd = totalUsd + usd
            totalHarvestedDonBalance = totalHarvestedDonBalance + v_harvestedDonBalance;

        })

        const _coinInfo = {
            totalUsd: totalUsd,                                 //usd 합계
            totalHarvestedDonBalance: totalHarvestedDonBalance, //현재까지 수확된 토큰수 합계(DON)
            list: coins                                         //상세 리스트
        }

        // console.log({
        //     totalUsd: totalUsd,                                 //usd 합계
        //     totalHarvestedDonBalance: totalHarvestedDonBalance, //현재까지 수확된 토큰수 합계(DON)
        //     list: coins                                         //상세 리스트
        // })

        setCoinInfo(_coinInfo)

        //캐싱할 정보 저장
        localStorage.setItem('coinInfo', JSON.stringify(_coinInfo))

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

        const totalSupply = isNaN(total) ? 0 : new BigNumber(total).toNumber()
        return totalSupply
    }

    const getCoinUsdPrice = async (tokenName) => {

        return usdPrice[tokenName]

        // let coinUsdPrice = 0.03; //default value, in case of error.
        // try {
        //     //let {data: res} = await priceApi.getCmcUsd(2405);
        //     let {data: coinUsdPrice} = await priceApi.getCoinUsdPrice(tokenName);
        //     if (coinUsdPrice && !isNaN(coinUsdPrice)) {
        //         coinUsdPrice = parseFloat(coinUsdPrice);
        //         return new BigNumber(coinUsdPrice).toNumber()
        //     }
        //
        // }catch (error) {
        //     console.log(error);
        //     return coinUsdPrice;
        // }
        // return coinUsdPrice
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

            return new BigNumber(totalDon).minus(remainedBalance).toNumber()
        }

        return 0
    }

    return {coinInfo, refresh, loading}

}
export default useCoinInfo