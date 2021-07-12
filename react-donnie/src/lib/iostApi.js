import axios from 'axios'
import properties from "~/properties";
import WalletUtil from "~/util/WalletUtil";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";

const {EXCHANGE_CONTRACT_ID} = properties;

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
                 //console.log("getTokenBalance======999=======",new BigNumber(data.balance).toString())
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

//채굴 남은양
export const getPoolTokenBalance = async ({pool, tokenName}) => {

    let balance = 0;

    try{

        const {data} = await axios.get(properties.IOST_ADDR + "/getTokenBalance/" + pool + "/" + 'don' + "/1")

        if (data) {
            balance = new BigNumber(data.balance).toString();

            if(tokenName === "don") {
                let totalSupply = await getPoolTotalSupply(pool);
                balance = new BigNumber(data.balance).minus(totalSupply).toString();
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

export const getTradeUserStakeBalance = async (contractPool, address) => {
    try{
        // const myWallet = WalletUtil.getMyWallet();
        // const tempIost = myWallet.newIOST(window.IOST);
        // const iostHost = tempIost.currentRPC._provider._host;
        let res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id: contractPool,
            key_fields: [
                {key: "userbalance", field:address},
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

// don ircToErc 출금
export const onErcDonWithdrawBC = async(gasLimit, contractID, amountStr, ercAccount) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txWithdraw = iost.callABI(contractID, "swapWithdraw", [amountStr.toString(), ercAccount]);

    txWithdraw.addApprove('iost', amountStr.toString())
    txWithdraw.addApprove(donTokenName, amountStr.toString()) //jetstream 때문에 넣음

    txWithdraw.gasLimit = gasLimit;
    txWithdraw.amount_limit.push({ token: "*", value: "unlimited" });
    const res = await signAndSend(txWithdraw)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
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
    if(tokenName !== 'iost') {                //jetstream 때문에 넣음1
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
export const onIwSwapWithdrawBC = async(gasLimit, contractID, amountStr, ercAccount, tokenName) => {
    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let txWithdraw = iost.callABI(contractID, "swapWithdraw", [amountStr.toString(), ercAccount]);

    txWithdraw.addApprove('iost', amountStr.toString())
    txWithdraw.addApprove(tokenName, amountStr.toString()) //jetstream 때문에 넣음2

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


/* ==== exchange Function =========== */

// exchange swapToken
//const EXCHANGE_CONTRACT_ID = properties.js getExchangeContractId()로 이동.


export const getLpTokenList = async () => {
    let list = []
    const swapPairsData = await getSwapPairs();
    const promises = swapPairsData.map(async (swapPairKey, i) => {

        const swapSymbol = swapPairKey.split('_');
        const symbol1 = swapSymbol[0];
        const symbol2 = swapSymbol[1];

        const lpTokenName = await getLpTokenName(swapPairKey);
        const dpLpTokenName = ComUtil.getDPLpTokenName(lpTokenName);

        // 전체 토큰 발행량
        const allData = await getAmountData(swapPairKey);

        // lpToken의 현재 발행량 가져오기
        const currentSupply = await getTokenCurrentSupply(lpTokenName);

        console.log("allData===",allData)
        console.log("allData==currentSupply=",currentSupply)

        list.push({
            dpLpTokenName: dpLpTokenName,
            lpTokenName: lpTokenName,
            symbol1: symbol1,
            symbol2: symbol2,
            swapPairKey:swapPairKey,
            currentSupply: currentSupply,
        });

    });
    await Promise.all(promises);
    ComUtil.sortByKey(list, 'dpLpTokenName')
    return list
}

//tokenNames = ['iost', 'don'...]
const getMyStakedBalance = async (tokenName, address) => {

    const contracts = Object.values(properties.contractList).filter(contract =>
        contract.tokenName === tokenName
        // if (contract.tokenName === tokenName) {
        //     list.push(contract.pool)
        // }
    )
    console.log({contracts})

    // contracts.map(contract => )
    const promises = contracts.map(contract => getTradeUserStakeBalance(contract.pool, address))

    const result = await Promise.all(promises)

    let myStakedBalance = 0
    result.map(balance => myStakedBalance += balance)

    return myStakedBalance

    // getTradeUserStakeBalance()
}


// 내 지갑의 LpTokenList
export const getMyLpTokenListInfo = async (address) => {
    if(address) {
        let list = []
        let listDataBalanceChk = 0;
        const swapPairsData = await getSwapPairs();

        const promises = swapPairsData.map(async (swapPairKey, i) => {

            const swapSymbol = swapPairKey.split('_');
            const symbol1 = swapSymbol[0];
            const symbol2 = swapSymbol[1];

            const lpTokenName = await getLpTokenName(swapPairKey);

            // 전체 토큰 발행량
            const allData = await getAmountData(swapPairKey);

            // lpToken의 현재 발행량 가져오기
            const currentSupply = await getTokenCurrentSupply(lpTokenName);

            const {data} = await axios.get(properties.IOST_ADDR + "/getTokenBalance/" + address + "/" + lpTokenName + "/1")

            const dpLpTokenName = ComUtil.getDPLpTokenName(lpTokenName);
            const myBalance = data.balance;
            const myStakedBalance = await getMyStakedBalance(lpTokenName, address);
            const myAllBalance = myBalance + myStakedBalance

            // 전체공급량에서 자기 지분 토큰량 계산(유동성 공급 + 스테이킹)
            const symbol1Balance = new BigNumber(myAllBalance).div(currentSupply).multipliedBy(allData[symbol1]).toFixed(8)
            const symbol2Balance = new BigNumber(myAllBalance).div(currentSupply).multipliedBy(allData[symbol2]).toFixed(8)

            // 내 유동성풀 토큰량
            const myLPSymbol1Balance = new BigNumber(myBalance).div(currentSupply).multipliedBy(allData[symbol1]).toFixed(8)
            const myLPSymbol2Balance = new BigNumber(myBalance).div(currentSupply).multipliedBy(allData[symbol2]).toFixed(8)


            if(myBalance > 0){
                listDataBalanceChk = listDataBalanceChk + 1;
            }
            list.push({
                dpLpTokenName: dpLpTokenName,
                lpTokenName: lpTokenName,
                symbol1: symbol1,
                symbol2: symbol2,
                lpTokenBalance: myBalance,
                symbol1Balance:symbol1Balance,          //나의 total 토큰 지분(유동성 공급 + 스테이킹)
                symbol2Balance:symbol2Balance,          //나의 total 토큰 지분(유동성 공급 + 스테이킹)
                myLPSymbol1Balance: myLPSymbol1Balance, //나의 유동성 공급 토큰 지분
                myLPSymbol2Balance: myLPSymbol2Balance, //나의 유동성 공급 토큰 지분
                symbol1Total:allData[symbol1],
                symbol2Total:allData[symbol2],
                swapPairKey:swapPairKey,
                currentSupply: currentSupply,
                lpTokenBalanceRate: (myAllBalance / currentSupply) * 100,
                myStakedBalance: myStakedBalance
            });

        });
        await Promise.all(promises);
        ComUtil.sortByKey(list, 'dpLpTokenName')
        return list;
    }else{
        return null
    }
}

// 내 지갑의 LpTokenList
export const getMyLpTokenList = async (address) => {
    const myWallet = WalletUtil.getMyWallet();
    if(myWallet.wallet && myWallet.address && address) {
        return getMyLpTokenListInfo(address)
    }else{
        return null
    }
}

export const getMyLpToken = async (address, swapPairKey) => {
    const myWallet = WalletUtil.getMyWallet();
    return new Promise((async resolve => {
        if (myWallet.wallet && myWallet.address && address) {
            // const iost = myWallet.wallet.newIOST(window.IOST);
            // const iostHost = iost.currentRPC._provider._host;

            const swapSymbol = swapPairKey.split('_');
            const symbol1 = swapSymbol[0];
            const symbol2 = swapSymbol[1];

            const lpTokenName = await getLpTokenName(swapPairKey);

            // 전체 토큰 발행량
            const allData = await getAmountData(swapPairKey);

            // lpToken의 현재 발행량 가져오기
            const currentSupply = await getTokenCurrentSupply(lpTokenName);

            console.log("allData===",allData)
            console.log("allData==currentSupply=",currentSupply)

            axios.get(properties.IOST_ADDR + "/getTokenBalance/" + address + "/" + lpTokenName + "/1").then(({data}) => {
                // console.log("getTokenBalance======999=======",data)
                const returnResult = {
                    dpLpTokenName: "",
                    lpTokenName: "",
                    symbol1: "",
                    symbol2: "",
                    lpTokenBalance: 0,
                    symbol1Balance:0,
                    symbol2Balance:0,
                    symbol1Total:0,
                    symbol2Total:0,
                    swapPairKey:swapPairKey
                }
                const dpLpTokenName = ComUtil.getDPLpTokenName(lpTokenName);

                const myBalance = data.balance;

                // 전체공급량에서 자기 지분 토큰량 계산
                const symbol1Balance = new BigNumber(myBalance).div(currentSupply).multipliedBy(allData[symbol1]).toFixed(8)
                const symbol2Balance = new BigNumber(myBalance).div(currentSupply).multipliedBy(allData[symbol2]).toFixed(8)

                returnResult.dpLpTokenName = dpLpTokenName;
                returnResult.lpTokenName = lpTokenName;
                returnResult.symbol1 = symbol1;
                returnResult.symbol2 = symbol2;
                returnResult.lpTokenBalance = myBalance;
                returnResult.symbol1Balance = symbol1Balance;
                returnResult.symbol2Balance = symbol2Balance;
                returnResult.symbol1Total = allData[symbol1];
                returnResult.symbol2Total = allData[symbol2];

                resolve(returnResult)
            }).catch(err => {
                console.log(err);
                resolve(null)
            })
        } else {
            resolve(null)
        }
    }))
}

export const exchangeSwapTokens = async(symbol1, symbol2, amount, amountOutMin) => {

    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(EXCHANGE_CONTRACT_ID, "swapTokens", [symbol1, symbol2, amount.toString(), amountOutMin.toString()]);

    tx.addApprove('iost', amount.toString())
    if(symbol1 !== 'iost') {                          //jetstream 때문에 넣음
        tx.addApprove(symbol1, amount.toString())
    }

    tx.gasLimit = 300000;
    tx.amount_limit.push({ token: "*", value: "unlimited" });

    const res = await signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// routeSwapTokens(symbol1, symbol2, amountStr, routeHusdAmountStr, amountOutMinStr) {
export const routeSwapTokens = async(symbol1, symbol2, amount, routeHusdAmount, amountOutMin) => {

    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(EXCHANGE_CONTRACT_ID, "routeSwapTokens", [symbol1, symbol2, amount.toString(), routeHusdAmount.toString(), amountOutMin.toString()]);

    tx.addApprove('iost', amount.toString())
    if(symbol1 !== 'iost') {                          //jetstream 때문에 넣음
        tx.addApprove(symbol1, amount.toString())
    }
    tx.addApprove("husd", routeHusdAmount.toString()) //jetstream 때문에 넣음

    tx.gasLimit = 400000;
    tx.amount_limit.push({ token: "*", value: "unlimited" });

    const res = await signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}


export const exchangeAddLiquidity = async(symbol1, symbol2, symbol1Amount, symbol2Amount) => {

    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(EXCHANGE_CONTRACT_ID, "addLiquidity", [symbol1, symbol2, symbol1Amount.toString(), symbol2Amount.toString()]);

    if(symbol2 !== 'iost') {
        tx.addApprove('iost', symbol1Amount.toString())
    }
    if(symbol1 !== 'iost') {                          //jetstream 때문에 넣음
        tx.addApprove(symbol1, symbol1Amount.toString())
    }
    if(myWallet.walletType === 'Jetstream'){
        tx.addApprove(symbol2, symbol2Amount.toString())  //jetstream 때문에 넣음
    }
    tx.gasLimit = 300000;
    tx.amount_limit.push({ token: "*", value: "unlimited" });
    const res = await signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// UI에서 반납할 lpToken개수를 입력받아야 함.
export const exchangeWithdrawLiquidityWithLp = async(swapPairKey, amount) => {

    let swapSymbol = swapPairKey.split('_');
    const symbol1 = swapSymbol[0];
    const symbol2 = swapSymbol[1];

    // don_iost
    let lpTokenName = await getLpTokenName(swapPairKey);

    const myWallet = WalletUtil.getMyWallet();
    const iost = myWallet.wallet.newIOST(window.IOST)
    let tx = iost.callABI(EXCHANGE_CONTRACT_ID, "withdrawLiquidityWithLp", [symbol1, symbol2, lpTokenName, amount.toString()]);

    tx.addApprove('iost', amount.toString())
    tx.addApprove(lpTokenName, amount.toString())  //jetstream 때문에 넣음

    tx.gasLimit = 300000;
    tx.amount_limit.push({ token: "*", value: "unlimited" });

    const res = await signAndSend(tx)
    console.log(res)  // res.result res.isSuccess 로 데이터 결과값 사용가능
    return res;
}

// exchangeSwap
export const getSwapPairs = async () => {
    try{
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id:EXCHANGE_CONTRACT_ID,
            key_fields:[{key:"swapPairs"}],
            by_longest_chain:true});
        const arrJsonTokenNames = JSON.parse(res.data.datas[0]);
        // if(symbol1 && symbol2){
        //     return arrJsonTokenNames.filter((item)=>{
        //         if(item === (symbol1 + '_' + symbol2) || item === (symbol2 + '_' + symbol1)){
        //             console.log(symbol1+"___"+symbol2)
        //             return item
        //         }
        //     })[0];
        // }
        return arrJsonTokenNames;
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getAmountData = async (pairKey) => {
    try{
        const tokenPairKey = pairKey;
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id:EXCHANGE_CONTRACT_ID,
            key_fields: [
                {key: tokenPairKey, field:"amountData"},
            ],
            by_longest_chain:true});
        // console.log("========getRewardRate:");
        // console.log(res);
        return JSON.parse(res.data.datas[0]);
    }catch (err){
        console.log(err.message)
        return null
    }
}

export const getLpTokenName = async (pairKey) => {
    try{
        const tokenPairKey = pairKey;
        const res = await axios.post(properties.IOST_ADDR + "/getBatchContractStorage", {
            id:EXCHANGE_CONTRACT_ID,
            key_fields: [
                {key: tokenPairKey, field:"lpTokenName"},
            ],
            by_longest_chain:true});
        // console.log("========lpTokenName:");
        // console.log(res);
        return res.data.datas[0];
    }catch (err){
        console.log(err.message)
        return null
    }
}


export const getTokenCurrentSupply = async (tokenName) => {

    return new Promise(( resolve => {
        axios.get(properties.IOST_ADDR + "/getTokenInfo/" + tokenName + "/1").then(({data}) => {
            // console.log("getTokenInfo ============ ",data)
            // data.current_supply 이 숫자를 int로 바꾼 후 10^8 으로 나눠서 리턴해야 함.
            const supply = parseInt(data.current_supply) / 100000000;
            resolve(supply)
        }).catch(err => {
            console.log(err);
            resolve(0)
        })
    }))
}



export default {
    getTokenBalance,
    getPoolTokenBalance,
    getTradeUserStakeBalance,
    getPoolIsOpen,
    // getPoolIsOpenByName,
    getPoolStartTime,
    getPoolPeriodFinish,
    getPoolTotalSupply,
    getPoolRewardRate,
    getTradeBalanceAll,
    onSendIrcDonToManagerBC, //TODO chagne to onIwSwapWithdrawBC 유사함수.
    onErcDonWithdrawBC,
    onWithDrawSendBC,
    onDepositSendBC,
    onHarvestSendBC,
    onHarvestWithDrawSendBC,
    onIwSwapWithdrawBC,
    signAndSend,
    //exchange Function
    exchangeSwapTokens,
    routeSwapTokens,
    exchangeAddLiquidity,
    exchangeWithdrawLiquidityWithLp,

    getSwapPairs,
    getAmountData,
    getLpTokenName,
    getTokenCurrentSupply,

    getLpTokenList,
    getMyLpTokenListInfo, getMyLpTokenList,
    getMyLpToken

}