import axios from 'axios'
import properties from "~/properties";


// 코인마켓캡에서 가격 가져오는 API: 코인마켓캡에서 가격 가져오기. - 부하문제로 일단 백엔드 차단 중.
export const getCmcUsd = (id) => axios(properties.restAPIHost + '/getCmcPrice', { method: "get", params:{id}, withCredentials: true, credentials: 'same-origin' })

// IOST USD - 캐시된 IOST가격 가져오기
//미사용 export const getIostUsd = (id) => axios(properties.restAPIHost + '/getIostPrice', { method: "get", withCredentials: true, credentials: 'same-origin' })


// Dony USD - 캐시된 코인원에서 Don 가격 USD로 가져오기. (USD는 별도 table로 환율관리)
//미사용 export const getDonUsd = () => axios(properties.restAPIHost + '/getDonPrice', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 공용 코인명으로 캐시된 코인원에서 USD로 가져오기. (USD는 별도 table로 환율관리)
export const getCoinUsdPrice = (name) => axios(properties.restAPIHost + '/getCoinUsdPrice', { method: "get", params: {name}, withCredentials: true, credentials: 'same-origin' })
//전체 코인 usdPrice 조회
export const getAllCoinUsdPrice = () => axios(properties.restAPIHost + '/getAllCoinUsdPrice', { method: "get", withCredentials: true, credentials: 'same-origin' })

//exchange/swap 즉 DEX용 코인들 donnie current price 조회.
export const getAllDonnieDexPrice = () => axios(properties.restAPIHost + '/getAllDonnieDexPrice', { method: "get", withCredentials: true, credentials: 'same-origin' })


export default {
    getCmcUsd,
    //getIostUsd,
    //getDonUsd,
    getCoinUsdPrice,
    getAllCoinUsdPrice,
    getAllDonnieDexPrice
}