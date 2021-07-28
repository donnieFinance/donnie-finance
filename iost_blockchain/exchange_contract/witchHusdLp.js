const TOKEN_NAME = "witchhusdlp";
const fullName = "witch_husd_LiquidityPool";
const decimal = 8;
const totalSupply = 10000000000;

const minterKey = 'minter';

class WitchHusdLp {
    init() {
        blockchain.callWithAuth("token.iost", "create", [
            TOKEN_NAME,
            blockchain.contractName(),
            totalSupply,
            {
                fullName,
                decimal,
                canTransfer: true,
            }
        ]);

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


    //minter가 호출가능.
    issue(token_name, to, amount) {

        //minter만 issue가능.
        if (!this._isMinter(to)) {
            throw new Error("only to minter, can be issued:" + tx.publisher);
        }

        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "issue", [token_name, to, amount]);
    }

    transfer(token_name, from, to, amount, memo) {
        this._checkToken(token_name);
        amount = this._amount(amount);
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


    addMinter(_minter) {
        //실행자=owner체크,  _minter: exchangeSwapContract주소
        if (tx.publisher === blockchain.contractOwner()) {
            storage.mapPut(minterKey, _minter, _minter);
        } else {
            throw new Error(_minter + " addMinter : No Authority");
        }
    }

    removeMinter(_minter) {
        //실행자=owner체크,  _minter: exchangeSwapContract주소
        if (tx.publisher === blockchain.contractOwner()) {
            storage.mapDel(minterKey, _minter);
        } else {
            throw new Error(_minter + " removeMinter : No Authority");
        }
    }

    _isMinter(_minter) {
        return storage.mapHas(minterKey, _minter);
    }

    //minter만 호출가능.
    mint(_minter, _amount) {
        if (this._isMinter(_minter)) {
            console.log('mint to:' + _minter + ' amount:' + _amount);
            //in Don contract : this.issue(tokenSymbol, _minter, _amount);

            _amount = this._amount(_amount);
            const supplyInt = new Float64(this.supply(TOKEN_NAME));
            if( (supplyInt.plus(_amount)).lte(totalSupply)) {
                this.issue(TOKEN_NAME, _minter, _amount);

            } else {
                throw new Error("Total mint amount is over totalSupply ");
            }

        } else {
            throw new Error(_minter + "is not a minter");
        }
    }


}

module.exports = WitchHusdLp;

