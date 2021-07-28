

const IDO_TOKEN = 'iwwitch';         //TODO1 prod
const PAY_TOKEN = 'iost';     //TODO2 prod


const START_TIME = 1626652800;      //TODO3  20210719:09:00(Seoul, 목요일) in Seconds. 참조- https://www.epochconverter.com/ 배포 addr:Contract257T3iWPPundHcHA5rTDw2AEy3ka5Ux9f7zdade7kd8u
const DURATION = 24 * 3600 * 1;     //TODO4  참여가능기간: 1일로 할 예정.


//중요1: token을 입금하고 시작해야함.

const PRICE = 75;       // 1 ido_token per 69 iost (약 1.5달러)

///// tier1 ////////////
const TOTAL_IDO_TOKEN = 3333;  //70000* 1달러(20 iost) = 7만달러 (100명이 700달러씩)
 //구매 최소, 최대 iost.  1K=5만원,  2K=10만원.
const MIN_PAY =  5000;  // 20K =  백만원.
const MAX_PAY = 7500;  //100K = 5백만원,


///// tier2 ////////////
// const TOTAL_IDO_TOKEN = 13333;  //1억3천->9천.
//  //구매 최소, 최대 iost.  1K=5만원,  2K=10만원.
// const MIN_PAY = 15000;  //100K =  5백만원.
// const MAX_PAY = 25000;  //400K = 2천만원,


/////////// keys //////////////////////////////
const TO_FIXED = 4;


const TOTAL_IDO_LEFT_KEY = "totalIdoLeft";
const PRICE_KEY = "tokenPrice";

//must be set before start.
const WHITELIST_CONTRACT_KEY = "whitelistContract"

const OPEN_KEY  = "open";
const PERIOD_FINISH_KEY  = "periodFinish";
const START_TIME_KEY  = "startTime";
const DURATION_KEY = "duration";


const USER_BOUGHT_MAPKEY = "userBought"; //기구매한 ido_token개수를 저장.
const CAN_CLAIM_TOKEN = "canClaimToken";    // 구매한 ido token 실제 전송 가능여부
const ALREADY_CLAIM = "alreadyClaim";       // 구매한 토큰 전송여부

