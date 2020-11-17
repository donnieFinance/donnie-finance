<template>
  <div id="app">
      <HeaderBar v-if="barShow && isRouterAlive" />
      <router-view v-if="isRouterAlive" v-show="!routerLoading" />
      <FooterBar v-if="barShow && isRouterAlive" :total="totalPriceUsdt" />
    </div>
</template>

<script>
import HeaderBar from '@/components/header.vue';
import FooterBar from '@/components/footer.vue';
import { isWebMobile } from '@/utils/index';
import { mapState, mapActions } from 'vuex';
import { toNonExponential, leftTime } from '@/utils/index';
//import { getPrice } from '@/service/CommonService'
import { initContracts } from '@/utils/common';
import errorHandler from '@/utils/errorHandler';
import BigNumber from 'bignumber.js'
import Vue from 'vue'
import Cookie from 'js-cookie'
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import Contract2 from 'web3-eth-contract'
import Server from './property'
import axios from 'axios'

//iostTest
import IOST from 'iost'

export default {
  name: 'App',
  components: {
    HeaderBar,
    FooterBar
  },
  computed: {
    ...mapState(['barShow', 'stake', 'reloadTime', 'walletLock', 'lang', 'address', 'isRouterAlive', 'network', 'routerLoading']),
  },
  data () {
    return {
      startTimeInterval: '',
      timeInterval: '',
      openTimeInterval: '',//시작시간 일주일 전 부터 사용되는 인터벌 id
      DONYPrice: '',
      totalPriceUsdt: '',
      coinList: [   //TOKEN_ADD1 - list
        {
            name: 'iost',
            img: require('./assets/coin_iost.png'),
            total: '...',
            usd: 0,
            totalBalance: 0,
            status: 0,
            isOpen: true,
            decimals: 8,
            precision: 8,
            rate: 0,
        },
//        {
//            name: 'bly',
//            img: require('./assets/coin_bly.png'),
//            total: '...',
//            usd: 0,
//            totalBalance: 0,
//            status: 0,
//            isOpen: true,
//            decimals: 18,
//            precision: 8,
//            rate: '',
//        },
//        {
//          name: 'usdt',
//          img: require('./assets/coin_usdt.png'),
//          total: '...',
//          usd: 0,
//          totalBalance: 0,
//          status: 0,
//          isOpen: true,
//          decimals: 6,
//          precision: 8,
//          rate: '',
//        },
//
//        {
//          name: 'lend',
//          img: require('./assets/coin_lend.png'),
//          total: '...',
//          usd: 0,
//          totalBalance: 0,
//          status: 0,
//          isOpen: true,
//          decimals: 18,
//          precision: 8,
//          rate: '',
//        },

      ]
    }
  },
  watch: {
    reloadTime () {
      this.getTotalSupply().then(e => {
        this.postAssetsInfo(JSON.parse(JSON.stringify(this.coinList)));
      })
    },
    lang (e) {
      this.changeIcon(e)
    },
    address() {
        this.statusChange();
    }
    // '$route.path' (path) {
    //   if(path === '/') {
    //     this.barShow = false
    //   }
    //   // if(this.$router.currentRoute.path === '/') 
    // }
  },
  async mounted () {

    //iostTest ////////////////////////////////
    //test code:
    this.getCoinPrice(); //TODO delete필요. 20201027 현재 getCoinPrice까지 코드호출이 안되서 추가해 놓은 상태..


    //TODO ISOT.web3.provider ?
    setTimeout(() => {

      if (!window.IWalletJS) {
        this.$store.commit('updateDisNotConnet', true);
      } else {
        this.$store.commit('updateDisNotConnet', false);
      }

        this.getIostAddress();

      this.init();
    }, 1000)

    // this.barShow = isWebMobile() ? false : true;
    this.changeIcon(Cookie.get('lang') || 'en-US')
  },
  methods: {
    ...mapActions(['postAssetsInfo','getIostAddress']),
    init () {
      Vue.prototype.contract = initContracts();
      Vue.prototype.contractSend = initContracts(); //initContractsSend();



      setInterval(() => {
        this.$store.commit('updateReload', Date.parse(new Date()))
      }, 15000) // TODO 토큰 잔액 새로고침 타이머 시간 조절
      this.getContractDetail();
    },
    getContractDetail () {
      console.log('getCoinDetail:')
      Promise.all([
        this.getIsOpen(),
        this.getStartTime(),
        //this.periodFinish(),
        this.getTotalSupply()
      ]).then((e) => {
          console.log('getCoinDetail2:')
        //TODO this.postAssetsInfo(JSON.parse(JSON.stringify(this.coinList)));
        this.getCoinPrice();
      }).catch(err => {
        errorHandler(err);
      });
      //   this.getDecimals().then(e => {

      //   }).catch(err => {
      //     errorHandler(err);
      //   });
    },
    statusChange () {
      let coinList = this.coinList;
      let total = 0;
      coinList.forEach(e => {
        if (typeof (e.total) === 'number' && typeof (e.usd) === 'number') {
          e.totalBalance = new BigNumber(e.total).times(e.usd).toNumber();
        }
      })

      //Not Started
      let notStart = this.stake.startTime - Date.parse(new Date()) > 0 ? true : false;
      //console.log('notStart var:' + notStart + ' this.stake.time:'+this.stake.time + ' startTme:'+this.stake.startTime)
      //console.log('Date.parse(new Date()):' + Date.parse(new Date()))


      if (this.stake.time < 0) {
        console.log('==> stake.time <0 : ENDED ==== comingSoon')
      }
      else if (this.stake.time === 0) { //(notStart || this.stake.time === 0) {
          console.log('00 - NOT DEPLOYED ')

          this.$store.commit('updateStakeStatus', 0);
          coinList.forEach(e => {
              e.status = 0 //not started
          })

          this.getContractDetail(); //startInWeek -> start Change force.
      }

      //DON_ADD : startInWeek (1주일 이내에 시작 예정)
      else if (notStart && (this.stake.startTime - Date.parse(new Date())) <= Server.ONE_WEEK) { //1주 하드코딩
        console.log('33 : START IN A WEEK ');

        //status = 0
        //startInWeek = 1

        this.$store.commit('updateStakeStartInWeek', 1); //startInWeek

      }

      //RUNNING - in period(UNTIL or DAYS60)
      else if (!notStart && this.stake.time > 0 && (Date.parse(new Date()) - this.stake.startTime) <= Server.UNTIL) {
        this.$store.commit('updateStakeStatus', 1); //running

        console.log('11 Started- RUNNING  ')

        coinList = this.sortByKey(coinList, 'totalBalance');
        //if (this.address) { //지갑 연결시면 상태 변경. - 20201103
            coinList.forEach(e => {
                e.status = 1
                total += e.totalBalance
            })
//        } else {
//            coinList.forEach(e => {
//                e.status = 0
//            })
//        }
      }


      this.totalPriceUsdt = total;
      this.postAssetsInfo(JSON.parse(JSON.stringify(coinList)));
    },
    sortByKey (array, key) {
      return array.sort(function (a, b) {
        let x = a[key];
        let y = b[key];
        return ((x > y) ? -1 : ((x > y) ? 1 : 0));
      })
    },
    async getCoinPrice () {

      //IOST GET PRICE https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=2405  Header - X-CMC_PRO_API_KEY:5bd857f9-6899-4629-8d47-21f0398cc8d6
        //paring data."2405".quote.USD.price

        let iost_usdt = 0.005; //default value, in case of error.
        try { // IOST id=2405`
//            let res = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=2405', {
//                headers: { 'X-CMC_PRO_API_KEY': '5bd857f9-6899-4629-8d47-21f0398cc8d6' }
            let {data:res} = await axios.get('https://blocery.com/restapi/getCmcPrice?id=2405'); //proxy

            let tempPrice = res.data[2405].quote.USD.price; //data USD parsing
            if (tempPrice && !isNaN(tempPrice)) {
                iost_usdt = tempPrice;
                console.log('iost_usdt from proxy:' + tempPrice)
            }

        } catch (error) {
            console.log(error);
        }
        console.log('iost_price:' + iost_usdt);

//      //weth,usdt Price from uniswap.
//      let USDC = new Token(ChainId.MAINNET, this.contract.address.uniswap.USDC_WETH, 6)
//      let USDCwETHPair = await Fetcher.fetchPairData(USDC, WETH[ChainId.MAINNET])
//      let USDCwETHRoute = new Route([USDCwETHPair], WETH[ChainId.MAINNET])
//      let eth_usdt = USDCwETHRoute.midPrice.toSignificant(6);
//      console.log('eth_usdt:' + eth_usdt)
//
//      //bly
//      //let bly_usdt = 0.03;
//      let BLY = new Token(ChainId.MAINNET, mainNetAddress.bly.erc20, 18);  //bly-mainet '0xf8aD7dFe656188A23e89da09506Adf7ad9290D5d'
//      let blyPair = await Fetcher.fetchPairData(BLY, WETH[ChainId.MAINNET]) //bly-eth pair
//      let blyRoute = new Route([blyPair], WETH[ChainId.MAINNET])
//      let bly_usdt = eth_usdt / blyRoute.midPrice.toSignificant(6);
//      console.log('bly_usdt:' + bly_usdt)
//
//      //lend
//      //let lend_usdt = 0.6;
//      let LEND = new Token(ChainId.MAINNET, mainNetAddress.lend.erc20, 18)  //lend-mainnet. '0x80fb784b7ed66730e8b1dbd9820afd29931aab03'
//      let lendPair = await Fetcher.fetchPairData(LEND, WETH[ChainId.MAINNET]) //lend-eth pair
//      let lendRoute = new Route([lendPair], WETH[ChainId.MAINNET])
//      let lend_usdt = eth_usdt / lendRoute.midPrice.toSignificant(6);
//      console.log('lend_usdt:' + lend_usdt)


      //TOKEN_ADD2 - price ///////////////////////////////////



      //TODO DONY <-> UNISWAP 상장. 후 가격조회.
      /**
      let DONY = new Token(ChainId.MAINNET, this.contract.address.token, 18)
      let DONYPair = await Fetcher.fetchPairData(DONY, WETH[ChainId.MAINNET])
      let DONYRoute = new Route([DONYPair], WETH[ChainId.MAINNET])
        //dony let dony = USDCWETHRoute.midPrice.toSignificant(18) / GOFUSDCRoute.midPrice.toSignificant(18)
      let dony = let DONYRoute.midPrice.toSignificant(6);
      this.DONYPrice = dony;
       */

      this.DONYPrice = 0.005; //1->0.1달러 가정.
      console.log('DONYPrice:' + this.DONYPrice)

      //TOKEN_ADD3 - price mapping
      this.coinList.forEach(p => {
        if (p.name === 'iost') {
          p.usd = new BigNumber(iost_usdt).toNumber();

          //alert(p.usd);
        }
//        else if (p.name === 'bly') {
//            p.usd = new BigNumber(bly_usdt).toNumber();
//        }
//        else if (p.name === 'usdt') {
//            p.usd = 1.0;
//        }
//        else if (p.name === 'lend') {
//            p.usd = new BigNumber(lend_usdt).toNumber();
//        }


      });
      this.getAllRewardRate()
      this.postAssetsInfo(JSON.parse(JSON.stringify(this.coinList)));
    },
    getIsOpen () {
      let relay = 0
      return new Promise((resolve, reject) => {
        this.coinList.map((e, i) => {
          //this.contract[e.name].pool.methods.isOpen().call().then(result => {
          this.getPoolIsOpen(e.name).then(result => {
            //console.log('============getPoolIsOpen:' + result)
            this.coinList[i].isOpen = result;
            relay++;
            if (relay === this.coinList.length ) { //dony : original=6
                resolve()
            }
          }).catch(err => {
            errorHandler(err);
            reject()
          });
        });
      });
    },
//    getDecimals () {
//      let relay = 0
//      return new Promise((resolve, reject) => {
//        this.coinList.map((e, i) => {
//          this.contract[e.name].erc20.methods.decimals().call().then(result => {
//            this.coinList[i].decimals = parseInt(result);
//            relay++;
//            if (relay === this.coinList.length ) { //dony : original=6
//                resolve()
//            }
//          }).catch(err => {
//            errorHandler(err);
//            reject()
//          });
//        });
//      });
//    },
    getTotalSupply () {
      let relay = 0
      return new Promise((resolve, reject) => {
        this.coinList.map((e, i) => {
          //this.contract[e.name].pool.methods.getTotalSupply().call().then(result => {

          this.getPoolTotalSupply(e.name).then(result => {
            console.log('getPoolTotalSupply:' + result);

            if (!isNaN(result)) {
                this.coinList[i].total = parseFloat(result); // TODO decimal을 나누지 않아야 전체 금액이 맞는듯 (eth와 차이)
                relay++;
                if (relay === this.coinList.length) { //dony : original=6
                    //console.log('getTotalSupply end')
                    resolve()
                }
            }
          }).catch(err => {
            errorHandler(err);
            reject()
          });
        });
      });
      //   
    },
    // GET The startTime of 'iost'pool
    async getStartTime () {

      //TODO - Set startTime front배포시 iostPool과 시간맞춰서 배포.(지갑 미연결시 startTime 못가져오므로 필요)
      let startTime = 1603962120; //IostPool에 시작 시간.

      //let startTime = await this.getPoolStartTime();
      console.log('getStartTime: ' + startTime);

      this.$store.commit('updateStakeStartTime', startTime * 1000); //20201027:08:55

      //after peroid TEST
      //this.$store.commit('updateStakeStartTime', (1600819200 + Server.UNTIL ) * 1000); // +시:1주일이내 시작:startInWeek   -:2단계
      //this.$store.commit('updateStakeStartTime', (1600819200 + 900 ) * 1000); // +시:1주일이내 시작:startInWeek   -:2단계

      /////////// periodFinith()도 여기서 호출 - 20201103 : 지감 미로그인시 오류때문. /////////////////////////////////////////////////
        let endTime = (startTime * 1000 + Server.UNTIL) - Date.parse(new Date());

        console.log('===========iost-PeriodFinish:' + endTime, this.stake.startTime, Server.UNTIL);

        this.$store.commit('updateStakeTime', endTime)
        console.log('===========iost-endTime:' + endTime)

        //let openTime = this.stake.startTime - Date.parse(new Date());
        let openTime = this.stake.startTime - Date.parse(new Date());

        //시작날짜로부터 일주일 이내에 접어 들었을때
        if (openTime > 0 && openTime <= Server.ONE_WEEK ) { //1주 하드코딩

            //openTimeInterval
            this.openTimeInterval = setInterval(() => {

                openTime = openTime - 1000
                this.$store.commit('updateStakeTime', openTime)
                this.$store.commit('updateStakeLeftTime', leftTime(openTime))
                this.statusChange();
                if (openTime <= 0) {
                    clearInterval(this.openTimeInterval);
                }

            }, 1000)

        }else{

            clearInterval(this.openTimeInterval);

            console.log('endTime'+endTime)

            //시작 하였을때
            if (endTime >= 0 && endTime <= Server.UNTIL) { //60 days

                this.timeInterval = setInterval(() => {
                    endTime = endTime - 1000;
                    this.$store.commit('updateStakeTime', endTime)
                    this.$store.commit('updateStakeLeftTime', leftTime(endTime))
                    this.statusChange();
                    if (endTime <= 0) {
                        clearInterval(this.timeInterval);
                        this.getContractDetail()
                    }
                }, 1000)
            } else {
                this.$store.commit('updateStakeLeftTime', leftTime(0))
                this.statusChange();
                clearInterval(this.timeInterval);
            }
        }


    },
//
//    periodFinish () {
//      console.log('periodFinish')
//
//      return new Promise((resolve, reject) => {
//          // bly time
//
//        //지갑 미연결시 오작동 때문에 front시간 이용. 20201103
//        //this.getPoolPeriodFinish('iost').then(result => {
//
//          const endTime = (this.stake.startTime + Server.UNTIL) - Date.parse(new Date());
//          console.log('===========iost-PeriodFinish:' + endTime, this.stake.startTime, Server.UNTIL);
//
//          //console.log('===========iost-PeriodFinish:' + result)
//          //지갑 미연결시 오작동:
//          //let endTime = result * 1000 - Date.parse(new Date());
//
////          //TODO delete test
////          //endTime =  1600387200*1000 - Date.parse(new Date());; //ENDED  9/18 0:0
////          endTime =  1600300800*1000 - Date.parse(new Date()) + Server.UNTIL; //startInWeek 테스트용
//
//          this.$store.commit('updateStakeTime', endTime)
//
//
//          console.log('===========iost-endTime:' + endTime)
//
//          let openTime = this.stake.startTime - Date.parse(new Date());
//
//          //시작날짜로부터 일주일 이내에 접어 들었을때
//          if (openTime > 0 && openTime <= Server.ONE_WEEK ) { //1주 하드코딩
//
//            //openTimeInterval
//            this.openTimeInterval = setInterval(() => {
//
//              openTime = openTime - 1000
//              this.$store.commit('updateStakeTime', openTime)
//                this.$store.commit('updateStakeLeftTime', leftTime(openTime))
//                this.statusChange();
//                if (openTime <= 0) {
//                  clearInterval(this.openTimeInterval);
//                }
//
//            }, 1000)
//
//          }else{
//
//            clearInterval(this.openTimeInterval);
//
//            console.log('endTime'+endTime)
//
//            //시작 하였을때
//            if (endTime >= 0 && endTime <= Server.UNTIL) { //60 days
//
//              this.timeInterval = setInterval(() => {
//                endTime = endTime - 1000;
//                this.$store.commit('updateStakeTime', endTime)
//                this.$store.commit('updateStakeLeftTime', leftTime(endTime))
//                this.statusChange();
//                if (endTime <= 0) {
//                  clearInterval(this.timeInterval);
//                  this.getContractDetail()
//                }
//              }, 1000)
//            } else {
//              this.$store.commit('updateStakeLeftTime', leftTime(0))
//              this.statusChange();
//              clearInterval(this.timeInterval);
//            }
//          }
//
//
//          resolve()
//        }).catch(err => {
//          errorHandler(err);
//          reject()
//        });
//      ////// });
//
//    },

    //////// Pool Function // Iost get storage call//////////////////////////////////////////
    async getPoolIsOpen(e) {

//      const tempIost = window.IWalletJS.newIOST(window.IOST);
//      const iostHost = tempIost.currentRPC._provider._host;

      let res = await axios.post(Server.IOST_ADDR + "/getBatchContractStorage", {
          id: this.contract[e].pool,
          key_fields: [{key: "open"}],
          by_longest_chain: true
      });
      return res.data.datas[0];
    },

    async getPoolStartTime() {

//      const tempIost = window.IWalletJS.newIOST(window.IOST);
//      const iostHost = tempIost.currentRPC._provider._host;

      let res = await axios.post(Server.IOST_ADDR + "/getBatchContractStorage", {
          id: this.contract['iost'].pool,
          key_fields: [{key: "startTime"}],
          by_longest_chain: true
      });
      return res.data.datas[0];
    },

    async getPoolTotalSupply(e) {

//      const tempIost = window.IWalletJS.newIOST(window.IOST);
//      const iostHost = tempIost.currentRPC._provider._host;

      let res = await axios.post(Server.IOST_ADDR + "/getBatchContractStorage", {
          id: this.contract[e].pool,
          key_fields: [{key: "totalSupply"}],
          by_longest_chain: true
      });
      return res.data.datas[0];
    },

    async getPoolPeriodFinish(e) {

//      const tempIost = window.IWalletJS.newIOST(window.IOST);
//      const iostHost = tempIost.currentRPC._provider._host;

      let res = await axios.post(Server.IOST_ADDR + "/getBatchContractStorage", {
          id: this.contract[e].pool,
          key_fields: [{key: "periodFinish"}],
          by_longest_chain: true
      });
      return res.data.datas[0];
    },

    async getPoolRewardRate(e) {

//        const tempIost = window.IWalletJS.newIOST(window.IOST);
//        const iostHost = tempIost.currentRPC._provider._host;

        let res =  await axios.post(Server.IOST_ADDR + "/getBatchContractStorage", {
            id:this.contract[e].pool,
            key_fields:[{key:"rewardRate"}],
            by_longest_chain:true});
        console.log("========getRewardRate:");
        console.log(res);

        return res.data.datas[0];
    },

    //////////////////////////end of Pool function///////////////////////


    async getAllRewardRate () {

      //let iost = await this.getRewardRate('iost'); //
      let iost = await this.getPoolRewardRate('iost'); //
      console.log('========iostPool rewardRate:' + iost);

//      let bly = await this.getRewardRate('bly');
//
//      let usdt = await this.getRewardRate('usdt');
//      let lend = await this.getRewardRate('lend');

      //TOKEN_ADD4 - rewardRate 아래쪽 포함.//////////////////////////////////////////////

      /**
       //TOKEN_ADD5 - trade.vue 280line

        */

      //console.log('rewardRate weth, bly: ', weth, bly)
      //console.log('rewardRate usdt, lend: ', usdt, lend)

      let dony = this.DONYPrice;
      this.coinList.forEach(e => {
        if (e.usd > 0) {
          switch (e.name) {
              case 'iost':
                e.rate = this.calcAPR(iost, e.total, dony, e.usd)

                break;
//              case 'bly':
//                e.rate = this.calcAPR(bly, e.total, dony, e.usd)
//                break;
//
//              case 'usdt':
//                  e.rate = this.calcAPR(usdt, e.total, dony, e.usd)
//                  break;
//              case 'lend':
//                  e.rate = this.calcAPR(lend, e.total, dony, e.usd)
//                  break;


            default:
              break;
          }
          //console.log('rewardAPR:',e.name,e.rate)
        }
      });
      this.postAssetsInfo(JSON.parse(JSON.stringify(this.coinList)));
    },
    calcAPR (symbol, total, dony, usd) {
      return (((symbol / (total < 1 ? 1 : total) * dony) * 360 * 24 * 60 * 60) / usd) * 100;
    },
    changeIcon (key) {
      switch (key) {
        default:
          this.coinList.forEach(e => {
            e.img = require('./assets/coin_' + e.name + '.png')
          })
          break;
      }
      this.postAssetsInfo(JSON.parse(JSON.stringify(this.coinList)));
    }
  }
}
</script>

<style lang="less">
@import "./styles/common.less";
</style>
