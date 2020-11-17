<template>
<div class="wrapper">
  <div class="web-container">
    <div class="logo" href="/about" @click="goTo('/about')">
      <img src="../../assets/donnie_logo_b.png" alt />
    </div>
    <div class="web-main">
      <div class="card" @click="goTo('/savings')">
        <div class="icon">
          <img class="img-default" :src="svg.savings" alt="savings and checking">
          <img class="img-hover" :src="svg.savingsW" alt="savings and checking">
        </div>
        <div class="content">
          <div class="heading">
            Savings & Checking
          </div>
          <div class="desc">
            <div>
              Deposit and Withdraw cryptocurrency anytime, anywhere with no fees.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/loan')">
        <div class="icon">
          <img class="img-default" :src="svg.loan" alt="loan">
          <img class="img-hover" :src="svg.loanW" alt="loan">
        </div>
        <div class="content">
          <div class="heading">
            Loan
          </div>
          <div class="desc">
            <div>
              Borrow and Lend any cryptocurrency with an Algorithmic & Autonomous Interest Rate.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/exchange')">
        <div class="icon">
          <img class="img-default" :src="svg.exchange" alt="exchange">
          <img class="img-hover" :src="svg.exchangeW" alt="exchange">
        </div>
        <div class="content">
          <div class="heading">
            Exchange
          </div>
          <div class="desc">
            <div>Trade Cryptocurrency-to-Cryptocurrency with Automated Liquidity Provision.</div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/creditScore')">
        <div class="icon">
          <img class="img-default" :src="svg.creditScore" alt="creditScore">
          <img class="img-hover" :src="svg.creditScoreW" alt="creditScore">
        </div>
        <div class="content">
          <div class="heading">
            Credit Analysis
          </div>
          <div class="desc">
            <div>Peer-to-Peer network of trusted parties and personal data to create a secure credit analytics system used within the financial ecosystem.</div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/card')">
        <div class="icon">
          <img class="img-default" :src="svg.card" alt="card">
          <img class="img-hover" :src="svg.cardW" alt="card">
        </div>
        <div class="content">
          <div class="heading">
            Payment
          </div>
          <div class="desc">
            <div>Support direct transaction between users through the network</div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/fundManagement')">
        <div class="icon">
          <img class="img-default" :src="svg.fundManagement" alt="fundManagement">
          <img class="img-hover" :src="svg.fundManagementW" alt="fundManagement">
        </div>
        <div class="content">
          <div class="heading">
            Fund management
          </div>
          <div class="desc">
            <div>Aggregator service giving advice and automatically balancing user's digital assets.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright">
      ⓒ DONNIE BANK. ALL RIGHTS RESERVED.<br/>powered by IOST
    </div>
  </div>

  <div class="m-container">
    <div class="logo" href="/about" @click="goTo('/about')">
      <img src="../../assets/donnie_logo_b.png" alt />
    </div>
    <div class="m-main">
      <div class="card" @click="goTo('/savings')">
        <div class="icon">
          <img class="img-default" :src="svg.savings" alt="savings and checking">
        </div>
        <div class="content">
          <div class="heading">
            Savings & Checking
          </div>
          <div class="desc">
            <div>
              Deposit and Withdraw cryptocurrency anytime, anywhere with no fees.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/loan')">
        <div class="icon">
          <img class="img-default" :src="svg.loan" alt="loan">
        </div>
        <div class="content">
          <div class="heading">
            Loan
          </div>
          <div class="desc">
            <div>
              Borrow and Lend any cryptocurrency with an Algorithmic & Autonomous Interest Rate.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/exchange')">
        <div class="icon">
          <img class="img-default" :src="svg.exchange" alt="exchange">
        </div>
        <div class="content">
          <div class="heading">
            Exchange
          </div>
          <div class="desc">
            <div>
              Trade Cryptocurrency-to-Cryptocurrency with Automated Liquidity Provision.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/creditScore')">
        <div class="icon">
          <img class="img-default" :src="svg.creditScore" alt="creditScore">
        </div>
        <div class="content">
          <div class="heading">
            Credit Analysis
          </div>
          <div class="desc">
            <div>
              Credit Analysis : Peer-to-Peer network of trusted parties and personal data to create a secure credit analytics system used within the financial ecosystem.
            </div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/card')">
        <div class="icon">
          <img class="img-default" :src="svg.card" alt="card">
        </div>
        <div class="content">
          <div class="heading">
            Payment
          </div>
          <div class="desc">
            <div>Support direct transaction between users through the network</div>
          </div>
        </div>
      </div>
      <div class="card" @click="goTo('/fundManagement')">
        <div class="icon">
          <img class="img-default" :src="svg.fundManagement" alt="fundManagement">
        </div>
        <div class="content">
          <div class="heading">
            Fund management
          </div>
          <div class="desc">
            <div>Aggregator service giving advice and automatically balancing user's digital assets.</div>
          </div>
        </div>
      </div>
      
    </div>
    <div class="copyright">
      ⓒ DONNIE BANK. ALL RIGHTS RESERVED.<br/>powered by IOST
    </div>
  </div>

    


