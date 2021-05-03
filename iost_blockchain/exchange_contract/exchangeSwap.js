
const DON_SYMBOL = 'don';
const DON_ADDRESS = 'Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8';


const ADMIN = 'donmanager';
const DON_EX_PROFIT = 'donplatform';

//totalfee = 0.001 (0.1%)
const PROVIDER_FEE = 0.0008; //0.0025; //0.25% -> 0.0017 -> 0.0008
const PLATFORM_FEE = 0.0002; //0.0005; //0.05% -> 0.0003 -> 0.0002
const TOTAL_FEE = new Float64(PROVIDER_FEE).plus(PLATFORM_FEE);
const MIN_TOKEN = new Float64("0.000001");

class ExchangeSwap {
    init() {
        storage.put('swapPairs', JSON.stringify([]));
    }

    //Only owner can update.
    can_update(data) {
        return blockchain.requireAuth(ADMIN, "active");
    }


    //Requires ADMIN to list the pair and set initial swap value.
    addPair(symbol1, symbol2, symbol1AmountStr, symbol2AmountStr){
        //checks that ADMIN is calling function.
        this._assertAccountAuth(ADMIN);
        //checks that tokens exists on the chain.
        blockchain.callWithAuth("token.iost", "totalSupply", JSON.stringify([symbol1]));
        blockchain.callWithAuth("token.iost", "totalSupply", JSON.stringify([symbol2]));

        let pair1 = symbol1 + '_' + symbol2;
        let pair2 = symbol2 + '_' + symbol1;
        let swapPairs = JSON.parse(storage.get('swapPairs'));

        //check if the symbol pairs already exist in smart contract.
        if(swapPairs.includes(pair1) || swapPairs.includes(pair2)){
            throw new Error(pair1 + "pair already exists. ");
        }
        // this._transferToken(symbol1, tx.publisher, blockchain.contractName(), (symbol1Amount * 1).toFixed(8), 'Admin sends ' + symbol1 + ' to donnieEx. ');
        // this._transferToken(symbol2, tx.publisher, blockchain.contractName(), (symbol2Amount * 1).toFixed(8), 'Admin sends ' + symbol2 + ' to donnieEx. ');
        if(symbol1AmountStr * 0 != 0){
            throw new Error("Must be a valid numerical symbol1Amount. ");
        }
        let symbol1Amount = new Float64(symbol1AmountStr);

        if(symbol2AmountStr * 0 != 0){
            throw new Error("Must be a valid numerical symbol2Amount. ");
        }
        let symbol2Amount = new Float64(symbol2AmountStr);

        this._transferToken(symbol1, tx.publisher, blockchain.contractName(), (symbol1Amount).toFixed(8), 'Admin sends ' + symbol1 + ' to donnieEx. ');
        this._transferToken(symbol2, tx.publisher, blockchain.contractName(), (symbol2Amount).toFixed(8), 'Admin sends ' + symbol2 + ' to donnieEx. ');

        swapPairs.push(pair1);
        storage.put('swapPairs', JSON.stringify(swapPairs));


        let amountData = {};
        // amountData[symbol1] = (symbol1Amount * 1).toFixed(8);
        // amountData[symbol2] = (symbol2Amount * 1).toFixed(8);
        // amountData['invariant'] = (symbol1Amount * symbol2Amount).toFixed(8);
        amountData[symbol1] = (symbol1Amount).toFixed(8);
        amountData[symbol2] = (symbol2Amount).toFixed(8);
        amountData['invariant'] = (symbol1Amount.multi(symbol2Amount)).toFixed(8);

        let provider = {};
        provider['account'] = ADMIN;
        // provider[symbol1] = (symbol1Amount * 1).toFixed(8);
        // provider[symbol2] = (symbol2Amount * 1).toFixed(8);
        provider[symbol1] = (symbol1Amount).toFixed(8);
        provider[symbol2] = (symbol2Amount).toFixed(8);

        //records the price data and provider data.
        storage.mapPut(pair1, 'amountData', JSON.stringify(amountData));
        storage.mapPut(pair1, 'providerData', JSON.stringify([provider]));


        //비례식을 위해서 admin에게도 LP토큰 발행.
        //여기서 호출 불가. this._mintLpToken(symbol1, symbol2, symbol1Amount, symbol2Amount);  수동으로 setLpPair, addPairMintLpToken 호출필요.
    }

