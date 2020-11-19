<template>
  <div class="Savings background-gray content">
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
        <div class="heading">Coming soon</div>
        <!-- <div class="addressBox">
          <div>{{$t('EarnDonnie')}}<br /></div>
          <div>{{$t(this.$tokenName+'TokenAddress')}}</div>
          <div>{{contract_address}}</div>
        </div> -->
        <!-- <TimeDown /> -->
        <div class="time">00 : 00 : 00</div>
      </div>
        
      </div>
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
@import "@/styles/color.less";
.time {
  color: @key;
  font-size: 62px;
  font-weight: 500;
}
</style>
