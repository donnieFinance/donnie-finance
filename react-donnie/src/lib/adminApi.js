import axios from 'axios'
import axiosSecure from './axiosSecure'
import properties from "~/properties";

const ercDonDepositSwap = (eth, don) => axiosSecure(properties.restAPIHost + '/ercDonDepositSwap', {method: "get", params: {eth:eth, don:don},  withCredentials: true, credentials: 'same-origin'})
const ercDonWidthdrawSwap = () => axiosSecure(properties.restAPIHost + '/ercDonWithdrawSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBalanceOfManagerIrc = () => axiosSecure(properties.restAPIHost + '/getBalanceOfManagerIrc', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerDonBalance = () => axiosSecure(properties.restAPIHost + '/getManagerDonBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerEthBalance = () => axiosSecure(properties.restAPIHost + '/getManagerEthBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerIGas = () => axiosSecure(properties.restAPIHost + '/getManagerIGas', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getManagerIRam = () => axiosSecure(properties.restAPIHost + '/getManagerIRam', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getSwapManagerAccount = () => axiosSecure(properties.restAPIHost + '/getSwapManagerAccount', {method: "get", withCredentials: true, credentials: 'same-origin'})
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
const iwIrcWithdrawSwap = (iwTokenName) => axiosSecure(properties.restAPIHost + '/iwIrcWithdrawSwap', {method: "get", params: {iwTokenName:iwTokenName},  withCredentials: true, credentials: 'same-origin'})
const getIwErcTokenApproved = (iwTokenName, ownerIrcAccount) => axiosSecure(properties.restAPIHost + '/iwErcTokenAllowance', {method: "get", params: {iwTokenName:iwTokenName, ownerIrcAccount:ownerIrcAccount},  withCredentials: true, credentials: 'same-origin'})
// iw 수동 전송 관련 (입금)
const issueIwIrcToUser = ({iwSwapDepositNo, iwTokenName, ircAccount, ercTokenAmount}) => axiosSecure(properties.restAPIHost + '/issueIwIrcToUser', {method: "post", params: {iwSwapDepositNo:iwSwapDepositNo, iwTokenName:iwTokenName, ircAccount:ircAccount, ercTokenAmount:ercTokenAmount}, withCredentials: true, credentials: 'same-origin'})
// iw 수동 전송 관련 (출금)
const sendUserIwErcToExtAccount = ({withdrawSeq, iwTokenName, ownerIrcAccount, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserIwErcToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, iwTokenName:iwTokenName, ownerIrcAccount:ownerIrcAccount, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})
const getIwTokenContractId = (iwTokenName) => axiosSecure(properties.restAPIHost + '/getIwTokenContractId', {method: "get", params: {iwTokenName:iwTokenName},  withCredentials: true, credentials: 'same-origin'})

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
    sendUserIwErcToExtAccount,
    getIwTokenContractId,
    issueIwIrcToUser,
}