    // 수동으로 addPair했을 경우 setLpPair와 함께 호출필요
    addPairMintLpToken(symbol1, symbol2, symbol1Amount, symbol2Amount) {
        //checks that ADMIN is calling function.
        this._assertAccountAuth(ADMIN);
        this._mintLpToken(symbol1, symbol2, symbol1Amount, symbol2Amount, new Float64(0)); //inputRatio 초기값은 0
    }

    //swap token1 for token2
    //swapTokens(symbol1, symbol2, amount){
    swapTokens(symbol1, symbol2, amountStr, amountOutMinStr){
        //check pairs' existence.
        let pair1 = symbol1 + '_' + symbol2;
        let pair2 = symbol2 + '_' + symbol1;
        let swapPairs = JSON.parse(storage.get('swapPairs'));
        let mainPair;


        if(amountStr * 0 != 0){
            throw new Error("Must be a valid numerical amount. ");
        }

        let balance = new Float64(amountStr);

        //check if the symbol pairs already exist in smart contract.
        if (swapPairs.includes(pair1)) {
            mainPair = pair1;
        }
        else if (swapPairs.includes(pair2)){
            mainPair = pair2;
        }
        else {
            throw new Error("This pair does not have a swap liquidity pool. ");
        }

        //if (amount * 1 <= 0) {
        if (balance.lte(0)) {
            throw new Error("Must be an amount that is greater than zero. ");
        }

        let amountData = JSON.parse(storage.mapGet(mainPair, 'amountData'));
        //let providerData = JSON.parse(storage.mapGet(mainPair, 'providerData'));

        //front와 동일한 로직의 userReceive 계산 부분./////// exchange/swap.js  getCalculatedSwapAmount start ******

        let providerGains = balance.multi(PROVIDER_FEE);
        let platformGains = balance.multi(PLATFORM_FEE);
        let totalFee = balance.multi(TOTAL_FEE);           //1 * 0.0001 = 0.0001
        let amountToContract = balance.minus(platformGains);      //0 - 0 * 1 = 0

        //validation 추가. 최소값보다 작으면 0으로 세팅.
        if (providerGains.lt(MIN_TOKEN)) providerGains = new Float64(0);
        if (platformGains.lt(MIN_TOKEN)) platformGains = new Float64(0);
        if (totalFee.lt(MIN_TOKEN)) totalFee = new Float64(0);


        let symbol1Pool = new Float64(amountData[symbol1]);  //10 DON

        //전체s1 + 수수료제외 입금액
        symbol1Pool = symbol1Pool.plus(balance.minus(totalFee)); //10 += 1 * 1 - 0 * 1 = 11

        //전체s2tobe
        let symbol2Pool = new Float64(amountData['invariant']).div(symbol1Pool); //300 / 11      //x*y=k -> y=k/x

        //전체s2 - 전체s2tobe
        let userReceives = new Float64(amountData[symbol2]).minus(symbol2Pool); //30 * 1 - 11 = 19 //total - y ?
        let userReceiveStr = userReceives.toFixed(8);

        // _calculateUserReceive end  ******

        //202103 add
        if (symbol2Pool.lt(amountOutMinStr)) {
            throw new Error('Donnie: Insufficient output Pool');
        }
        if (new Float64(userReceiveStr).lt(amountOutMinStr)) {
            throw new Error('Donnie: Try again due to concurrent transaction. slipage-userReceive:' + userReceiveStr + ", " + amountOutMinStr);
        }


        //User sends swap token to the contract and to management.
        this._transferToken(symbol1, tx.publisher, blockchain.contractName(), amountToContract.toFixed(8), "User sends " + symbol1 + " to the exchangeSwap contract. " );

        //platform Feee
        this._transferToken(symbol1, tx.publisher, DON_EX_PROFIT, platformGains.toFixed(8), "User sends " + symbol1 + " as platform fee to the donnie team. ");

        //User receives the wanted token from contract.
        this._transferToken(symbol2, blockchain.contractName(), tx.publisher, userReceives.toFixed(8), "ExchangeSwap sends " + symbol2 + " to user. ");

        //Handle providerGains:
        //symbol1Pool += providerGains;
        let symbol1Total = symbol1Pool.plus(providerGains);

        let invariant = symbol1Total.multi(symbol2Pool);


        amountData[symbol1] = symbol1Total.toFixed(8);
        amountData[symbol2] = symbol2Pool.toFixed(8);
        amountData['invariant'] = invariant.toFixed(8);

        storage.mapPut(mainPair, 'amountData', JSON.stringify(amountData));


        return userReceives; //아래 routeSwapTokens 에서만 사용. (return해도 일반적으론 문제없는지 확인필요)
    }