</div>
  </template>

<script>
import { mapState, mapActions } from 'vuex';
import erc from '@/utils/json/ERC20.json';
import { toNonExponential, leftTime, mToUpperCase } from '@/utils/index';
import TimeDown from '@/components/timeDown';
import { hiddenAddress } from '@/utils/index';
import { address } from '@/utils/common'
import { goTo } from '@/utils/index';

import Savings from '@/assets/savings.svg'
import SavingsW from '@/assets/savings_w.svg'
import Loan from '@/assets/loan.svg'
import LoanW from '@/assets/loan_w.svg'
import Exchange from '@/assets/exchange.svg'
import ExchangeW from '@/assets/exchange_w.svg'
import CreditScore from '@/assets/credit_score.svg'
import CreditScoreW from '@/assets/credit_score_w.svg'
import Card from '@/assets/card.svg'
import CardW from '@/assets/card_w.svg'
import FundManagement from '@/assets/fund_management.svg'
import FundManagementW from '@/assets/fund_management_w.svg'

export default {
  components: {
    TimeDown
  },
  data () {
    return {
      status: 0,
      isOpen: false,
//      newsList: [
//        {
//          content: this.$t('newsList1'),
//          link: 'https://www.yuque.com/golff/documentation/vv11gs',
//        },
//        {
//          content: this.$t('newsList2'),
//          link: 'https://www.yuque.com/golff/documentation/suuquo',
//        },
//        {
//          content: this.$t('newsList3'),
//          link: 'https://uniswap.info/pair/0x9776a214272ab452f8c88c7576dcd0c6ffbfee14',
//        },
//      ],
      hiddenAddress: hiddenAddress,
      mToUpperCase: mToUpperCase,
      goTo: goTo,
      svg: {
        savings: Savings,
        savingsW: SavingsW,
        loan: Loan,
        loanW: LoanW,
        exchange: Exchange,
        exchangeW: ExchangeW,
        creditScore: CreditScore,
        creditScoreW: CreditScoreW,
        card: Card,
        cardW: CardW,
        fundManagement: FundManagement,
        fundManagementW: FundManagementW
      },
      
    }
  },
  computed: {
    ...mapState(['network', 'lang', 'address', 'stake', 'coinList', 'reloadTime', 'disConnet']),
    toFixed (e, o) {
      return ((e, o) => {
        if (!e || e === '...') return '...';
        return toNonExponential(e / o);
      })
    },
  },
  watch: {
    network (e) {

    }
  },
  mounted () {
      this.$store.commit('updateRouterLoading', false);
  },
  methods: {
    ...mapActions(['getIostAddress']),
    goFarm (e) {
      if (!this.address || this.address.length === 0) {
        this.$message({
          message: this.$t('PleaseConnect'),
          type: 'warning'
        });
        return;
      }
      if (e.status === 0) {
        this.$message({
          message: this.$t('activityNoStart'),
          type: 'warning'
        });
        return;
      }
      this.$store.commit('updateSelectCoin', e.name);
      this.$router.push('/trade?coin=' + e.name);
    },
    changeMetaMask () {
      this.getIostAddress();
    },
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
