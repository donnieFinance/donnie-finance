import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import BigNumber from 'bignumber.js'
import properties from "~/properties";
import useInterval from "~/hooks/useInterval";
import {useRecoilState} from "recoil";
import {usdPriceState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";

// contract 정보 (iost 및 don)
const contractList = properties.contractList;

const calcAPR = (symbol, total, dony, usd) => {
    //console.slog('calcAPR:' + symbol + ',' + total+ ',' + dony+ ',' + usd)
    return (((symbol / (total < 1 ? 1 : total) * dony) * 360 * 24 * 60 * 60) / usd) * 100;
}

//현재 사용하지 않음
const useCoin = (uniqueKey
                 //{pool, tokenName, startTime, img}
) => {

    const {pool, tokenName, img} = contractList[uniqueKey]
    const [usdPrice] = useRecoilState(usdPriceState)

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
    const [checkUsdInterval, setCheckUsdInterval] = useState(100)

    useEffect(() => {
        //캐시된 시간이 1시간 이전이면.. 기본값을 캐시데이터로 우선시함
        if (ComUtil.isCached()){
            const cachedData = localStorage.getItem('coin')
            if (cachedData) {

                //에러가 났을경우 아무행동을 하지 않게끔 함, 대신 다음 인터벌에서 알아서 localStorage 값이 업데이트 됨(정상적으로)
                try{
                    const cachedCoin = JSON.parse(cachedData)[uniqueKey]
                    if (cachedCoin) {
                        setState({
                            ...cachedCoin,
                            loading: false
                        })
                    }
                }catch (err) {
                }
            }
        }
    }, [])


    //usdPrice 가 조회 될때까지 확인해서 조회가 되면 코인을 3초마다 갱신 하도록 함
    useInterval(() => {
        if (usdPrice) {
            //최초 갱신
            search()
            // console.log(`==============useCoin [${uniqueKey}] 최초 호출===============`)

            //현재 인터벌 종료
            setCheckUsdInterval(null)

            //앞으로 3초마다 갱신
            setRefreshInterval(3000)
        }
    }, checkUsdInterval)

    //3초마다 갱신
    useInterval(async() => {
        if (usdPrice)
            search()
        // console.log(`==============useCoin [${uniqueKey}] 3초마다 호출===============`)
    }, refreshInterval);


    const search = async () => {
        // const res = await Promise.all([
        //     ,
        //     // getCoinUsdPrice(),
        //     // getDonUsdPrice(),
        //     // iostApi.getPoolIsOpen(pool) //컨트랙트가 열려 있는지 여부 //null
        // ])

        const total = await getTotalSupply();

        if (total === null) {
            return
        }


        let usd;
        let dony;
        let isOpen;

        try{
            usd = (tokenName && usdPrice[tokenName]) ? usdPrice[tokenName] : properties.USD_PRICE[tokenName]//res[1]
            dony = usdPrice['don']
            isOpen = true//(res[3] === 'true')
        }catch (err){
            usd = properties.USD_PRICE[tokenName]
            dony = properties.USD_PRICE['don']
            isOpen = true//(res[3] === 'true')
        }
        // const total = res[0]
        // const usd = (tokenName && usdPrice[tokenName]) ? usdPrice[tokenName] : properties.USD_PRICE[tokenName]//res[1]
        // const dony = usdPrice['don']
        // const isOpen = true//(res[3] === 'true')

        const rate = await getRewardRate({total, usd, dony})


        let totalBalance;

        if (typeof (total) === 'number' && typeof (usd) === 'number') {
            totalBalance = new BigNumber(total).times(usd).toNumber();
        }

        // console.info({total,usd,dony, isOpen, rate})

        const newState = {
            ...state,
            total, usd, dony, isOpen, rate, totalBalance,
            loading: false
        }

        setState(newState)

        //캐싱할 정보 저장
        setCachedData(newState)
        // try{
        //     //캐싱할 정보 저장
        //     let cachedData = localStorage.getItem('coin') ? JSON.parse(localStorage.getItem('coin')) : {}
        //     cachedData[uniqueKey] = newState
        //
        //     localStorage.setItem('coin', JSON.stringify(cachedData))
        // }catch (err) {
        //     localStorage.removeItem('coin')
        //
        // }
    }

    const setCachedData = (newState) => {
        try{
            //캐싱할 정보 저장
            let cachedData = localStorage.getItem('coin') ? JSON.parse(localStorage.getItem('coin')) : {}
            cachedData[uniqueKey] = newState
            localStorage.setItem('coin', JSON.stringify(cachedData))
        }catch (err) {
            localStorage.removeItem('coin')
            let cachedData = {
                [uniqueKey]: newState
            }
            localStorage.setItem('coin', JSON.stringify(cachedData))
        }
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

    const parseUsdPrice = async (coinUsdPrice) => {
        //let coinUsdPrice = 0.03; //default value, in case of error.
        // let coinUsdPrice = properties.USD_PRICE[tokenName];
        //alert(tokenName);
        try {
            //let {data: res} = await priceApi.getCmcUsd(2405);
            // let {data: coinUsdPrice} = await priceApi.getCoinUsdPrice(tokenName);
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

    const getCoinUsdPrice = async () => {
        //let coinUsdPrice = 0.03; //default value, in case of error.
        let coinUsdPrice = properties.USD_PRICE[tokenName];
        //alert(tokenName);
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
                // console.log({donUsdPrice})
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



    return [state, search, setRefreshInterval]
};


export default useCoin;