    //don<->iost swap아니고, husd가 symbol1,symbol2에 없을때, symbol1<->husd 후, husd<->symbol2 swap수행.
    //amountStr = symbol1, amountOutMinStr = symbol2, routeHusdAmount는 소수점 8자리(반올림)까지 정확하게 비교함.
    routeSwapTokens(symbol1, symbol2, amountStr, routeHusdAmountStr, amountOutMinStr) {

        if (symbol1 === "husd" || symbol2 === "husd") {
            throw new Error("use swapTokens function - error1");
        }else if ((symbol1 === "don" && symbol2 === "iost") || (symbol1 === "iost" && symbol2 === "don")) {
            throw new Error("use swapTokens function - error2");
        }

        //swap1
        let viaHusdFloat = this.swapTokens(symbol1, "husd", amountStr, routeHusdAmountStr);

        if (!(viaHusdFloat.toFixed(8).includes(routeHusdAmountStr))) { //equal비교임. (단 문제점 fix - routeHusdAmountStr: 2.xx1 viaHusdFloat.toFixed: 2.xx10)
            throw new Error("Pool is changed due to concurrent transaction. Try again. (" + routeHusdAmountStr + " vs. " + viaHusdFloat.toFixed(8) + ")");
        }

        //swap2
        this.swapTokens("husd", symbol2, routeHusdAmountStr, amountOutMinStr);
    }



