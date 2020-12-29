
const DON_TOKEN = 'don';
const DON_ADDRESS = 'Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8';
const STAKE_TOKEN = 'iost'; //IOST


const START_TIME = 1608076800;      // 20201216:09:00(Seoul) in Seconds. 참조- https://www.epochconverter.com/ 배포 addr:Contract9k1RLedtrZnFZhFKQirX65bLFphSc6Ko4xRWZBRyACfT
const DURATION = 24 * 3600 * 30;    // 30일, in Seconds
// const START_TIME_NANO = new Int64(START_TIME).multi(1000000000);
const FEE_RATE = 10;
const TO_FIXED = 4;   //소수점 4자리까지 저장.

const OPEN_KEY  = "open";
const REWARD_PER_TOKEN_KEY  = "rewardPerToken";
const PERIOD_FINISH_KEY  = "periodFinish";
const START_TIME_KEY  = "startTime";
const REWARD_RATE_KEY  = "rewardRate";
const LASTUPDATE_TIME_KEY  = "lastUpdate";
const TOTAL_SUPPLY_KEY = "totalSupply";
const DEV_ADDR_KEY = "devAddr";

const USER_BALANCE_MAPKEY = "userbalance";
const USER_RPTP_MAPKEY = "userrptp";     // rptp=rewardPerTokenPaid
const USER_REWARD_MAPKEY = "userreward"; // Unclaimed rewards


class DonIostPool {
    init() {
        storage.put(TOTAL_SUPPLY_KEY, "0");
        storage.put(OPEN_KEY, "true");
        storage.put(REWARD_PER_TOKEN_KEY, "0");
        storage.put(PERIOD_FINISH_KEY, ""+(START_TIME + DURATION));
        storage.put(START_TIME_KEY, ""+START_TIME);
        storage.put(REWARD_RATE_KEY, "0");
        storage.put(DEV_ADDR_KEY, "0");
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    ////////////////////////StakeToken Wrapper/////////////////////

    updateStartTime(startTime) {
        storage.put(START_TIME_KEY, ""+startTime);
        storage.put(PERIOD_FINISH_KEY, ""+(new Int64(startTime).plus(DURATION)));
    }

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

    //for frontEnd: return String
    // getBalanceOf(accountId) {
    //     return this._balanceOf(accountId).toFixed(TO_FIXED);
    // }


    //newly added. - get RewardPerTokenPaid
    _userRewardPerTokenPaid(accountId) {
        if (storage.mapHas(USER_RPTP_MAPKEY, accountId)) {
            return new Float64(storage.mapGet(USER_RPTP_MAPKEY, accountId));
        }
        return new Float64(0);
    }

    //newly added - get unclaimed reward
    _rewards(accountId) {
        if (storage.mapHas(USER_REWARD_MAPKEY, accountId)) {
            return new Float64(storage.mapGet(USER_REWARD_MAPKEY, accountId));
        }
        return new Float64(0);
    }

    ////////////////////////functions///////////////////////
    //return void
    _updateReward(accountId) {
        let rewardPerTokenStored = this._rewardPerToken(); //Float64
        storage.put(REWARD_PER_TOKEN_KEY, rewardPerTokenStored.toString());

        let lastUpdateTime = this._lastTimeRewardApplicable(); //sec
        storage.put(LASTUPDATE_TIME_KEY, ""+lastUpdateTime);

        if (accountId) {
            //rewards[account] = earned(account);
            storage.mapPut(USER_REWARD_MAPKEY, accountId, this._earned(accountId).toString());
            //_userRewardPerTokenPaid[account] = rewardPerTokenStored;
            storage.mapPut(USER_RPTP_MAPKEY, accountId, rewardPerTokenStored.toString());
        }
    }


    //return int: Math.min(block.time, periodFinish)
    _lastTimeRewardApplicable() {

        let blockTimeSec = new BigNumber(block.time).div(1000000000).toNumber().toFixed(0); //sec in Number

        if (this._getPeriodFinish() < blockTimeSec ) {
            return this._getPeriodFinish();
        }
        return blockTimeSec;
    }

    //return Float64
    _rewardRate() {
        return new Float64(storage.get(REWARD_RATE_KEY));
    }

    //for frontEnd: return String
    // storage 직접호출하기
    // getRewardRate() {
    //     this._rewardRate().toFixed(TO_FIXED);
    // }


    //return Float64
    _rewardPerToken() {
        let rewardPerTokenStored = new Float64(storage.get(REWARD_PER_TOKEN_KEY));

        if (this._totalSupply().eq(new Float64(0))) {
            return rewardPerTokenStored;
        }

        let addingReward = new Float64(this._lastTimeRewardApplicable())
            .minus(new Float64(storage.get(LASTUPDATE_TIME_KEY)))
            .multi(this._rewardRate())
            .div(this._totalSupply());

        return rewardPerTokenStored.plus(addingReward);
    }

    //return Float64
    _earned(accountId) {
        let userBalance = this._balanceOf(accountId);
        return userBalance
            .multi(this._rewardPerToken().minus(this._userRewardPerTokenPaid(accountId)))
            .plus(this._rewards(accountId));
    }

    //for frontEnd: return String
    getEarned(accountId) {
        return this._earned(accountId).toFixed(TO_FIXED);
    }

    //return void.
    stake(amount) {

        // 참고 erc code
        // _totalSupply = _totalSupply.add(amount);
        // _balances[msg.sender] = _balances[msg.sender].add(amount);
        // stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        if(!this._isOpen()) {
            throw new Error("Pool is closed");
        }

        if(!this._isStart()) {
            throw new Error("POOL is not started");
        }

        this._updateReward(tx.publisher);

        let totalSupply = this._totalSupply();
        // throw new Error("_totalSupply : " + _totalSupply);

        totalSupply = totalSupply.plus(amount);
        storage.put(TOTAL_SUPPLY_KEY, totalSupply.toString());

        let balance = this._balanceOf(tx.publisher);
        // throw new Error("_balance : " + _balance + ",  tx.publisher : " +  tx.publisher);

        balance = balance.plus(amount);
        storage.mapPut(USER_BALANCE_MAPKEY, tx.publisher, balance.toString());

        blockchain.callWithAuth("token.iost", "transfer", [STAKE_TOKEN, tx.publisher, blockchain.contractName(), amount, "stake"]);
    }

