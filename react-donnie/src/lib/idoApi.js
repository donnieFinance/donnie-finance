import axios from 'axios'
import axiosSecure from './axiosSecure'
import properties from "~/properties";
import WalletUtil from "~/util/WalletUtil";
import iostApi, {getTradeUserStakeBalance} from "~/lib/iostApi";
import BigNumber from "bignumber.js";

// const getUserWeightedTicket = (idoId, account) => axios(properties.restAPIHost + '/ido/getUserWeightedTicket', { method: "get",  params: {idoId:idoId, account:account}, withCredentials: true, credentials: 'same-origin' })
// const getUserOriginTicket = (idoId, account) => axios(properties.restAPIHost + '/ido/getUserOriginTicket', { method: "get",  params: {idoId:idoId, account:account}, withCredentials: true, credentials: 'same-origin' })
// const checkUserWhiteListed = (idoId, account) => axios(properties.restAPIHost + '/ido/checkUserWhiteListed', { method: "get",  params: {idoId:idoId, account:account}, withCredentials: true, credentials: 'same-origin' })

export const getIdoTicketBalance = async (address) => {
    const myWallet = WalletUtil.getMyWallet();

    let tokenName = 'idoticket';
    if (properties.isTestMode) {
        tokenName = 'idoticket_t';
    }
    return new Promise(( resolve => {
        if(myWallet.wallet && myWallet.address && address) {
            axios.get(properties.IOST_ADDR + "/getTokenBalance/" + address + "/" + tokenName + "/1").then(({data}) => {
                resolve(new BigNumber(data.balance).toString())
            }).catch(err => {
                console.log(err);
                resolve(0)
            })
        }else{
            resolve(0)
        }
    }))
}

export const getIdoTicketPoolLastStakeTime = async (contractPool, address) => {
    try{

        let res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [
                {key: "userlaststake", field:address},
            ],

            by_longest_chain: true
        });

        const balance = res.data.datas[0]

        if (balance === 'null' || Number.isNaN(balance)) {
            return 0;
        }
        return new BigNumber(balance).toNumber()
    }catch (err){
        console.log(err.message)
        return 0
    }
}



export const getUserWeightedTicket = async (whitelistContractId, ircAccount) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: whitelistContractId,
            key_fields: [
                {key: "userWeightedTicket", field:ircAccount},
            ],
            by_longest_chain: true
        });
        console.log(res);
        if(res.data.datas[0] === "null") return null

        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

// 결과값이 0보다 크면 WhiteList 신청한 것
export const getUserOriginTicket = async (whitelistContractId, ircAccount) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: whitelistContractId,
            key_fields: [
                {key: "userTicketBalance", field:ircAccount},
            ],
            by_longest_chain: true
        });
        console.log(res);
        if(res.data.datas[0] === "null") return 0;
        if(res.data.datas[0] !== "null") return parseInt(res.data.datas[0]);
    }catch (err){
        console.log(err.message)
        return null
    }
}

// 결과값이 true이면 whitelist에 뽑힌 것, kyc이면 kyc까지 완료한 user
export const checkUserWhiteListedKyc = async (whitelistContractId, ircAccount) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: whitelistContractId,
            key_fields: [
                {key: "winner_user", field:ircAccount},
            ],
            by_longest_chain: true
        });
        console.log(res);
        if(res.data.datas[0] === "null") return null

        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