    //Users can add to liquidity pool.
    addLiquidity(symbol1, symbol2, symbol1AmountStr, symbol2AmountStr){

        let mainPair = this._checkPair(symbol1, symbol2);

        if (symbol1AmountStr * 0 !== 0) {
            throw new Error("Must be a valid numerical amount. ");
        }

        let symbol1Amount = new Float64(symbol1AmountStr);

        // if (symbol1AmountStr * 1 <= 0) {
        if (symbol1Amount.lte(0)) {
            throw new Error("Must be an amount that is greater than zero. ");
        }

        let amountData = JSON.parse(storage.mapGet(mainPair, 'amountData'));
        let providerData = JSON.parse(storage.mapGet(mainPair, 'providerData'));

        // let symbol2Amount = symbol1Amount * amountData[symbol2] / amountData[symbol1] ; //s1a:s2a=x:y  => s2a=s1a*y/x
        let symbol1AmountData = new Float64(amountData[symbol1]);
        let symbol2AmountData = new Float64(amountData[symbol2]);
        let symbol2Amount = ((symbol1Amount).multi(symbol2AmountData)).div(symbol1AmountData) ; //s1a:s2a=x:y  => s2a=s1a*y/x

        let symbol2InputAmount = (new Float64(symbol2AmountStr)).plus(0.00000001); // 혹시모를 오차는 0.00000001까지 허용하기
        if(symbol2Amount.gte(symbol2InputAmount)) {
            throw new Error("Pool is updated, try again!");
        }

        //checks if user already is in the pool.
        let index = providerData.findIndex(prov => {
            return prov['account'] === tx.publisher;
        })

        //if yes, then simply update user's data in the pool.
        if(index !== -1){
            // providerData[index][symbol1] = (providerData[index][symbol1] * 1 + symbol1Amount * 1).toFixed(8);
            // providerData[index][symbol2] = (providerData[index][symbol2] * 1 + symbol2Amount * 1).toFixed(8);
            providerData[index][symbol1] = (new Float64(providerData[index][symbol1]).plus(symbol1Amount)).toFixed(8);
            providerData[index][symbol2] = (new Float64(providerData[index][symbol2]).plus(symbol2Amount)).toFixed(8);
        }
        //if not then add user's contribution as new data to the array.
        else {
            let newData = {};
            newData['account'] = tx.publisher;
            // newData[symbol1] = (symbol1Amount * 1).toFixed(8);
            newData[symbol1] = symbol1Amount.toFixed(8);
            newData[symbol2] = symbol2Amount.toFixed(8);
            providerData.push(newData);
        }

        //minLpToken을 위한 입력 비율.   symbol1Amount / amountData = 1/10 (amountData추가전 비율로 계산중)
        let inputSymbol1Ratio = symbol1Amount.div(amountData[symbol1]);


        // amountData[symbol1] = (amountData[symbol1] * 1 + symbol1Amount * 1).toFixed(8);
        // amountData[symbol2] = (amountData[symbol2] * 1 + symbol2Amount * 1).toFixed(8);
        // amountData['invariant'] = (amountData[symbol1] * amountData[symbol2]).toFixed(8);
        amountData[symbol1] = (new Float64(amountData[symbol1]).plus(symbol1Amount)).toFixed(8);
        amountData[symbol2] = (new Float64(amountData[symbol2]).plus(symbol2Amount)).toFixed(8);
        amountData['invariant'] = (new Float64(amountData[symbol1]).multi(new Float64(amountData[symbol2]))).toFixed(8);

        //Update the price data with the new invariant.
        storage.mapPut(mainPair, 'amountData', JSON.stringify(amountData));

        //Update new liquidity pool provider list.
        storage.mapPut(mainPair, 'providerData', JSON.stringify(providerData));


        //all logic succeeded, so user sends the amounts to the contract.
        // this._transferToken(symbol1, tx.publisher, blockchain.contractName(), (symbol1Amount * 1).toFixed(8), 'User adds to liquidity pool. ');
        this._transferToken(symbol1, tx.publisher, blockchain.contractName(), symbol1Amount.toFixed(8), 'User adds to liquidity pool. ');
        this._transferToken(symbol2, tx.publisher, blockchain.contractName(), symbol2Amount.toFixed(8), 'User adds to liquidity pool. ');


        // this._mintLpToken(symbol1, symbol2, symbol1Amount, symbol2Amount);
        this._mintLpToken(symbol1, symbol2, symbol1Amount.toFixed(8), symbol2Amount.toFixed(8), inputSymbol1Ratio);

    }

