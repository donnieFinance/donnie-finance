<template>
  <div class="Savings">
    <div class="header flex">
      <div
        class="minWalletBtn flex"
        @click="changeMetaMask"
        v-if="this.address && this.address.length>0">
        <!--<p>• {{hiddenAddress(this.address)}}</p>-->
        <p>• {{this.address}}</p>
      </div>
      <div class="minWalletBtn flex" @click="changeMetaMask" v-else>
        <p>{{$t('connectWallet')}}</p>
      </div>

      <div class="donnieBankHeading">
        <div>DonnieBank</div>
        <div>Decentralized Total Financial Service Provider</div>
      </div>
      
      <div class="countdownBox donnieBor">
        <div class="heading">Saving & Checking</div>
        <div class="addressBox">
          <div>{{$t('EarnDonnie')}}<br /></div>
          <div class="donnieToken" @click="etherscan(contract_address)">{{$t(this.$tokenName+' TokenID : ')}} '{{contract_address}}'</div>
          <!--<div>'{{contract_address}}'</div>-->
        </div>
        <TimeDown />
        <div class="stage" v-if="stake.status === 0 && !stake.startInWeek">{{$t('comingSoon')}}</div>
        <div class="stage" v-if="stake.status === 0 && stake.startInWeek">{{$t('countdown2')}}</div> <!--dony : 1주내 오픈으로 사용 -->
        <div class="stage" v-if="stake.status === 1">{{$t('countdown1')}}</div>
      </div>

      <!-- <p class="tips">
          {{$t('EarnDonnie')}}<br />
      </p> -->
      <!-- <p class="donnieToken flex">{{$t(this.$tokenName+'TokenAddress')}}: {{contract_address}}</p> -->
      <p class="disConnet" v-if="disConnet">{{$t('PleaseInstall')}}</p>
      <!-- <div class="middle flex"> -->
        <!-- <TimeDown /> -->
        <!-- <p class="stage" v-if="stake.status === 0 && !stake.startInWeek">{{$t('comingSoon')}}</p> -->
        <!-- <p class="stage" v-if="stake.status === 0 && stake.startInWeek">{{$t('countdown2')}}</p> dony : 1주내 오픈으로 사용 -->

        <!-- <p class="stage" v-if="stake.status === 1">{{$t('countdown1')}}</p>
        <p class="stage" v-if="stake.status === 2">{{$t('countdown2')}}</p>
        <p class="notice">
          <el-carousel direction="vertical" :autoplay="true" :interval="3000" :loop="true">
            <el-carousel-item v-for="(item,i) in newsList" :key="i">
              <a class="medium" :href="item.link" target="_black">
                <img class="speaker" src="../../assets/speaker.png" />
                <p style="line-height: 24px;">{{item.content}}</p>
              </a>
            </el-carousel-item>
          </el-carousel>
        </p> -->
      <!-- </div> -->
    </div>

    <div class="list flex">
      <div
        :class="[0,1,2].indexOf(item.status) > -1 ? 'web-item donnieBor' : 'web-item donnieBor close flex'"
        v-for="(item,i) in coinList"
        v-bind:key="item.name"
      >
        <!--<p>{{item.totalBalance}}, {{item.total}}, {{item.rate}}</p>-->
        <img
          class="rank"
          v-if="item.status === 1 && i === 0 && item.usd !== 0"
          src="../../assets/first.png"
        />
        <img
          class="rank"
          v-if="item.status === 1 && i === 1 && item.usd !== 0"
          src="../../assets/second.png"
        />
        <img
          class="rank"
          v-if="item.status === 1 && i === 2 && item.usd !== 0"
          src="../../assets/third.png"
        />

        <img
          class="double"
          v-if="item.status === 2 && lang === 'en-US'"
          src="../../assets/double_en.png"
        />
        <img
          class="double"
          v-if="item.status === 2 && lang === 'ko-KR'"
          src="../../assets/double_ko.png"
        />

        <div class="coin flex">
          <img :src="item.img" />
          <p>{{mToUpperCase(item.name)}}</p>
        </div>

        <div class="coinContent flex">
          <div class="tips" v-if="[0].indexOf(item.status) > -1">
          <p class="obtain">{{$t('Provide',{x: mToUpperCase(item.name)})}}</p>
        </div>
        <div class="tips flex" v-if="[1,2].indexOf(item.status) > -1">
          <p class="mining">{{$t('Mining')}}</p>
          <p class="total" v-if="item.total !== '...'">{{item.total.toFixed(2)}}</p>
          <p
            class="usd"
            v-if="[1,2].indexOf(item.status) > -1 && item.usd"
          >≈{{item.totalBalance.toFixed(2)}} USD</p>
          <p class="rate" v-if="[1,2].indexOf(item.status) > -1 && item.rate !== ''">
            {{$t('annualization')}}：
            <span>{{item.rate.toFixed(2)}} %</span>
          </p>
        </div>
        <div class="tips" v-if="[3].indexOf(item.status) > -1">
          <p class="obtain">{{$t('closePool')}}</p>
        </div>

        <!-- status 0 -->
        <div
          class="btn flex"
          v-if="item.status === 0 || !address"
          @click="goSavings(item)"
        >{{ $t('Deposit')  }}</div>

        <div
          class="btn flex"
          v-if="[1,2].indexOf(item.status) > -1 && address"
          @click="goSavings(item)"
        >{{$t('Deposit')}}</div>

        <div
          class="btn flex"
          v-if="item.status === 3 && address"
          @click="goSavings(item)"
        >{{$t('HarvestWithdraw')}}</div>
        </div>
        
      </div>



      <div
        :class="[0,1,2].indexOf(item.status) > -1 ? 'm-item donnieBor' : 'm-item donnieBor close'"
        v-for="(item,i) in coinList"
        v-bind:key="'m_'+item.name"
      >

        <img
          class="rank rank1"
          v-if="item.status === 1 && i === 0 && item.usd !== 0"
          src="../../assets/first.png"
        />
        <img
          class="rank"
          v-if="item.status === 1 && i === 1 && item.usd !== 0"
          src="../../assets/second.png"
        />
        <img
          class="rank"
          v-if="item.status === 1 && i === 2 && item.usd !== 0"
          src="../../assets/third.png"
        />

        <img
          class="double double_en"
          v-if="item.status === 2 && lang === 'en-US'"
          src="../../assets/double_m_en.png"
        />
        <img
          class="double"
          v-if="item.status === 2 && lang === 'ko-KR'"
          src="../../assets/double_m_ko.png"
        />
        <div class="left">
          <div class="coin">
            <img :src="item.img" />
            <p>{{mToUpperCase(item.name)}}</p>
            <p v-if="[1,2].indexOf(item.status) > -1">{{$t('Mining')}}</p>
          </div>
          <div class="tips">
            <p
              class="obtain obtain0"
              v-if="[0].indexOf(item.status) > -1"
            >{{$t('Provide',{x: mToUpperCase(item.name)})}}</p>
            <p class="total" v-if="item.total !== '...' && [1,2].indexOf(item.status) > -1">
              {{item.total.toFixed(2)}}
              <span
                class="usd"
                v-if="[1,2].indexOf(item.status) > -1 && item.usd"
              >≈{{item.totalBalance.toFixed(2)}} USD</span>
            </p>

            <p class="rate" v-if="[1,2].indexOf(item.status) > -1 && item.rate !== ''">
              {{$t('annualization')}}：
              <span>{{item.rate.toFixed(2)}} %</span>
            </p>
            <p class="obtain" v-if="[3].indexOf(item.status) > -1">{{$t('closePool')}}</p>
          </div>
        </div>
        <div class="right flex">

          <!-- status 0 -->
          <div
            class="btn flex"
            v-if="item.status === 0 || !address"
            @click="goSavings(item)"
          >{{$t('Deposit2')}}</div>

          <div
            class="btn flex"
            v-if="[1,2].indexOf(item.status) > -1 && address"
            @click="goSavings(item)"
          >{{$t('Deposit2')}}</div>

          <div
            class="btn flex"
            v-if="item.status === 3 && address"
            @click="goSavings(item)"
          >{{$t('withdraw')}}</div>
        </div>
      </div>
    </div>
    <div class="more flex" v-if="stake.status === 1">{{$t('StagePhase')}}</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { toNonExponential, mToUpperCase } from '@/utils/index';
