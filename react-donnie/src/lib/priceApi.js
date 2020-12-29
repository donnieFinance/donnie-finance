import axios from 'axios'
import properties from "~/properties";


// IOST USD - 코인마켓캡에서 가격 가져오기.
export const getIOSTUsd = (id) => axios(properties.restAPIHost + '/getCmcPrice', { method: "get", params:{id}, withCredentials: true, credentials: 'same-origin' })

// Dony USD - 코인원에서 Don 가격 USD로 가져오기. (USD는 별도 table로 환율관리)
export const getDonUsd = () => axios(properties.restAPIHost + '/getDonPrice', { method: "get", withCredentials: true, credentials: 'same-origin' })


export default {
    getIOSTUsd,
    getDonUsd
}