    //mint LP토큰 -> addPair와 addLiquitidity에서 가능.
    _mintLpToken(symbol1, symbol2, symbol1AmountStr, symbol2AmountStr, inputSymbol1Ratio) {

        let lpTokenName = this._getLpTokenName(symbol1, symbol2);
        let lpTokenAddress = this._getLpTokenAddress(symbol1, symbol2);

        if (!lpTokenName || !lpTokenAddress) {
            throw new Error("lpToken not set yet!! ");
        }

        if(symbol1AmountStr * 0 != 0){
            throw new Error("Must be a valid numerical symbol1Amount. ");
        }
        let symbol1Amount = new Float64(symbol1AmountStr);

        if(symbol2AmountStr * 0 != 0){
            throw new Error("Must be a valid numerical symbol2Amount. ");
        }
        let symbol2Amount = new Float64(symbol2AmountStr);


        //minLpToken 추가: amount1 입력비율로 보장.
        let currentLpSupply = new Float64(blockchain.callWithAuth("token.iost", "supply", JSON.stringify([lpTokenName]))); //현재 lpToken supply
        let minLpToken = currentLpSupply.multi(inputSymbol1Ratio);


        //husd는 항상 mainPair의 2번째 저장.
        if (lpTokenName.indexOf('husd') > 0 )  { //production: xxhusdLP

            //check : symbol1 -> canbe husd.
            //let token1 = (symbol2 === 'husd')? symbol1:symbol2;
            let token1Amount = (symbol2 === 'husd')? symbol1Amount:symbol2Amount;
            let husdAmount = (symbol2 === 'husd')? symbol2Amount:symbol1Amount;

            //token1Value =  price$ * symbol1 count
            // let token1Price =  ((husdAmount * 1)/(token1Amount * 1)).toFixed(8);//= totalHusd/totalDon
            // let token1Value = (token1Price * (token1Amount * 1)).toFixed(8);
            let token1Price =  husdAmount.div(token1Amount);//= totalHusd/totalDon
            let token1Value = token1Price.multi(token1Amount);

            //mint(tx.publisher, lpAmount)
            // let totalLpValue = (token1Value * 1 + husdValue * 1).toFixed(4); //LP토큰은 소숫점 4자리
            // blockchain.callWithAuth(lpTokenAddress, "mint", [blockchain.contractName(), totalLpValue.toString()]);
            // blockchain.callWithAuth(lpTokenAddress, "transfer", [lpTokenName, blockchain.contractName(), tx.publisher, totalLpValue.toString(), "LpToken mint"]);
            let totalLpValue = (token1Value.plus(husdAmount)).toFixed(4); //LP토큰은 소숫점 4자리

            //LP토큰 개수 최소값 보장.
            if (minLpToken.gt(totalLpValue)) {
                totalLpValue = minLpToken.toFixed(4);
            }
            blockchain.callWithAuth(lpTokenAddress, "mint", [blockchain.contractName(), totalLpValue]);
            blockchain.callWithAuth(lpTokenAddress, "transfer", [lpTokenName, blockchain.contractName(), tx.publisher, totalLpValue, "LpToken mint"]);


        } else { //don_iost LP(not husd case) - symbol1_husd, symbol2_husd must exist.

            //find token1Husd pair
            let token1HusdPair = this._checkPair(symbol1, 'husd');

            //token1Value 구하기: using token1_husd amountData
            let token1HusdAmountData = JSON.parse(storage.mapGet(token1HusdPair, 'amountData'));
            // let token1Amount = token1HusdAmountData[symbol1];
            // let husdAmount = token1HusdAmountData['husd'];
            let token1Amount = new Float64(token1HusdAmountData[symbol1]);
            let husdAmount = new Float64(token1HusdAmountData['husd']);

            // let token1Price = ((husdAmount * 1)/(token1Amount * 1)).toFixed(8);
            // let token1Value = (token1Price * (symbol1Amount * 1)).toFixed(8); //symbol1Amount=user Input
            let token1Price = husdAmount.div(token1Amount);
            let token1Value = token1Price.multi(symbol1Amount); //symbol1Amount=user Input


            //find token2Husd pair
            let token2HusdPair = this._checkPair(symbol2, 'husd');

            //token2Value 구하기
            let token2HusdAmountData = JSON.parse(storage.mapGet(token2HusdPair, 'amountData'));
            // let token2Amount = token2HusdAmountData[symbol2];
            // let husd2Amount = token2HusdAmountData['husd'];
            let token2Amount = new Float64(token2HusdAmountData[symbol2]);
            let husd2Amount = new Float64(token2HusdAmountData['husd']);

            // let token2Price = ((husd2Amount * 1)/(token2Amount * 1)).toFixed(8);
            // let token2Value = (token2Price * (symbol2Amount * 1)).toFixed(8); //symbol2Amount=user Input
            let token2Price = husd2Amount.div(token2Amount);
            let token2Value = token2Price.multi(symbol2Amount); //symbol2Amount=user Input

            //mintTo(tx.publisher, lpAmount)
            // let totalLpValue = (token1Value * 1 + token2Value * 1).toFixed(4); //LP토큰은 소숫점 4자리
            let totalLpValue = (token1Value.plus(token2Value)).toFixed(4); //LP토큰은 소숫점 4자리

            //LP토큰 개수 최소값 보장.
            if (minLpToken.gt(totalLpValue)) {
                totalLpValue = minLpToken.toFixed(4);
            }
            blockchain.callWithAuth(lpTokenAddress, "mint", [blockchain.contractName(), totalLpValue]);
            blockchain.callWithAuth(lpTokenAddress, "transfer", [lpTokenName, blockchain.contractName(), tx.publisher, totalLpValue, "LpToken mint"]);

        }

    }