// 추첨완료 여부
export const checkDrawFinished = async (whitelistContractId) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: whitelistContractId,
            key_fields: [{key: "draw_finished"}],
            by_longest_chain: true
        });
        console.log(res);
        if(res.data.datas[0] === "null") return null;
        return res.data.datas[0] === "true" ? true:false;
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const buyIdoTicket = async(contractID, amountVal, tokenName) => {
    amountVal = String(amountVal);
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "stake", [
        amountVal
    ]);
    tx.gasLimit = 200000;
    tx.addApprove('iost', amountVal)
    // console.log({contractID:contractID})
    // console.log({tokenName:tokenName})
    if (tokenName !== 'iost') {                //jetstream 때문에 넣음1
        tx.addApprove(tokenName, amountVal)
    }
    tx.amount_limit.push({token: "*", value: "unlimited"});

    const res = await iostApi.signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const withdrawWithTicket = async(contractID, ticketCount) => {
    let amountVal = String(ticketCount);
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "withdrawWithTicket", [
        amountVal
    ]);
    tx.gasLimit = 200000;
    tx.addApprove('iost', amountVal)

    let tokenName = 'idoticket';
    if (properties.isTestMode) {
        tokenName = 'idoticket_t';
    }
    tx.addApprove(tokenName, ticketCount)  //jetstream 때문에 넣음
    // console.log({contractID:contractID})
    // console.log({tokenName:tokenName})
    tx.amount_limit.push({token: "*", value: "unlimited"});

    const res = await iostApi.signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const alreadyIdoBought = async(contractID, ircAccount) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractID,
            key_fields: [
                {key: "userBought", field:ircAccount},
            ],
            by_longest_chain: true
        });
        console.log(res);
        if(res.data.datas[0] === "null") return null

        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getTotalIdoLeft = async (contractPool) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [{key: "totalIdoLeft"}],
            by_longest_chain: true
        });
        if(res.data.datas[0] === "null") return null
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

// 화이트리스트 지원
export const applyWhitelist = async(contractID) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "apply", []);
    // tx.gasLimit = 200000;
    // console.log({contractID:contractID})
    // console.log({tokenName:tokenName})
    const res = await iostApi.signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// IDO 참여
export const buyIdoToken = async(contractID, payToken, idoToken, amountVal) => {
    amountVal = String(amountVal);
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "buy", [
        amountVal
    ]);
    tx.gasLimit = 200000;
    tx.addApprove('iost', amountVal)
    // console.log({contractID:contractID})
    // console.log({tokenName:tokenName})
    if (payToken !== 'iost') {                //jetstream 때문에 넣음1
        tx.addApprove(payToken, amountVal)
    }
    tx.amount_limit.push({token: "*", value: "unlimited"});

    const res = await iostApi.signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// 구매한 token claim 가능한지 여부
export const canClaimToken = async(contractID) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractID,
            key_fields: [{key: "canClaimToken"},],
            by_longest_chain: true
        });
        // console.log("canClaimToken : ", res);
        if(res.data.datas[0] === "null" || res.data.datas[0] === "false") return false
        if(res.data.datas[0] === "true") return true
        return res.data.datas[0];

    }catch (err){
        console.log(err.message)
        return null
    }
}

// 사용자의 ido token claim 여부
export const alreadyClaim = async(contractID, ircAccount) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractID,
            key_fields: [
                {key: "alreadyClaim", field:ircAccount},
            ],
            by_longest_chain: true
        });
        // console.log("alreadyClaim : ", res);
        if(res.data.datas[0] === "null" || res.data.datas[0] === "false") return false
        if(res.data.datas[0] === "true") return true
        return res.data.datas[0];

    }catch (err){
        console.log(err.message)
        return null
    }
}

// ido token 구매한 사람들의 실제 토큰전송
export const claimToken = async(contractID) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "claimToken", []);
    tx.gasLimit = 200000;
    // tx.amount_limit.push({token: "*", value: "unlimited"});

    const res = await iostApi.signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// WhiteList 대상 KYC 신청 등록
export const idoKYCApply = (data) => axiosSecure(properties.restAPIHost + '/kycApply', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

//backend에서 KYC 거절여부 체크
export const backendKycAuthStatus = (idoId, address) => axios(properties.restAPIHost + '/checkKycAuthStatus', { method: "get", params: {idoId:idoId,address:address}, withCredentials: true, credentials: 'same-origin' })

export default {
    getIdoTicketBalance,
    getIdoTicketPoolLastStakeTime,

    getUserWeightedTicket,
    getUserOriginTicket,
    checkUserWhiteListedKyc,
    checkDrawFinished,
    buyIdoTicket, withdrawWithTicket,
    getTotalIdoLeft,

    applyWhitelist,
    alreadyIdoBought,
    buyIdoToken,
    canClaimToken, alreadyClaim, claimToken,

    idoKYCApply,
    backendKycAuthStatus,
}