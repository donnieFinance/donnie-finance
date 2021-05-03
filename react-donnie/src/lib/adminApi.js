import axios from 'axios'
import axiosSecure from './axiosSecure'
import properties from "~/properties";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";

const ercDonDepositSwap = (eth, don) => axiosSecure(properties.restAPIHost + '/ercDonDepositSwap', {method: "get", params: {eth:eth, don:don},  withCredentials: true, credentials: 'same-origin'})
const ercDonWidthdrawSwap = () => axiosSecure(properties.restAPIHost + '/ercDonWithdrawSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBalanceOfManagerIrc = () => axiosSecure(properties.restAPIHost + '/getBalanceOfManagerIrc', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerDonBalance = () => axiosSecure(properties.restAPIHost + '/getManagerDonBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerEthBalance = () => axiosSecure(properties.restAPIHost + '/getManagerEthBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerIGas = () => axiosSecure(properties.restAPIHost + '/getManagerIGas', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerIRam = () => axiosSecure(properties.restAPIHost + '/getManagerIRam', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getSwapManagerAccount= () => axiosSecure(properties.restAPIHost + '/getSwapManagerAccount', {method: "get", withCredentials: true, credentials: 'same-origin'})
const updateErcSwapFinished = (swapErcToIrcNo) => axiosSecure(properties.restAPIHost + '/updateErcSwapFinished', {method: "post", params: {swapErcToIrcNo:swapErcToIrcNo},  withCredentials: true, credentials: 'same-origin'})
//eth & ercToken 잔액 조회
const getEthErcBalance = (ercAccount) => axios(properties.restAPIHost + '/getEthErcBalance', { method: "post", params: {ercAccount},withCredentials: true, credentials: 'same-origin' })
//eth & iwToken 잔액 조회
const getIwEthErcBalance = (iwTokenName, ercAccount) => axios(properties.restAPIHost + '/getIwEthErcBalance', { method: "post", params: {iwTokenName,ercAccount},withCredentials: true, credentials: 'same-origin' })
//eth & Gas 조회
const getEthGasGwei = () => axios(properties.restAPIHost + '/ethGasGwei', { method: "get", withCredentials: true, credentials: 'same-origin' })

//eth fee(21000)수동전송
const sendWeiWithGasPrice = (ercAccount) => axios(properties.restAPIHost + '/swap/sendWeiWithGasPrice', { method: "post", params: {ercAccount},withCredentials: true, credentials: 'same-origin' })
const donErcAccountWeiRetrieval = (ercAccount) => axios(properties.restAPIHost + '/swap/donErcAccountWeiRetrieval', { method: "post", params: {ercAccount},withCredentials: true, credentials: 'same-origin' })

//iw용
const iwErcDepositSwap = (iwTokenName, eth, erc) => axiosSecure(properties.restAPIHost + '/iwErcDepositSwap', {method: "get", params: {iwTokenName:iwTokenName, eth:eth, erc:erc },  withCredentials: true, credentials: 'same-origin'})
const getDonManagerIGas = () => axiosSecure(properties.restAPIHost + '/getDonManagerIGas', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getDonManagerIRam = () => axiosSecure(properties.restAPIHost + '/getDonManagerIRam', {method: "get", withCredentials: true, credentials: 'same-origin'})
const updateUserApproveOk = (iwTokenName, iwSwapDepositNo) => axiosSecure(properties.restAPIHost + '/updateUserApproveOk', {method: "post", params: {iwTokenName:iwTokenName, iwSwapDepositNo:iwSwapDepositNo},  withCredentials: true, credentials: 'same-origin'})
const manualErcApprove = (iwTokenName, iwSwapDepositNo) => axiosSecure(properties.restAPIHost + '/manualErcApprove', {method: "post", params: {iwTokenName:iwTokenName, iwSwapDepositNo:iwSwapDepositNo},  withCredentials: true, credentials: 'same-origin'})
const iwIrcWithdrawSwap = (iwTokenName) => axiosSecure(properties.restAPIHost + '/iwIrcWithdrawSwap', {method: "get", params: {iwTokenName:iwTokenName},  withCredentials: true, credentials: 'same-origin'})
const getIwErcTokenApproved = (iwTokenName, ownerIrcAccount) => axiosSecure(properties.restAPIHost + '/iwErcTokenAllowance', {method: "get", params: {iwTokenName:iwTokenName, ownerIrcAccount:ownerIrcAccount},  withCredentials: true, credentials: 'same-origin'})
// iw의 출금 WithdrawSequence 조회
const getIwMaxWithdrawSequence  = (iwTokenName) => axios(properties.restAPIHost + '/getIwMaxWithdrawSequence', { method: "get", params: {iwTokenName},withCredentials: true, credentials: 'same-origin' })

// iw 수동 전송 관련 (입금)
const iwErcAccountWeiRetrieval = (iwTokenName, ercAccount) => axios(properties.restAPIHost + '/swap/iwErcAccountWeiRetrieval', { method: "post", params: {iwTokenName:iwTokenName, ercAccount:ercAccount},withCredentials: true, credentials: 'same-origin' })

const issueIwIrcToUser = ({iwSwapDepositNo, iwTokenName, ircAccount, ercTokenAmount}) => axiosSecure(properties.restAPIHost + '/issueIwIrcToUser', {method: "post", params: {iwSwapDepositNo:iwSwapDepositNo, iwTokenName:iwTokenName, ircAccount:ircAccount, ercTokenAmount:ercTokenAmount}, withCredentials: true, credentials: 'same-origin'})
const issueIwIrcToUserFinish = ({iwSwapDepositNo, iwTokenName, ircAccount}) => axiosSecure(properties.restAPIHost + '/issueIwIrcToUserFinish', {method: "post", params: {iwSwapDepositNo:iwSwapDepositNo, iwTokenName:iwTokenName, ircAccount:ircAccount}, withCredentials: true, credentials: 'same-origin'})

// iw 수동 전송 관련 (출금)
const sendUserIwErcToExtAccount = ({withdrawSeq, iwTokenName, ownerIrcAccount, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserIwErcToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, iwTokenName:iwTokenName, ownerIrcAccount:ownerIrcAccount, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})
const getIwTokenContractId = (iwTokenName) => axiosSecure(properties.restAPIHost + '/getIwTokenContractId', {method: "get", params: {iwTokenName:iwTokenName},  withCredentials: true, credentials: 'same-origin'})

//bnb용
const getBnbManagerAccount = () => axiosSecure(properties.restAPIHost + '/getBnbManagerAccount', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBnbManagerBalance = () => axiosSecure(properties.restAPIHost + '/getBnbManagerBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBnbGasPrice = () => axiosSecure(properties.restAPIHost + '/getBnbGasPrice', {method: "get", withCredentials: true, credentials: 'same-origin'})
const bnbDepositSwap = () => axiosSecure(properties.restAPIHost + '/bnbDepositSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
// const bnbWithdrawSwap = () => axiosSecure(properties.restAPIHost + '/bnbWithdrawSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const updateBnbSwapDepositFinished = (swapBnbNo) => axiosSecure(properties.restAPIHost + '/updateBnbSwapDepositFinished', {method: "post", params: {swapBnbNo:swapBnbNo},  withCredentials: true, credentials: 'same-origin'})
const getBep20BNBBalance = (bep20Account) => axios(properties.restAPIHost + '/getBep20BNBBalance', { method: "post", params: {bep20Account},withCredentials: true, credentials: 'same-origin' })
// bnb 수동 전송 관련 (출금)
const sendUserBnbToExtAccount = ({withdrawSeq, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserBnbToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})

// iw, bnb 모두 사용가능
const sendUserIwErcToExtAccountManual = (withdrawSeq, iwTokenName) => axiosSecure(properties.restAPIHost + '/sendUserIwErcToExtAccountManual', {method: "post", params: {withdrawSeq:withdrawSeq, iwTokenName:iwTokenName}, withCredentials: true, credentials: 'same-origin'})
// const getIwSwapTotalAmount = (iwTokenName, ircAccount) => axiosSecure(properties.restAPIHost + '/getIwSwapTotalAmount', {method: "post", params: {iwTokenName:iwTokenName, ircAccount:ircAccount},  withCredentials: true, credentials: 'same-origin'})

const getIwSwapTotalAmount = async (iwTokenName, ircAccount) => {
    const {data} = await axiosSecure(properties.restAPIHost + '/getIwSwapTotalAmount', {method: "post", params: {iwTokenName:iwTokenName, ircAccount:ircAccount},  withCredentials: true, credentials: 'same-origin'})
    let totalDeposit = data.totalDeposit;
    let availableWithdraw = data.availableWithdraw;

    if (iwTokenName === 'iwbly') {
        const destroyAmount = ComUtil.getDestroyBlyAmount(ircAccount)
        totalDeposit = new BigNumber(totalDeposit).minus(destroyAmount).toNumber().toString()
        availableWithdraw = new BigNumber(availableWithdraw).minus(destroyAmount).toNumber().toString()
    }else if (iwTokenName === 'iwbtc') {
        const destroyAmount = ComUtil.getDestroyBtcAmount(ircAccount)
        totalDeposit = new BigNumber(totalDeposit).minus(destroyAmount).toNumber().toString()
        availableWithdraw = new BigNumber(availableWithdraw).minus(destroyAmount).toNumber().toString()
    }

    return {
        data: {
            ...data,
            totalDeposit,
            availableWithdraw
        }
    }
}

const manualApprove0x34 = (iwTokenName, ircAccount) => axiosSecure(properties.restAPIHost + '/manualApprove0x34', {method: "post", params: {iwTokenName:iwTokenName, ircAccount:ircAccount},  withCredentials: true, credentials: 'same-origin'})

export default {
    ercDonDepositSwap,
    ercDonWidthdrawSwap,
    getBalanceOfManagerIrc,
    getManagerDonBalance,
    getManagerEthBalance,
    getManagerIGas,
    getManagerIRam,
    getSwapManagerAccount,
    updateErcSwapFinished,
    getEthErcBalance,
    getIwEthErcBalance,
    getEthGasGwei,
    sendWeiWithGasPrice, donErcAccountWeiRetrieval,

    iwErcDepositSwap,
    getDonManagerIGas,
    getDonManagerIRam,
    updateUserApproveOk,
    iwIrcWithdrawSwap,
    getIwErcTokenApproved,
    manualErcApprove,

    sendUserIwErcToExtAccount,
    sendUserIwErcToExtAccountManual,
    getIwTokenContractId,
    iwErcAccountWeiRetrieval,
    issueIwIrcToUser,
    issueIwIrcToUserFinish,
    getBnbManagerAccount, getBnbManagerBalance, getBnbGasPrice,
    bnbDepositSwap,
    // bnbWithdrawSwap,
    updateBnbSwapDepositFinished,
    getBep20BNBBalance,
    sendUserBnbToExtAccount,
    getIwSwapTotalAmount,
    getIwMaxWithdrawSequence,
    manualApprove0x34
}