    //for admin : call after addPairs is done,
    setLpToken(symbol1, symbol2, lpTokenName, lpTokenAddress) {

        this._assertAccountAuth(ADMIN);

        let mainPair = this._checkPair(symbol1, symbol2);
        storage.mapPut(mainPair, 'lpTokenName', lpTokenName);
        storage.mapPut(mainPair, 'lpTokenAddress', lpTokenAddress);

        //역도 저장. lpTokenName -> mainPair찾기용도.
        storage.mapPut('lpPair', lpTokenName, mainPair);
    }


    _getLpTokenName(symbol1, symbol2) {
        let mainPair = this._checkPair(symbol1, symbol2);
        return storage.mapGet(mainPair, 'lpTokenName');
    }

    _getLpTokenAddress(symbol1, symbol2) {
        let mainPair = this._checkPair(symbol1, symbol2);
        return storage.mapGet(mainPair, 'lpTokenAddress');
    }

    _getPairByLpToken(lpTokenName) {
        return storage.mapGet('lpPair', lpTokenName);
    }

    deletePair(symbol1, symbol2) {
        //checks that ADMIN is calling function.
        this._assertAccountAuth(ADMIN);

        let mainPair = this._checkPair(symbol1, symbol2);
        storage.mapDel(mainPair, 'amountData');
        storage.mapDel(mainPair, 'providerData');
        let temp_pairs = JSON.parse(storage.get('swapPairs'));
        temp_pairs = temp_pairs.filter(p => p !== mainPair);
        storage.put('swapPairs', JSON.stringify(temp_pairs));
    }

