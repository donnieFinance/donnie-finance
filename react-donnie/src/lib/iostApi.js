import axios from 'axios'
import properties from "~/properties";


//my address, tokenName
export const getTokenBalance = async ({address, tokenName}) => {
    return new Promise(( resolve => {
        if(window.IWalletJS && window.IWalletJS.account && window.IWalletJS.account.name && address) {
            const iost = window.IWalletJS.newIOST(window.IOST);
            const iostHost = iost.currentRPC._provider._host;

            axios.get(iostHost + "/getTokenBalance/" + address + "/" + tokenName + "/1").then(({data}) => {
                console.log("getTokenBalance======999=======",data)
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
        const tempIost = window.IWalletJS.newIOST(window.IOST);
        const iostHost = tempIost.currentRPC._provider._host;
        let res = await axios.post(iostHost + "/getBatchContractStorage", {
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


export default {
    getTokenBalance,
    getPoolIsOpen,
    getPoolStartTime,
    getPoolTotalSupply,
    getPoolRewardRate,
    getTradeBalanceAll
}