class Test_buyIdo {
    init() {
        //ido token
        storage.put(TOTAL_IDO_LEFT_KEY, ""+TOTAL_IDO_TOKEN);
        storage.put(PRICE_KEY, ""+PRICE);
        storage.put(CAN_CLAIM_TOKEN, "false");

        //basic
        storage.put(OPEN_KEY, "true");
        storage.put(PERIOD_FINISH_KEY, ""+(START_TIME + DURATION));
        storage.put(START_TIME_KEY, ""+START_TIME);
        storage.put(DURATION_KEY, ""+DURATION);
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    ////////////////////////Token Wrapper/////////////////////
    _totalSupplyIdoToken() {
        return new Float64(storage.get(TOTAL_IDO_LEFT_KEY));
    }


    // accountId는 Account Name
    _boughtHistory(accountId) {
        if (storage.mapHas(USER_BOUGHT_MAPKEY, accountId)) {
            return new Float64(storage.mapGet(USER_BOUGHT_MAPKEY, accountId));
        }
        return new Float64(0);
    }


    //return boolean
    _isStart() { // checkStart

        let startTime = storage.get(START_TIME_KEY);
        let startTimeNano = new Int64(startTime).multi(1000000000);
        if (startTimeNano.lte(block.time)) {
            return true;
        }
        return false;
    }

    //return boolean
    _isOpen() {
        let openFlag = storage.get(OPEN_KEY);
        if (openFlag === "true") {
            return true;
        }
        return false;
    }

    _canClaimToken() {
        let openFlag = storage.get(CAN_CLAIM_TOKEN);
        if (openFlag === "true") {
            return true;
        }
        return false;
    }

    // token claim 완료여부
    _alreadyClaim(accountId) {
        if (storage.mapHas(ALREADY_CLAIM, accountId)) {
            return true;
        }
        return false;
    }

    //return int(Sec)
    _getPeriodFinish() {
        let startTime = storage.get(START_TIME_KEY);
        let duration = storage.get(DURATION_KEY);

        return (new Int64(startTime).plus(duration));
    }

    //return boolean
    _isPeriod() {
        let startTime = new Int64(storage.get(START_TIME_KEY));
        let duration = new Int64(storage.get(DURATION_KEY));
        let finishTimeNano = (startTime.plus(duration)).multi(1000000000);
        if (finishTimeNano.gte(block.time)) {
            return true;
        }
        return false;
    }

    //return true/false, check if user is whitelisted.
    _checkUserWinnerStatus(userid) {

       let  whitelistContractId = storage.get(WHITELIST_CONTRACT_KEY);
       if (!whitelistContractId) {
           throw new Error("WHITELIST_CONTRACT_KEY is not set");
       }

       let result = blockchain.callWithAuth(whitelistContractId, "checkUserWhiteListed", [userid]);
       return result.toString();
    }

    ////////////////////////ido functions///////////////////////

    //set whitlist contractId
    setWhiteListContract(whitelistContractId) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }
        storage.put(WHITELIST_CONTRACT_KEY, whitelistContractId);
    }


    //pay iost and get IDO_TOKEN.
    buy(payAmountStr) {

        let userWinnerStatus = this._checkUserWinnerStatus(tx.publisher);
        if (userWinnerStatus !== 'kyc') {
            throw new Error("user KYC not done:" + userWinnerStatus);
        }

        if(!this._isOpen()) {
            throw new Error("IDO is not opened or closed for a while");
        }

        if(!this._isStart()) {
            throw new Error("IDO is not started");
        }

        if(!this._isPeriod()) {
            throw new Error("IDO is already finished");
        }

        if(payAmountStr * 0 != 0){
            throw new Error("Must be a valid numerical amount. ");
        }

        //중복구매 방지하고 항상 MIN/MAX 체크.
        if (new Float64(payAmountStr).lt(MIN_PAY)) {
            throw new Error("Must be larger than minimum:" + MIN_PAY);
        }

        if (new Float64(payAmountStr).gt(MAX_PAY)) {
            throw new Error("Must be smaller than maximum:" + MAX_PAY);
        }


        //이미 산게 있는지 체크 : boughtHistory관리.
        let alreadyBought = this._boughtHistory(tx.publisher);

        //중복구매 방지
        if (alreadyBought.gt(0)) {
            throw new Error("Already bought. You can only swap once." );
        }


        ///// idoToken 구매 개수 ///////////////////////
        let amount = (new Float64(payAmountStr).div(PRICE)).toFixed(TO_FIXED);

        //중복구매 허용시.1.(산게 있으면) 합이 MAX보다 작은지 check. 2.없으면 아래 수행.
        // if (alreadyBought.gt(0)) { //이미 구매자: 중복 구매 허용. 단 금액 MAX 체크.
        //    if (alreadyBought.plus(amount).gt(MAX_BUY_IDO)) {
        //        throw new Error("Total purchase amount(" + alreadyBought.plus(amount).toString()+ ") must be smaller than maximum:" + MAX_BUY_IDO);
        //    }
        // }else { //첫 구매
        //     if (new Float64(payAmountStr).lt(MIN_PAY)) {
        //         throw new Error("Must be larger than minimum:" + MIN_PAY);
        //     }
        // }

        let totalSupply = this._totalSupplyIdoToken(); //new Float64(storage.get(TOTAL_IDO_LEFT_KEY));

        if(totalSupply.lt(amount)) {

            if (totalSupply.gte(1)) { //조금 남았을때.
                //A. 마지막 사용자는 totalSupply 남은만큼 구매하기
                amount = totalSupply.toFixed(TO_FIXED);
                payAmountStr = (new Float64(PRICE).multi(amount)).toFixed(TO_FIXED);
            }
            else { //소수점이하구매 방어.
                //B. 구매금지시:
                throw new Error("IDO is finished. Left Total Supply of IDO token: " + totalSupply);
                //throw new Error("Request amount is bigger than totalSupply!, Left totalSupply of IDO token: " + totalSupply);
            }
        }

        //buyHistory 기록
        //alreadyBought = alreadyBought.plus(amount);//storage.mapPut(USER_BOUGHT_MAPKEY, tx.publisher, alreadyBought.toString());
        storage.mapPut(USER_BOUGHT_MAPKEY, tx.publisher, amount);


        totalSupply = totalSupply.minus(amount);
        storage.put(TOTAL_IDO_LEFT_KEY, totalSupply.toString());

        //pay : husd는 별도함수 필요.
        if(PAY_TOKEN === 'husd') {
            blockchain.callWithAuth("Contract3zCNX76rb3LkiAamGxCgBRCNn6C5fXJLaPPhZu2kagY3", "transfer", [PAY_TOKEN, tx.publisher, blockchain.contractName(), payAmountStr, "pay for ido_token"]);
        } else {
            blockchain.callWithAuth("token.iost", "transfer", [PAY_TOKEN, tx.publisher, blockchain.contractName(), payAmountStr, "pay for ido_token"]);
        }

        //get Ido token
        // blockchain.callWithAuth("token.iost", "transfer", [IDO_TOKEN, blockchain.contractName(), tx.publisher, amount, "ido_token bought"]);

    }

    claimToken() {
        if(!this._canClaimToken()) {
            throw new Error("it's not time for claim token.");
        }

        // 이중출금 막기
        if(this._alreadyClaim(tx.publisher)) {
            throw new Error("tx.publisher has already claimed token.");
        }

        const amount = this._boughtHistory(tx.publisher);
        if (amount.lte(0)) {
            throw new Error("The IDOToken of tx.publisher is zero.");
        }

        blockchain.callWithAuth("token.iost", "transfer", [IDO_TOKEN, blockchain.contractName(), tx.publisher, amount, "ido_token bought"]);
        storage.mapPut(ALREADY_CLAIM, tx.publisher, "true");
    }

    updateStartTime(startTime) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }
        storage.put(START_TIME_KEY, ""+startTime);
        let storedDuration = new Int64(storage.get(DURATION_KEY));

        storage.put(PERIOD_FINISH_KEY, new Int64(startTime).plus(storedDuration).toString());
    }

    updateDuration(durationSeconds) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }
        storage.put(DURATION_KEY, durationSeconds);
        let storedStartTime = new Int64(storage.get(START_TIME_KEY));

        storage.put(PERIOD_FINISH_KEY, storedStartTime.plus(durationSeconds).toString());
    }


    //param String : "true" or "false"
    //return void
    setOpen(open) {
        if (tx.publisher === blockchain.contractOwner()) {
            storage.put(OPEN_KEY, open);
        }
    }

    //param String : "true" or "false"
    //return void
    setClaimToken(open) {
        if (tx.publisher === blockchain.contractOwner()) {
            storage.put(CAN_CLAIM_TOKEN, open);
        }
    }

    withdrawPayToken(account) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }

        let balance = blockchain.callWithAuth("token.iost", "balanceOf", [PAY_TOKEN, blockchain.contractName()]);
        blockchain.callWithAuth("token.iost", "transfer", [PAY_TOKEN, blockchain.contractName(), account, new Float64(balance), ""]);
    }
}
module.exports = Test_buyIdo;