    //delete: withdrawLiquidityWithLp로 대체, abi도 제거함.
    // withdrawLiquidity(symbol1, symbol2){
    //
    //     let mainPair = this._checkPair(symbol1, symbol2);
    //
    //
    //     let amountData = JSON.parse(storage.mapGet(mainPair, 'amountData'));
    //     let providerData = JSON.parse(storage.mapGet(mainPair, 'providerData'));
    //
    //     //Checks if user exists in the pool.
    //     let index = providerData.findIndex(user => {
    //         return user["account"] === tx.publisher;
    //     })
    //
    //     //if yes then withdraw and update.
    //     if (index !== -1) {
    //         // let symbol1Amount = providerData[index][symbol1] * 1;
    //         // let symbol2Amount = providerData[index][symbol2] * 1;
    //         let symbol1Amount = new Float64(providerData[index][symbol1]);
    //         let symbol2Amount = new Float64(providerData[index][symbol2]);
    //
    //         //Sends user the appropriate amount in the pool.
    //         this._transferToken(symbol1, blockchain.contractName(), tx.publisher, symbol1Amount.toFixed(8), 'User withdrawls liquidity pool. ');
    //         this._transferToken(symbol2, blockchain.contractName(), tx.publisher, symbol2Amount.toFixed(8), 'User withdrawls liquidity pool. ');
    //
    //         //deducts user's pool contribution from the total pools.
    //         // amountData[symbol1] = (amountData[symbol1] * 1 - symbol1Amount).toFixed(8);
    //         // amountData[symbol2] = (amountData[symbol2] * 1 - symbol2Amount).toFixed(8);
    //         // amountData['invariant'] = (amountData[symbol1] * amountData[symbol2]).toFixed(8);
    //         let symbol1AmountData = new Float64(amountData[symbol1]);
    //         let symbol2AmountData = new Float64(amountData[symbol2]);
    //         amountData[symbol1] = (symbol1AmountData.minus(symbol1Amount)).toFixed(8);
    //         amountData[symbol2] = (symbol2AmountData.minus(symbol2Amount)).toFixed(8);
    //         amountData['invariant'] = (symbol1AmountData.multi(symbol2AmountData)).toFixed(8);
    //
    //         symbol1AmountData = new Float64(amountData[symbol1]);
    //         symbol2AmountData = new Float64(amountData[symbol2]);
    //
    //         //If user withdraw and they are the only liquidity provider, delete the pair from contract because no more liquidity provider.
    //         // if (amountData[symbol1] * 1 === 0 && amountData[symbol2] * 1 === 0){
    //         if (symbol1AmountData === 0 && symbol2AmountData === 0){
    //             storage.mapDel(mainPair, 'amountData');
    //             storage.mapDel(mainPair, 'providerData');
    //             let temp_pairs = JSON.parse(storage.get('swapPairs'));
    //             temp_pairs = temp_pairs.filter(p => p !== mainPair);
    //             storage.put('swapPairs', JSON.stringify(temp_pairs));
    //         }
    //         //else update the liquidity pool
    //         else
    //         {
    //             //update the pool with new pool.
    //             storage.mapPut(mainPair, 'amountData', JSON.stringify(amountData));
    //
    //             //Takes user out of the pool array.
    //             providerData = providerData.filter(u => u['account'] !== tx.publisher);
    //             storage.mapPut(mainPair, 'providerData', JSON.stringify(providerData));
    //         }
    //
    //
    //     }
    //     //If not, then throw error.
    //     else {
    //         throw new Error("You don't have a liquidity pool to withdraw for this pair. ");
    //     }
    // }