import TimeDown from '@/components/timeDown';
import { hiddenAddress } from '@/utils/index';
import { address } from '@/utils/common'
export default {
  components: {
    TimeDown
  },
  data () {
    return {
      contract_address:address.token,
      status: 0,
      isOpen: false,
      newsList: [
        {
          content: this.$t('newsList1'),
          link: 'https://www.yuque.com/golff/documentation/vv11gs',
        },
        {
          content: this.$t('newsList2'),
          link: 'https://www.yuque.com/golff/documentation/suuquo',
        },
        {
          content: this.$t('newsList3'),
          link: 'https://uniswap.info/pair/0x95c1e7b3bbc79f073576751fd78e8bbe9f6386b2',
        },
      ],
      hiddenAddress: hiddenAddress,
      mToUpperCase: mToUpperCase
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
  methods: {
    ...mapActions(['getIostAddress']),
    etherscan (tokenId) {
        window.open("https://www.iostabc.com/token/" + tokenId)
    },
    goSavings (e) {
      if (!this.address || this.address.length === 0) {
        this.$message({
          message: this.$t('PleaseConnect'),
          type: 'warning'
        });
        return;
      }
      // if (e.status === 0) {
      //   this.$message({
      //     message: this.$t('activityNoStart'),
      //     type: 'warning'
      //   });
      //   return;
      // }
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
