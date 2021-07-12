
const TICKET_TOKEN = 'idoticket'; //TODO1 prod
const TICKET_ADDRESS = 'Contract3YuQXFRRUAFF9KMj8f1pL4QRXzQu7mhXdrF3HsVVwEce'; //TODO2 prod

const STAKE_TOKEN = 'iosthusdlp'; //TODO3 prod

const RATIO = 30;  //1 ticket per 20 LP

const START_TIME = 1622073600;      // 20210527:09:00(Seoul) in Seconds. 참조- https://www.epochconverter.com/ 배포 addr:Contract91z75xpdkmG3k4XwKPoamDSV7Yt9a1XWt8SdpSQtQ1mF
const DURATION = 24 * 3600 * 14;    //중요치 않음- 사용가능성이 있어 저장 중.  14일 in Seconds



const OPEN_KEY  = "open";
const PERIOD_FINISH_KEY  = "periodFinish";
const START_TIME_KEY  = "startTime";
const TOTAL_SUPPLY_KEY = "totalSupply";
const RATIO_KEY = "ticketRatio";
const DURATION_KEY = "duration";

const USER_BALANCE_MAPKEY = "userbalance";
const USER_UPDATETIME_MAPKEY = "userlaststake";



class IdoTicketIostHusdPool {
    init() {
        storage.put(TOTAL_SUPPLY_KEY, "0");
        storage.put(OPEN_KEY, "true");
        storage.put(PERIOD_FINISH_KEY, ""+(START_TIME + DURATION));
        storage.put(START_TIME_KEY, ""+START_TIME);
        storage.put(RATIO_KEY, ""+RATIO);
        storage.put(DURATION_KEY, ""+DURATION);
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    ////////////////////////StakeToken Wrapper/////////////////////
    _totalSupply() {
        return new Float64(storage.get(TOTAL_SUPPLY_KEY));
    }

    //for frontEnd: return String
    // getTotalSupply() {
    //     return this._totalSupply().toFixed(TO_FIXED);
    // }

    // accountId는 Account Name
    _balanceOf(accountId) {
        if (storage.mapHas(USER_BALANCE_MAPKEY, accountId)) {
            return new Float64(storage.mapGet(USER_BALANCE_MAPKEY, accountId));
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

    //return int(Sec)
    _getPeriodFinish() {
        let startTime = storage.get(START_TIME_KEY);
        let duration = storage.get(DURATION_KEY);

        return (new Int64(startTime).plus(duration));
    }

    ////////////////////////ido functions///////////////////////


    //stake STAKE_TOKEN and get TICKET_TOKEN - return void.
    stake(amountStr) {

        if(!this._isOpen()) {
            throw new Error("Ticketing is closed");
        }

        if(!this._isStart()) {
            throw new Error("Ticketing is not started");
        }

        if(amountStr * 0 != 0){
            throw new Error("Must be a valid numerical amount. ");
        }

        if (new Float64(amountStr).lt(RATIO)) {
            throw new Error("Must be larger than minimum:" + RATIO);
        }

        //amount가 250의 배수인지 체크.
        // if ( !(new Int64(amountStr).mod(RATIO).eq(0))) {
        //     throw new Error("Must stake multiple of ratio:" + RATIO);
        // }


        //stake토큰 차감을 250의 배수로 설정.
        let amount = (new Float64(amountStr).minus(new Float64(amountStr).mod(RATIO))).toFixed(0);

        let totalSupply = this._totalSupply();
        // throw new Error("_totalSupply : " + _totalSupply);

        totalSupply = totalSupply.plus(amount);
        storage.put(TOTAL_SUPPLY_KEY, totalSupply.toString());

        let balance = this._balanceOf(tx.publisher);

        balance = balance.plus(amount);
        storage.mapPut(USER_BALANCE_MAPKEY, tx.publisher, balance.toString());

        //사용자의 마지막 예치시간 저장 : 1주일간 lock용도
        let blockTimeSec = new BigNumber(block.time).div(1000000000).toNumber().toFixed(0); //string
        storage.mapPut(USER_UPDATETIME_MAPKEY, tx.publisher, blockTimeSec);

        //stake
        blockchain.callWithAuth("token.iost", "transfer", [STAKE_TOKEN, tx.publisher, blockchain.contractName(), amount, "stake"]);

        //ticketCount계산: 정수.
        let ticketCount = new Int64(amount).div(RATIO).toFixed(0);

        blockchain.callWithAuth(TICKET_ADDRESS, "mint", [blockchain.contractName(), ticketCount]);
        blockchain.callWithAuth(TICKET_ADDRESS, "transfer", [TICKET_TOKEN, blockchain.contractName(), tx.publisher, ticketCount, "idoTicket issue"]);
    }

    //withdraw With TICKET_TOKEN and get STAKE_TOKEN  - return void. (현재는 DON으로 withdraw -> Ticket으로 withdraw하는게 좋을듯.)
    withdrawWithTicket(ticketCount) {

        if(!this._isStart()) {
            throw new Error("Ticketing is not started");
        }

        //ticket은 정수로만 입력
        if (new Float64(ticketCount).toFixed(0) !== ticketCount) {
            throw new Error("ticketCount must be Integer");
        }

        //1주일간 lock check
        let userLastStakeTime = new Int64(storage.mapGet(USER_UPDATETIME_MAPKEY, tx.publisher));
        let blockTimeSec = new BigNumber(block.time).div(1000000000).toNumber().toFixed(0); //string

        if (userLastStakeTime.plus(24 * 3600 * 7).gt(blockTimeSec)){
            throw new Error("can withdraw after 1 week from the last stake time");
        }


        let balance = this._balanceOf(tx.publisher);
        let amount = new Int64(ticketCount).multi(RATIO).toFixed(0); //stake토큰 = ticket*250 :정수String

        if(balance.lt(amount)) {
            throw new Error("withdraw amount is bigger than _balance!!! ");
        }

        let totalSupply = this._totalSupply();
        if(totalSupply.lt(amount)) {
            throw new Error("withdraw amount is bigger than totalSupply!!! ");
        }

        balance = balance.minus(amount);
        storage.mapPut(USER_BALANCE_MAPKEY, tx.publisher, balance.toString());

        totalSupply = totalSupply.minus(amount);
        storage.put(TOTAL_SUPPLY_KEY, totalSupply.toString());

        //ticket Destroy
        blockchain.callWithAuth("token.iost", "destroy", [TICKET_TOKEN, tx.publisher, ticketCount]);

        //stake token withdraw.
        blockchain.callWithAuth("token.iost", "transfer", [STAKE_TOKEN, blockchain.contractName(), tx.publisher, amount, "withdrawWithTicket"]);
    }

    //return void
    exit() {
        this.withdrawWithTicket(this._balanceOf(tx.publisher).div(RATIO).toFixed(0)); //balance/250 = ticketCount
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
module.exports = IdoTicketIostHusdPool;