    //return void.
    withdraw(amount) {

        // _totalSupply = _totalSupply.sub(amount);
        // _balances[msg.sender] = _balances[msg.sender].sub(amount);
        // stakeToken.safeTransfer(msg.sender, amount);

        if(!this._isStart()) {
            throw new Error("POOL is not started");
        }

        this._updateReward(tx.publisher);

        let balance = this._balanceOf(tx.publisher);
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

        blockchain.callWithAuth("token.iost", "transfer", [STAKE_TOKEN, blockchain.contractName(), tx.publisher, amount, "withdraw"]);
    }

    //return void
    exit() {
        this.withdraw(this._balanceOf(tx.publisher));
        this.getReward();
    }

    //return void
    getReward() {

        if(!this._isStart()) {
            throw new Error("POOL is not started");
        }

        this._updateReward(tx.publisher);

        let reward = this._earned(tx.publisher);
        if(reward.gt(0)) {
            storage.mapPut(USER_REWARD_MAPKEY, tx.publisher, "0");

            let devAddr = storage.get(DEV_ADDR_KEY);
            if(devAddr === "0") {
                blockchain.callWithAuth(DON_ADDRESS, "transfer", [DON_TOKEN, blockchain.contractName(), tx.publisher, reward, "reward"]);

            } else {
                let fee = reward.multi(new Float64(FEE_RATE).div(100));
                let rewardStr = reward.minus(fee).toFixed(TO_FIXED);
                blockchain.callWithAuth(DON_ADDRESS, "transfer", [DON_TOKEN, blockchain.contractName(), tx.publisher, rewardStr, "reward"]);
                blockchain.callWithAuth(DON_ADDRESS, "transfer", [DON_TOKEN, blockchain.contractName(), devAddr, reward.minus(new Float64(rewardStr)), "rewardFee"]); //exact fee
            }
        }
    }

    //return void
    setDevAddr(devAccount) {
        if (tx.publisher !== blockchain.contractOwner()){
            throw new Error("tx.publisher is not contractOwner.");
        }

        storage.put(DEV_ADDR_KEY, devAccount);
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
        return (new Int64(startTime).plus(DURATION));
    }

    //param String : "true" or "false"
    //return void
    setOpen(open) {
        if (tx.publisher === blockchain.contractOwner()) {
            storage.put(OPEN_KEY, open);
        }
    }

    //return void
    notifyRewardAmount(reward) {

        if (tx.publisher === blockchain.contractOwner() && this._isOpen()) { //onlyRewardDistribution, checkOpen

            this._updateReward(null);
            let blockTimeSec = new BigNumber(block.time).div(1000000000).toNumber().toFixed(0);

            if ( START_TIME < blockTimeSec ) {
                throw new Error("notifyRewardAmount Fail - already started:" + START_TIME + ", block.time:" + blockTimeSec );
            }else {
                //rewardRate = reward.div(DURATION);
                let rewardRate = new Float64(reward).div(DURATION);
                storage.put(REWARD_RATE_KEY, rewardRate.toString());
                //periodFinish = startTime.add(DURATION);
                //lastUpdateTime = startTime;
                storage.put(LASTUPDATE_TIME_KEY, "" + START_TIME);
                //don.mint(address(this),reward);
                blockchain.callWithAuth(DON_ADDRESS, "mint", [blockchain.contractName(), reward]); //call by admin
            }

        }else {
            throw new Error("notifyRewardAmount Authority Error:" + tx.publisher + ",isopen:" + isOpen );
        }
    }

    //return Float64
    // _checkRewardRate() {
    //
    //     return new Float64(0);
    // }

}
module.exports = DonIostPool;