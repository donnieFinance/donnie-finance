import React, {useEffect} from 'react';
import {useRecoilState} from "recoil";
import {usdPriceState} from "~/hooks/atomState";
import useInterval from "~/hooks/useInterval";
import ComUtil from "~/util/ComUtil";
import priceApi, {getAllCoinUsdPrice} from "~/lib/priceApi";
import properties from "~/properties";
import BigNumber from "bignumber.js";


const useUsdPrice = (props) => {
    const [usdPrice, setUsdPrice] = useRecoilState(usdPriceState)

    useEffect(() => {
        updateUsdPrice()
    }, [])

    const updateUsdPrice = async () => {

        let newUsdPrice;

        //한번도 조회되지 않았다면 기본 데이터 세팅 (테스트 토큰 USD + 프로덕션 토큰USD)
        if (!usdPrice) {
            newUsdPrice = {
                ...properties.USD_PRICE
            }
        }
        //한번이라도 조회 되었다면, 마지막 조회된 리코일 스테이트를 넣어줌
        else {
            newUsdPrice = {
                ...usdPrice
            }
        }

        try{

            const {data} = await getAllCoinUsdPrice()

            // console.log({newUsdPrice})

            //DB값을 머지 (sync)
            Object.keys(data).map(key => {
                const _usdPrice = parseUsdPrice(data[key])
                if (_usdPrice) {
                    newUsdPrice[key] = _usdPrice //parsing 된 값이 null 이면 리코일의 이전값 그대로 넣어준다
                }
            })
        }catch (err){
            console.error(err)
            console.slog({errorForcedUsdPrice: newUsdPrice})
            // setUsdPrice(newUsdPrice)
        }

        setUsdPrice(newUsdPrice)
    }

    useInterval(() => {
        updateUsdPrice()
    }, 1000 * 60)

    const parseUsdPrice = (coinUsdPrice) => {
        try {
            if (coinUsdPrice && !isNaN(coinUsdPrice)) {
                coinUsdPrice = parseFloat(coinUsdPrice);
                return new BigNumber(coinUsdPrice).toNumber()
            }

        }catch (error) {
            console.log(error);
            return null;
        }
        return null
    }

    return {
        usdPrice
    }
};

export default useUsdPrice;