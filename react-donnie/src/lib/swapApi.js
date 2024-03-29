import axios from 'axios';
import axiosSecure from './axiosSecure'
import properties from "~/properties";


//swap입금
export const getSwapErcAccount = (ircAccount) => axiosSecure(properties.restAPIHost + '/swap/allocateSwapAccount', { method: "post", params:{ircAccount}, withCredentials: true, credentials: 'same-origin' })
export const updateLastCheckDayErcAccount = (ircAccount, ercAccount) => axiosSecure(properties.restAPIHost + '/swap/updateLastCheckDayErcAccount' , { method: "post", params:{ircAccount, ercAccount}, withCredentials: true, credentials: 'same-origin' })

//swap입금 iwBly용
export const getIwSwapErcAccount = (ircAccount, iwTokenName) => axiosSecure(properties.restAPIHost + '/swap/allocateIwSwapAccount', { method: "post", params:{ircAccount, iwTokenName}, withCredentials: true, credentials: 'same-origin' })
export const updateIwLastCheckDayErcAccount = (ircAccount, ercAccount, iwTokenName) => axiosSecure(properties.restAPIHost + '/swap/updateIwLastCheckDayErcAccount' , { method: "post", params:{ircAccount, ercAccount, iwTokenName}, withCredentials: true, credentials: 'same-origin' })

export const getIwMinimumDeposit = (iwTokenName) => axios(properties.restAPIHost + '/swap/getIwMinimumDeposit', { method: "get", params:{iwTokenName}, withCredentials: true, credentials: 'same-origin' })
export const getIwWithdrawFee = (iwTokenName) => axios(properties.restAPIHost + '/swap/getIwWithdrawFee', { method: "get", params:{iwTokenName}, withCredentials: true, credentials: 'same-origin' })

// swap출금 iwbly용 (iwallet출금완료 후 backend 호출하기)
export const withdrawIwErc = ({iwTokenName, ircAccount}) => axios(properties.restAPIHost + '/swap/iwErcWithdraw', { method: "post", params:{iwTokenName:iwTokenName, ircAccount:ircAccount}, withCredentials: true, credentials: 'same-origin' })

//don swap 출금
//export const swapIrcToErc = (data) => axiosSecure(properties.restAPIHost + '/swap/swapIrcToErc', { method: "post", data:data, withCredentials: true, credentials: 'same-origin'})
export const ercDonWithdraw = (ircAccount) => axios(properties.restAPIHost + '/swap/ercDonWithdraw', { method: "post", params:{ircAccount}, withCredentials: true, credentials: 'same-origin'})
export const getErcDonWithdrawFee = () => axios(properties.restAPIHost + '/swap/getErcDonWithdrawFee', { method: "get", withCredentials: true, credentials: 'same-origin' })

// idoErc 출금
export const idoErcWithdraw = (tokenName, ircAccount) => axios(properties.restAPIHost + '/swap/idoErcWithdraw', { method: "post", params:{tokenName:tokenName, ircAccount:ircAccount}, withCredentials: true, credentials: 'same-origin'})

//export const getNewSwapPassCode =(ircAccount) => axiosSecure(properties.restAPIHost + '/swap/getNewSwapPassCode', { method: "post", params:{ircAccount}, withCredentials: true, credentials: 'same-origin' })
//export const isValidSwapPassCode = (ircAccount, passCode) => axiosSecure(properties.restAPIHost + '/swap/isValidSwapPassCode', { method: "get", params:{ircAccount, passCode}, withCredentials: true, credentials: 'same-origin' })

// bnb입금계좌
export const allocateBnbSwapAccount = (ircAccount) => axiosSecure(properties.restAPIHost + '/swap/allocateBnbSwapAccount', { method: "post", params:{ircAccount}, withCredentials: true, credentials: 'same-origin' })
export const updateLastCheckDayBnbAccount = (ircAccount, ercAccount) => axiosSecure(properties.restAPIHost + '/swap/updateLastCheckDayBnbAccount' , { method: "post", params:{ircAccount, ercAccount}, withCredentials: true, credentials: 'same-origin' })
export const getBnbMinimumDeposit = () => axiosSecure(properties.restAPIHost + '/swap/getBnbMinimumDeposit', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const bnbWithdraw = (ircAccount) => axios(properties.restAPIHost + '/swap/bnbWithdraw', { method: "post", params:{ircAccount:ircAccount}, withCredentials: true, credentials: 'same-origin' })

// avax입금계좌
export const allocateAvaxSwapAccount = (ircAccount) => axiosSecure(properties.restAPIHost + '/swap/allocateAvaxSwapAccount', { method: "post", params:{ircAccount}, withCredentials: true, credentials: 'same-origin' })
export const updateLastCheckDayAvaxAccount = (ircAccount, ercAccount) => axiosSecure(properties.restAPIHost + '/swap/updateLastCheckDayAvaxAccount' , { method: "post", params:{ircAccount, ercAccount}, withCredentials: true, credentials: 'same-origin' })
export const getAvaxMinimumDeposit = () => axiosSecure(properties.restAPIHost + '/swap/getAvaxMinimumDeposit', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const avaxWithdraw = (ircAccount) => axios(properties.restAPIHost + '/swap/avaxWithdraw', { method: "post", params:{ircAccount:ircAccount}, withCredentials: true, credentials: 'same-origin' })


export default {
    getSwapErcAccount,
    updateLastCheckDayErcAccount,

    getIwSwapErcAccount,
    updateIwLastCheckDayErcAccount,

    getIwMinimumDeposit,
    getIwWithdrawFee,

    ercDonWithdraw,
    getErcDonWithdrawFee,
    // getNewSwapPassCode,
    // isValidSwapPassCode,

    withdrawIwErc,
    idoErcWithdraw,

    allocateBnbSwapAccount,
    updateLastCheckDayBnbAccount,
    getBnbMinimumDeposit,
    bnbWithdraw,

    allocateAvaxSwapAccount,
    updateLastCheckDayAvaxAccount,
    getAvaxMinimumDeposit,
    avaxWithdraw,
}