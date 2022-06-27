const TOKEN_NAME = "iwavax";

const fullName = "iost_wrapped_avax";
const decimal = 8;
const totalSupply = 20000000; //max iwAVAX
const admin = "donmanager";


const WITHDRAW_SEQ_KEY  = "withdrawSequence";
const WITHDRAW_MAPKEY = "withdrawMap";

class IwAvax {
    init() {
        blockchain.callWithAuth("token.iost", "create", [
            TOKEN_NAME,
            blockchain.contractName(),
            totalSupply,
            {
                fullName,
                decimal,
                canTransfer: true,
                onlyIssuerCanTransfer: true,
            }
        ]);

        storage.put(WITHDRAW_SEQ_KEY, "0");
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    _amount(amount) {
        return new BigNumber(new BigNumber(amount).toFixed(decimal));
    }

    _checkToken(token_name) {
        if (token_name !== TOKEN_NAME) {
            throw new Error("token not exist");
        }
    }

    issue(token_name, to, amount) {
        if (!blockchain.requireAuth(admin, "active")) {
            throw new Error("permission denied");
        }
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "issue", [token_name, to, amount]);
    }

    transfer(token_name, from, to, amount, memo) {

        this._checkToken(token_name);
        amount = this._amount(amount);

        if (!from.startsWith('Contract') && !to.startsWith('Contract')) {
            throw new Error("transfer between users denied");
        }

        blockchain.callWithAuth("token.iost", "transfer", [token_name, from, to, amount, memo])
    }

    transferFreeze(token_name, from, to, amount, timestamp, memo) {
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "transferFreeze", [token_name, from, to, amount, timestamp, memo]);
    }

    destroy(token_name, from, amount) {
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "destroy", [token_name, from, amount]);
    }

    // call abi and parse result as JSON string
    _call(contract, api, args) {
        const ret = blockchain.callWithAuth(contract, api, args);
        if (ret && Array.isArray(ret) && ret.length >= 1) {
            return ret[0];
        }
        return null;
    }

    balanceOf(token_name, owner) {
        this._checkToken(token_name);
        return this._call("token.iost", "balanceOf", [token_name, owner]);
    }

    supply(token_name) {
        this._checkToken(token_name);
        return this._call("token.iost", "supply", [token_name]);
    }

    totalSupply(token_name) {
        this._checkToken(token_name);
        return this._call("token.iost", "totalSupply", [token_name]);
    }

    //return Int64(seq + 1)
    _withdrawSequence() {

        let nowSeq = storage.get(WITHDRAW_SEQ_KEY);
        let nextSeq = new Int64(nowSeq).plus(1);

        storage.put(WITHDRAW_SEQ_KEY, nextSeq.toString());
        return nextSeq;
    }

    //return secconds.
    _nowTimeSec() {
        return new BigNumber(block.time).div(1000000000).toNumber().toFixed(0);
    }

    //irc -> erc swap출금.
    swapWithdraw(amountStr, ercAccount) {

        //2. swap용 iw토큰 반환. //destory로 대체
        //blockchain.callWithAuth("token.iost", "transfer", [TOKEN_NAME, tx.publisher, blockchain.contractName(), amountStr, "swapWithdraw"]);//?blockchain.contractName() or admin check.
        this.destroy(TOKEN_NAME, tx.publisher, amountStr);

        //3.status: 0:request, 1:inProcess: 2:done
        let oneData = {account:tx.publisher, amount:amountStr, ercAccount:ercAccount, requestTime:this._nowTimeSec(), status:'0'};

        //4. 요청key
        let withdrawSeq = this._withdrawSequence();
        storage.mapPut(WITHDRAW_MAPKEY, withdrawSeq.toString(), JSON.stringify(oneData));

    }

    //for admin : swap progress update
    updateStatus(withdrawSeqStr, statusStr) {

        //admin일때만 처리.
        if (tx.publisher === blockchain.contractOwner()) {

            //혹시나 없는지 check
            if (!storage.mapHas(WITHDRAW_MAPKEY, withdrawSeqStr)) {
                throw new Error("updateStatus No Data Error" + tx.publisher + " (withdrawSeq, status)-" + withdrawSeqStr + "," +  statusStr);
            }

            //data 처리
            let oneData = JSON.parse(storage.mapGet(WITHDRAW_MAPKEY, withdrawSeqStr));
            oneData.status = statusStr;

            storage.mapPut(WITHDRAW_MAPKEY, withdrawSeqStr, JSON.stringify(oneData));

        }else {
            throw new Error("updateStatus Authority Error:" + tx.publisher + " (withdrawSeq, status)-" + withdrawSeqStr + "," +  statusStr);
        }
    }

}

module.exports = IwAvax;

