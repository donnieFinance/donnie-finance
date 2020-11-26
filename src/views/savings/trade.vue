<template>

  <div class="Trade background-gray content">
    
    <el-dialog :visible.sync="receiveAllModel" :append-to-body="true">
      <div class="depositModel model flex">
        <div class="depositContent donnieBor">
          <div class="close" @click="receiveAllModel = false">
            <img src="../../assets/model_close.png" alt />
          </div>
          <p class="tips flex">{{$t('HarvestWithdraw')}}({{mToUpperCase(xCoin)}})</p>
          <div class="balance">{{stakeBalance}} {{mToUpperCase(xCoin)}}</div>
          <div class="balance">{{donyBalance}} {{this.$tokenName}}</div>
          <div class="btnWarp">
            <el-button
              class="btn active flex"
              :loading="loading.receiveAll"
              @click="receiveAllEnter"
            >{{$t('HarvestWithdraw')}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="receiveModel" :append-to-body="true">
      <div class="depositModel model flex">
        <div class="depositContent donnieBor">
          <div class="close" @click="receiveCloseBtn">
            <img src="../../assets/model_close.png" alt />
          </div>
          <p class="tips flex">{{$t('HarvestDONY')}}</p>
          <div class="balance">{{donyBalance}}</div>
          <div class="number flex d_n">
            <input type="text" v-model="receiveDonyInput" disabled />
          </div>
          <div class="btnWarp">
            <el-button
              class="btn active flex"
              :loading="loading.receive"
              @click="receiveDonyEnter"
            >{{$t('get')}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="depositModel" :append-to-body="true">
      <div class="depositModel model flex">
        <div class="depositContent donnieBor">
          <div class="close" @click="depositCloseBtn">
            <img src="../../assets/model_close.png" alt />
          </div>
          <p
            class="tips active flex"
            v-if="depositModelType === 0"
          >{{$t('Deposit2')}} {{mToUpperCase(xCoin)}}</p>
          <div class="balance" v-if="depositModelType === 0">{{coinBalance}}</div>

          <p
            class="tips active flex"
            v-if="depositModelType === 1"
          >{{$t('withdraw')}} {{mToUpperCase(xCoin)}}</p>
          <div class="balance" v-if="depositModelType === 1">{{stakeBalance}}</div>

          <div class="number flex">
            <el-form :model="depositForm" :rules="rules" ref="depositForm">
              <el-form-item prop="number">
                <el-input class="inputNumber" v-model="depositForm.number" autocomplete="off"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="ratio flex">
            <div @click="depositRatio(.25)">25%</div>
            <div @click="depositRatio(.5)">50%</div>
            <div @click="depositRatio(.75)">75%</div>
            <div @click="depositRatio(1)">100%</div>
          </div>
          <div class="btnWarp">
            <div class="btn flex" @click="depositCloseBtn">{{$t('cancel')}}</div>
            <el-button
              class="btn active flex"
              v-if="depositModelType === 0 && stake.status === 1"
              :loading="loading.deposit"
              @click="depositEnter"
            >{{$t('Deposit2')}}</el-button>
            <el-button
              class="btn active flex"
              v-if="depositModelType === 1"
              :loading="loading.withdraw"
              @click="receiveEnter"
            >{{$t('withdraw')}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <div class="minWalletBtn flex" v-if="this.address && this.address.length>0">
      <!--<p>· {{hiddenAddress(this.address)}}</p>-->
      <p>· {{this.address}}</p>
    </div>

  
    <div class="coinHeader flex">
      <div class="countdownBox donnieBor flex">
        <div class="donnieFarm flex">
          <img :src="coin_img" alt />
          <p>{{mToUpperCase(xCoin)}}</p>
        </div>
        <p class="tips" v-if="[0,1,2].indexOf(coinListX.status) > -1">{{$t('EarnDonnie')}}</p>
        <p class="tips" v-if="[3].indexOf(coinListX.status) > -1">{{$t('closePool')}}</p>
        <p class="donnieToken flex"  @click="etherscan(contract.token)">{{$t(this.$tokenName+' TokenID')}}: '{{this.contract.token}}'</p>
        <TimeDown />
        <p class="stage" v-if="stake.status === 0 && !stake.startInWeek">{{$t('comingSoon')}}</p>
        <p class="stage" v-if="stake.status === 0 && stake.startInWeek">{{$t('countdown2')}}</p> <!--dony : 1주내 오픈으로 사용 -->

        <p class="stage" v-if="stake.status === 1">{{$t('countdown1')}}</p>
        <!--<p class="stage" v-if="stake.status === 2">{{$t('countdown2')}}</p>-->
      </div>
      
    </div>
    <div class="list flex">
      <div class="item donnieBor flex rainbow">
        <div class="coin flex">
          <img src="../../assets/coin_dony.png" />
          <p>{{this.$tokenName}}</p>
        </div>
        <div class="tips flex">
          <p class="total">{{donyBalance}}</p>
          <p>{{$t('harvest')}}</p>
        </div>
        <div class="btn flex" v-if="!address" @click="changeMetaMask">{{$t('connectWallet')}}</div>
        <div
          :class="(donyBalance === '...' || donyBalance === 0) ? 'btn flex disable': 'btn flex'"
          v-if="address"
          @click="receiveBtn"
        >{{$t('get')}}</div>
      </div>
      <div class="item donnieBor flex">
        <div class="coin flex">
          <img :src="coin_img" />
          <p>{{mToUpperCase(xCoin)}}</p>
        </div>
        <div class="tips flex">
          <p class="total">{{stakeBalance}}</p>
          <p>{{mToUpperCase(xCoin)}} {{$t('Mining')}}</p>
        </div>
        <div class="btn flex" v-if="!address" @click="changeMetaMask">{{$t('connectWallet')}}</div>
        <div class="btnWrap flex" v-if="address">
          <!--TODO allowance가 필요없기에 일단 주석처리 Wallet Authorization이 1 iost를 stake하도록 동작 이상. 아래에 stakeBalance = 0일때에도 deposit 버튼 나오도록 수정함.-->
          <!--<el-button-->
            <!--class="btn btni anbtni flex"-->
            <!--@click="depositAuth(0,1)"-->
            <!--v-if="allowance === 0 && parseFloat(stakeBalance) === 0"-->
            <!--:loading="loading.auth"-->
          <!--&gt;{{$t('WalletAuthorization')}}</el-button>-->
          <el-button
            class="withdraw btn btni flex"
            @click="depositBtn(1)"
            v-if="parseFloat(stakeBalance) > 0"
            :loading="loading.withdraw"
          >{{$t('withdraw')}}</el-button>
          <el-button
            :class="isOpen && coinListX.status > 0 ? 'btn btni flex' : 'btn btni flex disable'"
            @click="depositBtn(0)"
            v-if="(parseFloat(stakeBalance) >= 0) && coinListX.status !== 3"
            :loading="loading.deposit"
          >{{$t('Deposit2')}}</el-button>
        </div>
      </div>
    </div>
    <div class="coinFooter flex">
      <div
        class="btn flex"
        @click="receiveAllModel = true"
      >{{$t('HarvestWithdraw')}}({{mToUpperCase(xCoin)}})</div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TimeDown from '@/components/timeDown';
import errorHandler from '@/utils/errorHandler';
import { hiddenAddress } from '@/utils/index';
import BigNumber from 'bignumber.js';
import { isWebMobile, keepDecimalsDown, mToUpperCase, numToString } from '@/utils/index';
import axios from 'axios'

export default {
  components: {
    TimeDown
  },
  data () {
    const validateNumber = (rule, value, callback) => {
      let numReg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,8})?$/;

      if (value === '') {
        callback(new Error(this.$t('CannotEmpty')));
        return;
      }
      if ((value + '').split('.').length > 2) {
        callback(new Error(this.$t('ErrorBalance')));
        return;
      }
      if ((value + '').indexOf('.') > -1 && (value + '').split('.')[1] === '') {
        callback(new Error(this.$t('ErrorBalance')));
        return;
      }
      if (value == 0) {
        callback(new Error(this.$t('insufficientBalance')));
        return;
      }
      if (!numReg.test(value)) {
        callback(new Error(this.$t('ErrorBalance')));
        return;
      }
      if (this.depositModelType === 0 && value > this.coinBalance) {
        this.depositForm.number = this.coinBalance;
        return;
      }
      if (this.depositModelType === 1 && value > this.stakeBalance) {
        this.depositForm.number = this.stakeBalance;
        return;
      }

      callback();
    };
    return {
      donyBalance: '...',
      coinBalance: '...',
      coinBalanceStr: 0,
      stakeBalance: '...',
      receiveDonyInput: '',
//      allowance: 0,  // TODO 토큰의 approve가 필요없기에 불필요함...  (lydia)
      depositModelType: 1,
      depositModel: false,
      receiveModel: false,
      receiveAllModel: false,
      precision: 0,  // 사용 안하는듯 (lydia)
      decimals: 0,   // 사용 안하는듯 (lydia)
      coin_img: '',
      coinListCallBack: false,
      hiddenAddress: hiddenAddress, // 주소 중간을 줄일 필요가 없기에 사용 안함 (lydia)
      isOpen: true,
      depositForm: {
        number: ''
      },
      rules: {
        number: [{ validator: validateNumber, trigger: 'blur' }]
      },
      coinListX: {
        status:0
      },
      mToUpperCase: mToUpperCase,
      numToString: numToString,
      loading: {
        auth: false,
        deposit: false,
        withdraw: false,
        receive: false,
        receiveAll: false
      }
    }
  },
  computed: {
    ...mapState(['network', 'lang', 'address', 'stake', 'xCoin', 'coinList', 'reloadTime']),
  },
  watch: {
    address (e) {
      if (!e) {
        this.stakeBalance = '...';
        this.coinBalance = '...';
        this.donyBalance = '...';
      }
    },
    coinList () {
      // Only once
      if (this.address && !this.coinListCallBack) {
        this.coinListCallBack = true;
        this.getBalanceAll()
      }
      let coinListX = this.coinList.filter(e => (e.name === this.xCoin));
      this.coinListX = coinListX.length > 0 ? coinListX[0] : '';
    },
    reloadTime () {
      if (this.coinList.length > 0 && this.address) {
        this.getBalanceAll()
      }
    }
  },
  created () {
    let coin = this.$route.query.coin;

    //TOKEN_ADD5
      //coin = 'bly'
    //if (coin && ['iost', 'bly', 'usdt', 'lend'].indexOf(coin.toLowerCase()) > -1) {
    if (coin && ['iost', 'don'].indexOf(coin.toLowerCase()) > -1) {
      this.$store.commit('updateSelectCoin', coin.toLowerCase());
    } else {
      this.$message.error('Unsupported!');
      setTimeout(e => {
        this.$router.push('/farm') // TODO farm ??
      }, 3000)
      return;
    }

    if (this.coinList.length > 0 && this.address) {
      this.getBalanceAll()
    }
    if (isWebMobile()) {
      this.changeMetaMask();
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions(['getIostAddress']),
    etherscan (tokenId) {
        window.open("https://www.iostabc.com/token/" + tokenId)
    },
    getBalanceAll () {
      let precision = this.coinList.filter(e => (e.name === this.xCoin))[0].precision;
      let decimals = this.coinList.filter(e => (e.name === this.xCoin))[0].decimals;
      this.coin_img = this.coinList.filter(e => (e.name === this.xCoin))[0].img;
      this.isOpen = this.coinList.filter(e => (e.name === this.xCoin))[0].isOpen;
      this.precision = precision;
      if (decimals) {
        this.decimals = eval(`1e${decimals}`);
        this.getBalance()
      }
    },
    depositRatio (e) {

      if (this.depositModelType === 0) {
        this.depositForm.number = this.coinBalance * e;
      } else if (this.depositModelType === 1) {
        this.depositForm.number = this.stakeBalance * e;
      }
      this.$refs.depositForm.validateField('number');
    },
    receiveRatio (e) {
      this.receiveDonyInput = this.donyBalance * e;
    },
    depositEnter () {
      this.$refs.depositForm.validate((valid) => {
        if (valid) {
          this.depositAuth(0, this.depositForm.number);
        } else {
          return false;
        }
      });
    },
    receiveEnter () {
      this.$refs.depositForm.validate((valid) => {
        if (valid) {
          this.depositAuth(1, this.depositForm.number);
        } else {
          return false;
        }
      });
    },
    receiveDonyEnter () {
      if (this.receiveDonyInput && this.receiveDonyInput !== 0) {
        this.depositAuth(2, this.receiveDonyInput);
      }
    },
    receiveAllEnter () {
      this.depositSend(3, new BigNumber(this.receiveDonyInput));
    },
    depositAuth (type, input) {
      console.log("!!! depositAuth : ", type, input)
//      let amount = type !== 2 ? input * this.decimals : input * 1e8;
//      console.log('auth type,decimal:' + type, type !== 2 ? this.decimals: 8)
      let amount = this.numToString(new BigNumber(input)); // TODO iost는 decimal 곱하지 않고 입력한 숫자 그대로 보내는게 맞는듯

      if ([0, 1, 2].indexOf(type) > -1) {
//          console.log("[0, 1, 2].indexOf(type) > -1 ", [0, 1, 2].indexOf(type))
        this.depositSend(type, amount);
        return;
      }
//      if (this.allowance >= input) {
//        this.depositSend(type, amount);
//        return
//      }
      if (this.coinBalance === '...') {
        errorHandler({ code: 50009 })
        return;
      }
      this.getBalance();
      if (this.depositModelType === 0 && this.depositModel) {
        this.depositSend(0, amount);
        return;
      }
      this.depositModelType = 0;
      this.depositModel = true;
    },
    depositSend (type, amount) {
       // console.log("!!! depositAuth : ", type, amount)
        let contractID = this.contract[this.xCoin].pool;
        switch (type) {
        case 0:
          this.loading.deposit = true;
          console.log('stake amount:' + amount)
          console.log(contractID);
          let tx = IWalletJS.iost.callABI(contractID, "stake", [
              amount,
          ]);
          tx.addApprove('iost', amount)
          tx.amount_limit.push({ token: "*", value: "unlimited" });
          IWalletJS.iost.signAndSend(tx).on("success", (succ) => {
              this.$message({
                  message: 'Success',
                  type: 'success'
              });
            this.loading.deposit = false;
            this.depositModel = false;
            console.log("succ", succ);

          }).on("failed", (fail) => {
              errorHandler(fail);
              this.loading.deposit = false;
              this.depositModel = false;
              console.log("fail", fail);
          });

          break;
        case 1:
          this.loading.withdraw = true;

          let txWithdraw = IWalletJS.iost.callABI(contractID, "withdraw", [
              amount,
          ]);
          txWithdraw.addApprove('iost', amount)
          txWithdraw.amount_limit.push({ token: "*", value: "unlimited" });
          IWalletJS.iost.signAndSend(txWithdraw).on("success", (succ) => {
              this.$message({
                  message: 'Success',
                  type: 'success'
              });
              this.loading.withdraw = false;
              this.depositModel = false;
              console.log("succ", succ);

          }).on("failed", (fail) => {
              errorHandler(fail);
              this.loading.withdraw = false;
              this.depositModel = false;
              console.log("fail", fail);
          });

          break;
        case 2:
          this.loading.receive = true;

            let txGetReward = IWalletJS.iost.callABI(contractID, "getReward", []);
            txGetReward.gasLimit = 200000;  // gasLimit를 늘려줌
            IWalletJS.iost.signAndSend(txGetReward).on("success", (succ) => {
                this.$message({
                    message: 'Success',
                    type: 'success'
                });
                this.loading.receive = false;
                this.receiveModel = false;
                console.log("succ", succ);

            }).on("failed", (fail) => {
                errorHandler(fail);
                this.loading.receive = false;
                this.receiveModel = false;
                let message = JSON.parse(fail.substring(7));
                if(message.code === 2) {
                  alert(this.$t('message.lackOfIgas') + txGetReward.gasLimit + '\n' + this.$t('message.chargeIgasTime') )
                }

            });

          break;
        case 3:
          this.loading.receiveAll = true;

          let txExit = IWalletJS.iost.callABI(contractID, "exit", []);
          txExit.gasLimit = 300000;  // gasLimit를 늘려줌
          IWalletJS.iost.signAndSend(txExit).on("success", (succ) => {
              this.$message({
                  message: 'Success',
                  type: 'success'
              });
              this.loading.receiveAll = false
              this.receiveAllModel = false;
              console.log("succ", succ);

          }).on("failed", (fail) => {
              errorHandler(fail);
              this.loading.receiveAll = false
              this.receiveAllModel = false;
              console.log("fail", fail);
              let message = JSON.parse(fail.substring(7));
              if(message.code === 2) {
                alert(this.$t('message.lackOfIgas') + txExit.gasLimit + '\n' + this.$t('message.chargeIgasTime') )
              }
          });

          break;
      }
    },
    depositCloseBtn () {
      this.depositModel = false;
    },
    depositBtn (e) {
      
      if(e == 0 && this.coinListX.status === 0){
        this.$message({
              message: 'Not Deposit',
              type: 'warning'
            });
        return false;
      }

      this.depositForm.number = '';
      if (this.isOpen) {
        this.depositModelType = e;
        this.depositModel = true;
      }
    },
    receiveCloseBtn () {
      this.receiveModel = false;
    },
    receiveBtn () {
      this.depositForm.number = '';
      if (this.donyBalance === '...' || this.donyBalance === 0) {
        return;
      }
      this.receiveDonyInput = this.donyBalance;
      this.receiveModel = true;
    },

    async getBatchContractStorage(e) {
        const tempIost = window.IWalletJS.newIOST(window.IOST);
        const iostHost = tempIost.currentRPC._provider._host;

        // console.log("***************** ", e)
        // console.log("***************** ", this.contract[e].pool)
        let res = await axios.post(iostHost + "/getBatchContractStorage", {
            id: this.contract[e].pool,
            key_fields: [
                {key: "userbalance", field:this.address},
                {key: "rewardPerToken"},
                {key: "totalSupply"},
                {key: "rewardRate"},
                {key: "periodFinish"},
                {key: "lastUpdate"},
                {key: "userrptp", field:this.address},
                {key: "userreward", field:this.address},
            ],

            by_longest_chain: true
        });
        return res.data.datas;
    },

    getBalance () {

        this.getBatchContractStorage(this.xCoin).then(result => {

            // console.log('===========iost-PeriodFinish:' + result)

            let userBalance = result[0];

            if (userBalance === "null") {
                userBalance = 0;
            }
            userBalance = parseFloat(userBalance);

            this.stakeBalance = userBalance;

            let rewardPerToken = parseFloat(result[1]);
            let totalSupply = parseFloat(result[2]);
            let rewardRate = parseFloat(result[3]);
            let periodFinish = parseFloat(result[4]);
            let lastUpdate = parseFloat(result[5]);
            let userRewardPerTokenPaid = result[6];
            if (userRewardPerTokenPaid === "null") {
                userRewardPerTokenPaid = 0;
            }
            userRewardPerTokenPaid = parseFloat(userRewardPerTokenPaid);

            let userReward = result[7];
            if (userReward === "null") {
                userReward = 0;
            }
            userReward = parseFloat(userReward);

            let lastTimeRewardApplicable = periodFinish;  // block.time 가져와서 비교하기
            const iost = window.IWalletJS.newIOST(window.IOST);
            const iostHost = iost.currentRPC._provider._host;
            axios.get(iostHost + "/getNodeInfo").then((data) => {
                let serverTime = parseFloat((data.data.server_time / (10 ** 9)).toFixed(0));
//                console.log('!!!! server_time : ', serverTime);
//                console.log(periodFinish);
                if (periodFinish >= serverTime ) {
                    lastTimeRewardApplicable = serverTime;
                }

//                console.log("lastTimeRewardApplicable : ", lastTimeRewardApplicable);
//                console.log("lastUpdate: ", lastUpdate);
//                console.log("rewardRate: ", rewardRate);
//                console.log("totalSupply : ", totalSupply);
//                console.log("rewardPerToken : ", rewardPerToken);
//                console.log("userReward : ", userReward);
//                console.log("userRewardPerTokenPaid : ", userRewardPerTokenPaid);
                let addingReward = 0;
                if(totalSupply > 0 ) {
                    addingReward = (lastTimeRewardApplicable - lastUpdate) * rewardRate / totalSupply;
                }

                rewardPerToken = rewardPerToken + addingReward;
                userBalance = userBalance * (rewardPerToken - userRewardPerTokenPaid) + userReward;
//                console.log("addingReward : ", addingReward);
//                console.log("userBalance : ", userBalance);
//                console.log("rewardPerToken : ", rewardPerToken);
                this.donyBalance = parseFloat(userBalance.toFixed(4));

            }).catch(err => {
                console.log(err);
            });

        });

//        console.log("this.coinList : ", this.coinList);
//        console.log("this.contract : ", this.contract);
//        console.log("this.xCoin : ", );
        const iost = window.IWalletJS.newIOST(window.IOST);
        const iostHost = iost.currentRPC._provider._host;
        axios.get(iostHost + "/getTokenBalance/" + this.address + "/" + this.contract[this.xCoin].tokenName + "/1").then((data) => {
//              console.log('data : ',data);
            this.coinBalance = data.data.balance;
            this.coinBalanceStr = data.data.balance;
        }).catch(err => {
            console.log(err);
        });

    },
    changeMetaMask () {
      this.getIostAddress()
    }
  }
}
</script>

<style lang="less" scoped>
@import "./trade.less";
</style>
