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

// erc Don 출금 WithdrawSequence 조회
const getErcDonMaxWithdrawSequence  = () => axios(properties.restAPIHost + '/getErcDonMaxWithdrawSequence', { method: "get", withCredentials: true, credentials: 'same-origin' })

//iw용
const iwErcDepositSwap = (iwTokenName, eth, erc) => axiosSecure(properties.restAPIHost + '/iwErcDepositSwap', {method: "get", params: {iwTokenName:iwTokenName, eth:eth, erc:erc },  withCredentials: true, credentials: 'same-origin'})
const getDonManagerIGas = () => axiosSecure(properties.restAPIHost + '/getDonManagerIGas', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getDonManagerIRam = () => axiosSecure(properties.restAPIHost + '/getDonManagerIRam', {method: "get", withCredentials: true, credentials: 'same-origin'})
const updateUserApproveOk = (iwTokenName, iwSwapDepositNo) => axiosSecure(properties.restAPIHost + '/updateUserApproveOk', {method: "post", params: {iwTokenName:iwTokenName, iwSwapDepositNo:iwSwapDepositNo},  withCredentials: true, credentials: 'same-origin'})
const manualErcApprove = (iwTokenName, iwSwapDepositNo) => axiosSecure(properties.restAPIHost + '/manualErcApprove', {method: "post", params: {iwTokenName:iwTokenName, iwSwapDepositNo:iwSwapDepositNo},  withCredentials: true, credentials: 'same-origin'})
const approveErcCancelManually = (iwTokenName, iwSwapDepositNo, nonce) => axiosSecure(properties.restAPIHost + '/approveErcCancelManually', {method: "post", params: {iwTokenName:iwTokenName, iwSwapDepositNo:iwSwapDepositNo, nonce:nonce},  withCredentials: true, credentials: 'same-origin'})
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

//////bnb용
const getBnbManagerAccount = () => axiosSecure(properties.restAPIHost + '/getBnbManagerAccount', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBnbManagerBalance = () => axiosSecure(properties.restAPIHost + '/getBnbManagerBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getBnbGasPrice = () => axiosSecure(properties.restAPIHost + '/getBnbGasPrice', {method: "get", withCredentials: true, credentials: 'same-origin'})
const bnbDepositSwap = () => axiosSecure(properties.restAPIHost + '/bnbDepositSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const manualBnbDeposit = (depositNo) => axiosSecure(properties.restAPIHost + '/manualBnbDeposit', {method: "post", params: {depositNo:depositNo},  withCredentials: true, credentials: 'same-origin'})
  //출금 const bnbWithdrawSwap = () => axiosSecure(properties.restAPIHost + '/bnbWithdrawSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const updateBnbSwapDepositFinished = (swapBnbNo) => axiosSecure(properties.restAPIHost + '/updateBnbSwapDepositFinished', {method: "post", params: {swapBnbNo:swapBnbNo},  withCredentials: true, credentials: 'same-origin'})
const getBep20BNBBalance = (bep20Account) => axios(properties.restAPIHost + '/getBep20BNBBalance', { method: "post", params: {bep20Account},withCredentials: true, credentials: 'same-origin' })
  // bnb 수동 전송 관련 (출금) [셀안의기능]
const sendUserBnbToExtAccount = ({withdrawSeq, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserBnbToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})


//////avax용
const getAvaxManagerAccount = () => axiosSecure(properties.restAPIHost + '/getAvaxManagerAccount', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getAvaxManagerBalance = () => axiosSecure(properties.restAPIHost + '/getAvaxManagerBalance', {method: "get", withCredentials: true, credentials: 'same-origin'})
const getAvaxGasPrice = () => axiosSecure(properties.restAPIHost + '/getAvaxGasPrice', {method: "get", withCredentials: true, credentials: 'same-origin'})
const avaxDepositSwap = () => axiosSecure(properties.restAPIHost + '/avaxDepositSwap', {method: "get", withCredentials: true, credentials: 'same-origin'})
const manualAvaxDeposit = (depositNo) => axiosSecure(properties.restAPIHost + '/manualAvaxDeposit', {method: "post", params: {depositNo:depositNo},  withCredentials: true, credentials: 'same-origin'})
const updateAvaxSwapDepositFinished = (swapAvaxNo) => axiosSecure(properties.restAPIHost + '/updateAvaxwapDepositFinished', {method: "post", params: {swapAvaxNo:swapAvaxNo},  withCredentials: true, credentials: 'same-origin'})
const getCchainAVAXBalance = (cchainAccount) => axios(properties.restAPIHost + '/getCchainAVAXBalance', { method: "post", params: {cchainAccount},withCredentials: true, credentials: 'same-origin' })
// bnb 수동 전송 관련 (출금) [셀안의기능]
const sendUserAvaxToExtAccount = ({withdrawSeq, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserAvaxToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})


//ido용
const getIdoManagerBalance = (idoTokenName) => axiosSecure(properties.restAPIHost + '/getIdoManagerBalance', {method: "get", params: {idoTokenName:idoTokenName}, withCredentials: true, credentials: 'same-origin'})

// don 수동 전송 관련 (출금) [셀안의기능]
const sendUserErcDonToExtAccount = ({withdrawSeq, receiverAddr, tokenAmount}) => axiosSecure(properties.restAPIHost + '/sendUserErcDonToExtAccount', {method: "post", params: {withdrawSeq:withdrawSeq, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})

// iw, bnb 모두 사용가능 (수동전송) [최상단 기능]
const sendUserIwErcToExtAccountManual = (withdrawSeq, iwTokenName) => axiosSecure(properties.restAPIHost + '/sendUserIwErcToExtAccountManual', {method: "post", params: {withdrawSeq:withdrawSeq, iwTokenName:iwTokenName}, withCredentials: true, credentials: 'same-origin'})
// don 수동 전송 [최상단 기능]
const sendUserErcDonToExtAccountManual = (withdrawSeq) => axiosSecure(properties.restAPIHost + '/sendUserErcDonToExtAccountManual', {method: "post", params: {withdrawSeq:withdrawSeq}, withCredentials: true, credentials: 'same-origin'})


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


//set exchange contract history
const setExContractHistory = (pageNo) => axios(properties.restAPIHost + '/setExContractHistory', { method: "post", params: {pageNo:pageNo}, withCredentials: true, credentials: 'same-origin' })
//exchange contract history list
const getExContractHistory = ({year}) => axios(properties.restAPIHost + '/exContractHistory', { method: "get", params:{year:year}, withCredentials: true, credentials: 'same-origin' })


const getIdoList = () => axios(properties.restAPIHost + '/idoList', { method: "get", withCredentials: true, credentials: 'same-origin' })
const getIdoWhiteList = (idoId) => axios(properties.restAPIHost + '/idoWhiteList', { method: "get", params:{idoId:idoId}, withCredentials: true, credentials: 'same-origin' })
const getIdo = (idoId) => axios(properties.restAPIHost + '/ido', { method: "get", params:{idoId:idoId}, withCredentials: true, credentials: 'same-origin' })
const setIdo = (data) => axios(properties.restAPIHost + '/ido', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
const setIdoDrawWhitelistTask = (idoId) => axios(properties.restAPIHost + '/idoDrawWhitelistTask', { method: "post", params: {idoId:idoId}, withCredentials: true, credentials: 'same-origin' })
const setIdoWhitelistKYCApply = (idoId, account) => axios(properties.restAPIHost + '/idoWhitelistKYCApply', { method: "post", params: {idoId:idoId,account:account}, withCredentials: true, credentials: 'same-origin' })
const retryContractKycAuth = (idoId, account) => axios(properties.restAPIHost + '/retryContractKycAuth', { method: "post", params: {idoId:idoId,account:account}, withCredentials: true, credentials: 'same-origin' })

const setIdoWhitelistKYCApplyNot = (idoId, account, kycReason) => axios(properties.restAPIHost + '/idoWhitelistKYCApplyNot', { method: "post", params: {idoId:idoId,account:account,kycReason:kycReason}, withCredentials: true, credentials: 'same-origin' })
// ido whitelist 추첨 종료
const finishDrawWhitelist = (idoId) => axios(properties.restAPIHost + '/finishDrawWhitelist', { method: "post", params: {idoId:idoId}, withCredentials: true, credentials: 'same-origin' })

// ido Token claim 가능하도록 설정
const setClaimTokenStatus = (idoId) => axios(properties.restAPIHost + '/setClaimTokenStatus', { method: "post", params: {idoId:idoId, status:true}, withCredentials: true, credentials: 'same-origin' })

// ido Token claim 가능여부 확인
const checkClaimToken = (idoId) => axios(properties.restAPIHost + '/checkClaimToken', { method: "get", params:{idoId:idoId}, withCredentials: true, credentials: 'same-origin' })


//idoERC관련함수
const getManagerIdoErcBalance = (iwTokenName) => axios(properties.restAPIHost + '/getManagerIdoErcBalance', {method: "get", params: {iwTokenName:iwTokenName}, withCredentials: true, credentials: 'same-origin'})
const idoErcDepositSwap = (iwTokenName, eth, idoErc) => axios(properties.restAPIHost + '/idoErcDepositSwap', {method: "get", params: {iwTokenName:iwTokenName, eth:eth, idoErc:idoErc},  withCredentials: true, credentials: 'same-origin'})
const updateIdoErcSwapFinished = (iwTokenName, swapErcToIrcNo) => axios(properties.restAPIHost + '/updateIdoErcSwapFinished', {method: "post", params: {iwTokenName:iwTokenName, swapErcToIrcNo:swapErcToIrcNo},  withCredentials: true, credentials: 'same-origin'})
const issueIdoIrcToUser = ({swapErcToIrcNo, iwTokenName, ircAccount, ercTokenAmount}) => axiosSecure(properties.restAPIHost + '/issueIdoIrcToUser', {method: "post", params: {swapErcToIrcNo:swapErcToIrcNo, iwTokenName:iwTokenName, ircAccount:ircAccount, ercTokenAmount:ercTokenAmount}, withCredentials: true, credentials: 'same-origin'})

 //idoErc-출금
const idoErcWidthdrawSwap = (iwTokenName) => axios(properties.restAPIHost + '/idoErcWidthdrawSwap', {method: "get", params: {iwTokenName:iwTokenName},withCredentials: true, credentials: 'same-origin'})
const sendUserIdoErcToExtAccountManual = (iwTokenName, withdrawSeq) => axios(properties.restAPIHost + '/sendUserIdoErcToExtAccountManual', {method: "post", params: {iwTokenName:iwTokenName, withdrawSeq:withdrawSeq}, withCredentials: true, credentials: 'same-origin'})
const sendUserIdoErcToExtAccount = ({iwTokenName, withdrawSeq, receiverAddr, tokenAmount}) => axios(properties.restAPIHost + '/sendUserIdoErcToExtAccount', {method: "post", params: {iwTokenName:iwTokenName, withdrawSeq:withdrawSeq, receiverAddr:receiverAddr, tokenAmount:tokenAmount}, withCredentials: true, credentials: 'same-origin'})



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

    //idoERC관련
    getManagerIdoErcBalance,    //copy getManagerDonBalance
    idoErcDepositSwap,          //copy ercDonDepositSwap
    updateIdoErcSwapFinished,   //copy from updateErcSwapFinished
    issueIdoIrcToUser,          //copy from issueIwIrcToUser

    //idoErc-출금.
    idoErcWidthdrawSwap,              //copy from ercDonWidthdrawSwap,
    sendUserIdoErcToExtAccountManual, //copy from sendUserErcDonToExtAccountManual,
    sendUserIdoErcToExtAccount,


    iwErcDepositSwap,
    getDonManagerIGas,
    getDonManagerIRam,
    updateUserApproveOk,
    iwIrcWithdrawSwap,
    getIwErcTokenApproved,
    manualErcApprove,
    approveErcCancelManually,

    sendUserIwErcToExtAccount,
    sendUserIwErcToExtAccountManual,
    getIwTokenContractId,
    iwErcAccountWeiRetrieval,
    issueIwIrcToUser,
    issueIwIrcToUserFinish,

    getIdoManagerBalance,

    //BNB
    getBnbManagerAccount, getBnbManagerBalance, getBnbGasPrice,
    bnbDepositSwap,manualBnbDeposit,
    updateBnbSwapDepositFinished,
    getBep20BNBBalance,
    sendUserBnbToExtAccount,

    //Avax
    getAvaxManagerAccount, getAvaxManagerBalance, getAvaxGasPrice, avaxDepositSwap,manualAvaxDeposit,
    updateAvaxSwapDepositFinished, getCchainAVAXBalance, sendUserAvaxToExtAccount,


    getIwSwapTotalAmount,
    getIwMaxWithdrawSequence,
    manualApprove0x34,

    setExContractHistory, getExContractHistory,

    getIdoList, getIdoWhiteList, getIdo, setIdo, setIdoDrawWhitelistTask, setIdoWhitelistKYCApply, finishDrawWhitelist, setIdoWhitelistKYCApplyNot,
    retryContractKycAuth,
    setClaimTokenStatus, checkClaimToken,

    getErcDonMaxWithdrawSequence,
    sendUserErcDonToExtAccount,
    sendUserErcDonToExtAccountManual,
}