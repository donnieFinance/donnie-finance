const DON_SYMBOL = 'don';
const DON_ADDRESS = 'Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8';

const WITHDRAW_SEQ_KEY  = "withdrawSequence";
const WITHDRAW_MAPKEY = "withdrawMap";


// This is the root of the smart contract.  contract deployed:
class ErcDonWithdraw {
    init() {
        storage.put(WITHDRAW_SEQ_KEY, "0");
    }

    //Only owner can update.
    can_update(data) {
        return blockchain.requireAuth(ADMIN, "active");
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

        //2. swap용 don 전송
        //blockchain.callWithAuth(DON_ADDRESS, "transfer", [DON_SYMBOL, tx.publisher, blockchain.contractName(), amountStr, "swapWithdraw"]);//?blockchain.contractName() or admin check.
        blockchain.callWithAuth(DON_ADDRESS, "transfer", [DON_SYMBOL, tx.publisher, "donswap", amountStr, "swapWithdraw"]);//?blockchain.contractName() or admin check.

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

module.exports = ErcDonWithdraw;