    // LP토큰을 이용한 withdrawLiquidity
    withdrawLiquidityWithLp(symbol1, symbol2, lpTokenName, amountStr){

        //let mainPair = this._checkPair(symbol1, symbol2);

        //find Pair with lpTokenName.
        let mainPair = this._getPairByLpToken(lpTokenName);

        let amountData = JSON.parse(storage.mapGet(mainPair, 'amountData'));
        let amount = new Float64(amountStr);

        //providerData는 lp방식 withdraw시에는 미시용.
        // let providerData = JSON.parse(storage.mapGet(mainPair, 'providerData'));
        //Checks if user exists in the pool.
        // let index = providerData.findIndex(user => {
        //     return user["account"] === tx.publisher;
        // })
        //if yes then withdraw and update.
        // let symbol1Amount = providerData[index][symbol1] * 1;
        // let symbol2Amount = providerData[index][symbol2] * 1;


        //lpToken개수로 비례식 산출.
        // let totalLpToken = blockchain.callWithAuth("token.iost", "supply", JSON.stringify([lpTokenName]));
        // let ratio = ((amount * 1)/(totalLpToken * 1)).toFixed(8);
        let totalLpToken = new Float64(blockchain.callWithAuth("token.iost", "supply", JSON.stringify([lpTokenName])));
        //let ratioStr = (amount.div(totalLpToken)).toFixed(8);
        let ratio = amount.div(totalLpToken); //new Float64(ratioStr);

        // let symbol1Amount = ((amountData[symbol1] * 1) * ratio).toFixed(8);
        // let symbol2Amount = ((amountData[symbol2] * 1) * ratio).toFixed(8);
        let symbol1AmountData = new Float64(amountData[symbol1]);
        let symbol2AmountData = new Float64(amountData[symbol2]);
        let symbol1Amount = (symbol1AmountData.multi(ratio)).toFixed(8);
        let symbol2Amount = (symbol2AmountData.multi(ratio)).toFixed(8);


        //LpToken: transferTo(thisContract) & destroy..
        // this._transferToken(lpTokenName, tx.publisher, blockchain.contractName(), amount, 'User withdraw with lpToken.');
        //destroy by owner
        blockchain.callWithAuth("token.iost", "destroy", [lpTokenName, tx.publisher, amountStr]); //token.iost or lpTokenAddress


        //Sends user the appropriate amount in the pool.
        this._transferToken(symbol1, blockchain.contractName(), tx.publisher, symbol1Amount, 'User withdraw liquidity pool. ');
        this._transferToken(symbol2, blockchain.contractName(), tx.publisher, symbol2Amount, 'User withdraw liquidity pool. ');

        //deducts user's pool contribution from the total pools.
        // amountData[symbol1] = (amountData[symbol1] * 1 - symbol1Amount).toFixed(8);
        // amountData[symbol2] = (amountData[symbol2] * 1 - symbol2Amount).toFixed(8);
        // amountData['invariant'] = (amountData[symbol1] * amountData[symbol2]).toFixed(8);
        amountData[symbol1] = (symbol1AmountData.minus(new Float64(symbol1Amount))).toFixed(8);
        amountData[symbol2] = (symbol2AmountData.minus(new Float64(symbol2Amount))).toFixed(8);
        symbol1AmountData = new Float64(amountData[symbol1]);
        symbol2AmountData = new Float64(amountData[symbol2]);
        amountData['invariant'] = (symbol1AmountData.multi(symbol2AmountData)).toFixed(8);


        //update the pool with new pool.
        storage.mapPut(mainPair, 'amountData', JSON.stringify(amountData));


        ////providerData는 lp방식 withdraw시에는 미시용.  Takes user out of the pool array.
        //providerData = providerData.filter(u => u['account'] !== tx.publisher);
        //storage.mapPut(mainPair, 'providerData', JSON.stringify(providerData));

    }

    //checks pairs.
    _checkPair(symbol1, symbol2){
        //check pairs' existence.
        let pair1 = symbol1 + '_' + symbol2;
        let pair2 = symbol2 + '_' + symbol1;
        let swapPairs = JSON.parse(storage.get('swapPairs'));

        //check if the symbol pairs already exist in smart contract.
        if (swapPairs.includes(pair1)) {
            return pair1;
        }
        else if (swapPairs.includes(pair2)) {
            return pair2;
        }
        else {
            throw new Error("This pair does not have a swap liquidity pool. ");
        }

    }



    //Check to make sure that the account is authorized to perform a function.
    _assertAccountAuth(account) {
        if (!blockchain.requireAuth(account, "active")) {
            throw new Error("Authorization Failure");
        }
    }

    //transfers tokens/iost
    _transferToken(tokenSymbol, from, to, amount, memo) {

        if ((new Float64(amount)).lt(MIN_TOKEN)) { //0.000001이상일때만 전송.
            return;
        }

        let args = [
            tokenSymbol,
            from,
            to,
            amount,
            memo
        ];

        if(tokenSymbol === 'husd'){
            blockchain.callWithAuth("Contract3zCNX76rb3LkiAamGxCgBRCNn6C5fXJLaPPhZu2kagY3", "transfer", JSON.stringify(args));
        }
        else if (tokenSymbol === DON_SYMBOL) {
            blockchain.callWithAuth(DON_ADDRESS, "transfer", JSON.stringify(args));
        }
        else if (tokenSymbol === 'iwbnb') {
            blockchain.callWithAuth("Contract6ZPp62E2J4bChdQkvCEZTozLHC2GcefdxpWnj647DjGJ", "transfer", JSON.stringify(args));
        }
        else {
            blockchain.callWithAuth("token.iost", "transfer", JSON.stringify(args));
        }
    }


}

module.exports = ExchangeSwap;