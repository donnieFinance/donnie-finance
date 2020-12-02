<template>
  <!-- 하단 바-->
  <div class="footer" :total="total">
    <div class="web_footer">
      <div class="c2020">
        ⓒ DONNIE FINANCE. ALL RIGHTS RESERVED.<br>powered by IOST
      </div>
      <div class="icon flex">
        <!-- 위챗 아이콘 마우스 오버시 QR 바코드 보기 -->
        <img class="er_code" :src="er_code" v-if="er_code_show" />
        <a
            class="tokenContract flex"
            :href="getTokenContractAddress()"
            target="_black"
        >Token Contract</a>
<!--        <a-->
<!--            class="tokenContract uniswap flex"-->
<!--            :href="getTokenUniswapAddress()"-->
<!--            target="_black"-->
<!--        >-->
<!--          <img src="../assets/icon_uniswap.png" alt />-->
<!--          Uniswap {{$t(this.$tokenName)}}-ETH-->
<!--        </a>-->

        <a
            class="tokenContract flex"
            href="https://drive.google.com/file/d/1Wgu773VlOyiAcpD1X8m6YYdQIu4y13PE/view?usp=sharing"
            target="_black"
        >White Paper</a>

        <ul class="footer_icon flex">
          <li v-for="(item,index) in iconList" v-bind:key="'footer_icon_'+index">
            <a class="flex" :href="item.link" target="_black">
              <img :src="item.img" alt />
            </a>
          </li>
<!--          <li class="flex">-->
<!--            <img-->
<!--              src="../assets/icon_wechat.png"-->
<!--              alt-->
<!--              @mouseleave="er_code_show = false"-->
<!--              @mouseover="er_code_show = true"-->
<!--            />-->
<!--          </li>-->
        </ul>
      </div>
    </div>
    <!-- 모바일 미니 하단 바-->
    <div class="m_footer">
      <div class="link">
        <a
            class="tokenContract flex"
            :href="getTokenContractAddress()"
            target="_black"
        >Token Contract</a>
<!--        <a-->
<!--            class="tokenContract uniswap flex"-->
<!--            :href="getTokenUniswapAddress()"-->
<!--            target="_black"-->
<!--        >-->
<!--          <img src="../assets/icon_uniswap.png" alt />-->
<!--          Uniswap {{$t(this.$tokenName)}}-ETH-->
<!--        </a>-->
      </div>

      <div class="link">
        <a
            class="tokenContract flex"
            href="https://drive.google.com/file/d/1Wgu773VlOyiAcpD1X8m6YYdQIu4y13PE/view?usp=sharing"
            target="_black"
        >White Paper</a>
        <!--        <a-->
        <!--            class="tokenContract uniswap flex"-->
        <!--            :href="getTokenUniswapAddress()"-->
        <!--            target="_black"-->
        <!--        >-->
        <!--          <img src="../assets/icon_uniswap.png" alt />-->
        <!--          Uniswap {{$t(this.$tokenName)}}-ETH-->
        <!--        </a>-->
      </div>

      <ul class="footer_icon flex">
        <li v-for="(item,index) in iconList" v-bind:key="'m_footer_icon_'+index">
          <a class="flex" :href="item.link"  target="_black">
            <img :src="item.img" alt />
          </a>
        </li>
<!--        <li class="flex">-->
<!--          <img-->
<!--            src="../assets/icon_wechat.png"-->
<!--            alt-->
<!--            @mouseleave="er_code_show = false"-->
<!--            @mouseover="er_code_show = true"-->
<!--          />-->
<!--        </li>-->
      </ul>
      <div class="c2020">
        ⓒ DONNIE BANK. ALL RIGHTS RESERVED.<br>powered by IOST
      </div>
    </div>
  </div>
</template>

<script>

import { address } from '@/utils/common'
import Server from '@/property'
import er_code from '../assets/er_code.png';
export default {
  props: ['total'],
  data () {
    //console.log("=====",address)
    return {
      er_code: er_code,
      er_code_show: false,
      isTestnet:Server.isTestnet(),
      contract_address:address.token,
      uniswap_address:"0x95c1e7b3bbc79f073576751fd78e8bbe9f6386b2",
      iconList: [
        {
          img: require('../assets/icon_telegram.png'),
          link: 'https://t.me/donniefinance'
        },
        // {
        //   img: require('../assets/icon_twitter.png'),
        //   link: 'https://twitter.com/DonnieFinance'
        // },
        // {
        //   img: require('../assets/icon_discord.png'),
        //   link: ''
        // },
        {
          img: require('../assets/icon_medium.png'),
          link: 'https://medium.com/@donnie.finance'
        },
        // {
        //   img: require('../assets/icon_reddit.png'),
        //   link: ''
        // },
        {
          img: require('../assets/icon_github.png'),
          link: 'https://github.com/donnieFinance/donnie-finance'
        }
      ]
    }
  },
  methods: {
    getTokenContractAddress(){
      return ("https://www.iostabc.com/token/" + this.contract_address)
//      return (this.isTestnet ? 'https://ropsten.etherscan.io/address/':'https://etherscan.io/token/')+this.contract_address;
    },
    getTokenUniswapAddress(){
      return 'https://uniswap.info/pair/'+this.uniswap_address;
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/color.less';
.footer {
  .web_footer {
    width: 100%;
    height: 70px;
    background-color: #283742;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .m_footer {
    display: none;
    background-color: #283742;
    //height: 180px;
  }
  .c2020 {
    //width: 400px;
    color: @light-gray;
    font-size: 14px;
    margin-left: 10px;
    flex-shrink: 0;
    span {
      color: #666;
    }
  }
  .tokenContract {
    width: 136px;
    height: 40px;
    border: 1px solid @secondary;
    color: @light-gray;
    border-radius: 8px;
    font-size: 14px;
    margin-right: 10px;
    flex-direction: row;
    cursor: pointer;
    img {
      width: 30px;
      height: 30px;
      margin-top: 3px;
      margin-right: 2px;
    }
  }
  .tokenContract:hover {
    border: 1px solid @key;
    color: @key;
  }
  .uniswap {
    width: 196px;
  }
  .icon {
    width: 100%;
    max-width: 1440px;
    height: 100%;
    margin-left: 10px;
    flex-direction: row;
    justify-content: flex-end;

    .er_code {
      position: absolute;
      z-index: 10;
      right: 0;
      top: -120px;
    }
  }
  .footer_icon {
    display: flex;
    flex-direction: row;
    justify-content: start;
    margin-left: 10px;
    li {
      list-style: none;
      margin-right: 3px;
      img {
        width: 33px;
        height: 33px;
        margin-top: 9px;
      }
    }
  }
}
@media (max-width: 760px) {
  .web_footer {
    display: none !important;
  }
  .m_footer {
    padding-bottom: 10px;
    text-align: center;
    display: block !important;
    .link {
      display: flex;
      a {
        flex: 1;
        margin: auto;
        margin-left: 10px;
        margin-right: 10px;
        margin-top: 16px;
      }
      a:nth-child(1) {
        //margin-left: 10px;
        //margin-right: 5px;
      }
      a:nth-child(2) {
        //margin-left: 5px;
        //margin-right: 10px;
      }
    }
    .footer_icon {
      margin-top: 24px;
      margin-left: 0;
      justify-content: center;
      li {
        margin-right: 10px;
      }
    }
  }
  .c2020 {
    margin-top: 10px;
    margin-left: 0!important;
  }
  .footer {
    //height: 180px;
    flex-direction: column;
  }
}
</style>