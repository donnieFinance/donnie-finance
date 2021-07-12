const TICKET_TOKEN = 'idoticket';


const START_TIME = 1626048000;      // 20210712:09:00(Seoul, 금요일) in Seconds. 참조- https://www.epochconverter.com/ 배포 addr:Contract4CKbFYJVNbfEBoSVtGNsFsP4zXLDLYVGSbTXD8oA3Gf8
const DURATION = 24 * 3600 * 2;     //상용은 참여가능기간: 2일로 할예정 (개발은 1주일~2주일.)

//tier1
const MIN_TICKET = 10;
const MAX_TICKET = 100;

//tier2 (whale)
// const MIN_TICKET = 101;
// const MAX_TICKET = 10000; //만개 이하



//MAPKEY
const USER_TICKET_BALANCE = "userTicketBalance";
const USER_WEIGHTED_TICKET = "userWeightedTicket";
const WINNER_USER = "winner_user";

//KEY
const APPLY_USER_LIST = "applyUserList"
const DRAW_FINISHED = "draw_finished"

const OPEN_KEY  = "open";
const PERIOD_FINISH_KEY  = "periodFinish";
const START_TIME_KEY  = "startTime";
const DURATION_KEY = "duration";

class Test_applyWhitelist {
    init() {
        storage.put(APPLY_USER_LIST, "");

        //basic
        storage.put(OPEN_KEY, "true");
        storage.put(PERIOD_FINISH_KEY, ""+(START_TIME + DURATION));
        storage.put(START_TIME_KEY, ""+START_TIME);
        storage.put(DURATION_KEY, ""+DURATION);
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    balanceOfUserTicket(accountId) {
        if(storage.mapHas(USER_TICKET_BALANCE, accountId)) {
            return new Float64(storage.mapGet(USER_TICKET_BALANCE, accountId))
        }
        return new Float64(0);
    }

    balanceOfWeightedTicket(accountId) {
        if(storage.mapHas(USER_WEIGHTED_TICKET, accountId)) {
            return new Float64(storage.mapGet(USER_WEIGHTED_TICKET, accountId))
        }
        return new Float64(0);
    }

    getApplyUserList() {
        return storage.get(APPLY_USER_LIST);
    }

    checkUserWhiteListed(accountId) {
        return storage.mapGet(WINNER_USER, accountId);
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

    _call(contract, api, args) {
        const ret = blockchain.callWithAuth(contract, api, args);
        if (ret && Array.isArray(ret) && ret.length >= 1) {
            return ret[0];
        }
        return null;
    }

    // whitelist에 지원하기
    apply() {
        if(!this._isOpen()) {
            throw new Error("whiteListApply is not opened or closed for a while");
        }

        if(!this._isStart()) {
            throw new Error("whiteListApply is not started");
        }

        if(!this._isPeriod()) {
            throw new Error("whiteListApply is already finished");
        }

        let ticketAmountStr = this._call("token.iost", "balanceOf", [TICKET_TOKEN, tx.publisher]);

        if(ticketAmountStr * 0 != 0) {
            throw new Error("Must be a valid numerical amount. ");
        }

        let balance = new Float64(ticketAmountStr);
        if(balance.lt(MIN_TICKET)) {
            throw new Error("The minimum ticketToken balance is " + MIN_TICKET);
        }
        if(balance.gt(MAX_TICKET)) {
            throw new Error("The maximum ticketToken balance is " + MAX_TICKET);
        }

        //두번 apply안되게 방지.
        // if (storage.mapHas(USER_TICKET_BALANCE, tx.publisher)) {
        //     throw new Error("Already applied. You can apply only once.");
        // }

        // 가중치 계산
        let weightedBalance = balance;
        if(balance < 10) { // 기본값
        } else if(balance < 30) {
            weightedBalance = balance * 1.1;
        } else if(balance < 50) {
            weightedBalance = balance * 1.15;
        } else if(balance < 70) {
            weightedBalance = balance * 1.2;
        } else if(balance < 100) { //100=1.3
            weightedBalance = balance * 1.25;
        } else if(balance < 300) { //300=1.4
            weightedBalance = balance * 1.3;
        } else if(balance < 500) { //500=1.5
            weightedBalance = balance * 1.4;
        } else {
            weightedBalance = balance * 1.5;
        }

        // userList에 tx.publisher가 있는지 확인 한 후에 없으면 추가
        let userList = storage.get(APPLY_USER_LIST);
        if(userList.length === 0) {
            let userArray = [tx.publisher];
            userList = JSON.stringify(userArray);
            storage.put(APPLY_USER_LIST, userList);

        } else if (!storage.mapHas(USER_TICKET_BALANCE, tx.publisher)) {
                let userArray = JSON.parse(userList);
                userArray.push(tx.publisher);
                userList = JSON.stringify(userArray);
                storage.put(APPLY_USER_LIST, userList);
        }

        storage.mapPut(USER_TICKET_BALANCE, tx.publisher, ticketAmountStr);
        storage.mapPut(USER_WEIGHTED_TICKET, tx.publisher, weightedBalance.toFixed(2));
    }

    drawWhiteList(accountId) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }

        // 뽑힌 account는 저장하기
        storage.mapPut(WINNER_USER, accountId, "true");
    }

    completeKyc(accountId) {
        if (tx.publisher !== blockchain.contractOwner()) {
            throw new Error("tx.publisher is not contractOwner.");
        }
        let whiteListed = storage.mapGet(WINNER_USER, accountId);
        if (whiteListed === "kyc") {
            throw new Error("tx.publisher's kyc is already done.");
        }

        if (whiteListed !== "true") {
            throw new Error("tx.publisher is not whitelisted.");
        }

        // 뽑힌 account는 저장하기
        storage.mapPut(WINNER_USER, accountId, "kyc");
    }

    finishDraw() {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }
        storage.put(DRAW_FINISHED, "true");
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

}
module.exports = Test_applyWhitelist;