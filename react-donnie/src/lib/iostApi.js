import axios from 'axios'
import properties from "~/properties";
import WalletUtil from "~/util/WalletUtil";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";

const donTokenAddress = properties.address.tokenAddress;
const donTokenName = properties.address.token;

//my address, tokenName
export const getTokenBalance = async ({address, tokenName}) => {
    const myWallet = WalletUtil.getMyWallet();
    return new Promise(( resolve => {
        if(myWallet.wallet && myWallet.address && address) {
            // const iost = myWallet.wallet.newIOST(window.IOST);
            // const iostHost = iost.currentRPC._provider._host;
            axios.get(properties.IOST_ADDR + "/getTokenBalance/" + address + "/" + tokenName + "/1").then(({data}) => {
                // console.log("getTokenBalance======999=======",data)
                resolve(data.balance)
            }).catch(err => {
                console.log(err);
                resolve(0)
            })
        }else{
            resolve(0)
        }
    }))
}

//채굴 남은양
export const getPoolTokenBalance = async ({pool, tokenName}) => {

    let balance = 0;

    try{

        const {data} = await axios.get(properties.IOST_ADDR + "/getTokenBalance/" + pool + "/" + 'don' + "/1")

        if (data) {
            balance = parseFloat(data.balance)

            if(tokenName.startsWith("don")) {
                let totalSupply = await getPoolTotalSupply(pool);
                balance = parseFloat(data.balance) - parseFloat(totalSupply);
            }
        }

    }catch (err){
        console.log(err)
        return 0
    }

    return balance;
}


/* ==== Pool Function - Iost get storage call ==== START */

export const getPoolStartTime = async (contractPool) => {
    try {
        // pool의 startTime을 수정할 때  00testnet.txt 파일 참고해서 콘솔에서 실행가능함.
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [{key: "startTime"}],
            by_longest_chain: true
        });
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getPoolTotalSupply = async (contractPool) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [{key: "totalSupply"}],
            by_longest_chain: true
        });
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getPoolIsOpen = async (contractPool) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [{key: "open"}],
            by_longest_chain: true
        });
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

// export const getPoolIsOpenByName = async (name) => {
//     try {
//
//         const {pool} = properties.contractList[name]
//
//         const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
//             id: pool,
//             key_fields: [{key: "open"}],
//             by_longest_chain: true
//         });
//         return res.data.datas[0];
//     }catch (err){
//         console.log(err.message)
//         return null
//     }
// }


export const getPoolPeriodFinish = async(contractPool) => {
    try {
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [{key: "periodFinish"}],
            by_longest_chain: true
        });
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getPoolRewardRate = async (contractPool) => {
    try{
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id:contractPool,
            key_fields:[{key:"rewardRate"}],
            by_longest_chain:true});
        // console.log("========getRewardRate:");
        // console.log(res);
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}
/* ==== Pool Function - Iost get storage call ==== END */


/* ==== Trade Pool Function - Iost get storage call ==== START */
export const getTradeBalanceAll = async (contractPool, address) => {
    try{
        // const myWallet = WalletUtil.getMyWallet();
        // const tempIost = myWallet.newIOST(window.IOST);
        // const iostHost = tempIost.currentRPC._provider._host;
        let res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [
                {key: "userbalance", field:address},
                {key: "rewardPerToken"},
                {key: "totalSupply"},
                {key: "rewardRate"},
                {key: "periodFinish"},
                {key: "lastUpdate"},
                {key: "userrptp", field:address},
                {key: "userreward", field:address},
                {key: "duration"},

            ],

            by_longest_chain: true
        });
        return res.data.datas;
    }catch (err){
        console.log(err.message)
        return null
    }
}
/* ==== Trade Function - Iost get storage call ==== END */

// user의 irc don를 manager에게 전송
export const onSendIrcDonToManagerBC  = async (address, withdrawAmount, memo) => {
    let amountVal = ComUtil.numToString(new BigNumber(withdrawAmount));
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(donTokenAddress, "transfer", [donTokenName, address, 'donmanager', amountVal, memo]);
    tx.addApprove('iost', amountVal)
    tx.addApprove(donTokenName, amountVal)
    tx.amount_limit.push({token: "*", value: "unlimited"});

    // console.log({tx})

    const res = await signAndSend(tx)
    console.log({signAndSend: res})  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const onWithDrawSendBC = async(gasLimit, contractID, amountVal) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txWithdraw = iost.callABI(contractID, "withdraw", [
        amountVal
    ]);
    txWithdraw.gasLimit = gasLimit;
    // console.log({contractID:contractID})
    txWithdraw.addApprove('iost', amountVal)
    txWithdraw.amount_limit.push({ token: "*", value: "unlimited" });

    const res = await signAndSend(txWithdraw)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const onDepositSendBC = async(gasLimit, contractID, amountVal, tokenName) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(contractID, "stake", [
        amountVal
    ]);
    tx.gasLimit = gasLimit;
    tx.addApprove('iost', amountVal)
    // console.log({contractID:contractID})
    // console.log({tokenName:tokenName})
    if(tokenName !== 'iost') {
        tx.addApprove(tokenName, amountVal)
    }
    tx.amount_limit.push({token: "*", value: "unlimited"});

    const res = await signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const onHarvestSendBC = async(gasLimit, contractID) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txGetReward = iost.callABI(contractID, "getReward", []);
    txGetReward.gasLimit = gasLimit;
    const res = await signAndSend(txGetReward)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

export const onHarvestWithDrawSendBC = async(gasLimit, contractID) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txExit = iost.callABI(contractID, "exit", []);
    txExit.gasLimit = gasLimit;
    const res = await signAndSend(txExit)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// iwWithdraw 출금
export const onIwSwapWithdrawBC = async(gasLimit, contractID, amountStr, ercAccount) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txWithdraw = iost.callABI(contractID, "swapWithdraw", [amountStr.toString(), ercAccount]);
    txWithdraw.gasLimit = gasLimit;
    txWithdraw.amount_limit.push({ token: "*", value: "unlimited" });
    const res = await signAndSend(txWithdraw)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}


const signAndSend = (tx) => new Promise((resolve) => {
    const returnResult = {
        isSuccess: false,
        result: null
    }
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    iost.signAndSend(tx).on("success", (succ) => {
        // window.$message.success('Success');
        returnResult.isSuccess = true;
        returnResult.result = succ;
        resolve(returnResult);

    }).on("failed", (fail) => {

        console.log({fail})
        //errorHandler(fail);
        // window.$message.error('fail');
        returnResult.isSuccess = false;
        returnResult.result = fail;
        resolve(returnResult);
    });

})


export default {
    getTokenBalance,
    getPoolTokenBalance,
    getPoolIsOpen,
    // getPoolIsOpenByName,
    getPoolStartTime,
    getPoolPeriodFinish,
    getPoolTotalSupply,
    getPoolRewardRate,
    getTradeBalanceAll,
    onSendIrcDonToManagerBC,
    onWithDrawSendBC,
    onDepositSendBC,
    onHarvestSendBC,
    onHarvestWithDrawSendBC,
    onIwSwapWithdrawBC
}