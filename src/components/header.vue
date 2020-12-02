<template>
  <div class="header" @mouseleave="langShow = false">
    <div class="middle_header">
      <!-- 홈 로고 -->
      <div class="icon" @click="goTo('/')">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 상단 메뉴 -->
      <div class="header_menu_layout">
        <div class="header_menu">
          <ul>
            <li 
            :class="item.active ? 'active' : ''" 
            v-for="item in menu" 
            v-bind:key="item.name"
            @click="goTo(item.router)">
              <a>{{item.name}}</a>
            </li>
          </ul>
        </div>
      <!-- 지갑메뉴 -->
      <div class="header_wallet">
        <wallet />
      </div>
      <!-- 미나메뉴아이콘 -->
      <div class="min_menu_icon" @mouseover="minMenuShow = true">
        <img src="../assets/min_menu.png" alt />
      </div>
      </div>
      
      <!-- 모바일 전용 메뉴 Min Menu-->
      <div
        class="min_menu"
        v-if="minMenuShow"
        @mouseover="minMenuShow = true"
        @mouseleave="minMenuShow = false"
        @click="minMenuShow = false"
      >
        <ul>
          <li v-for="item in menu" v-bind:key="'min_'+item.name" @click="goTo(item.router)">
            <a>{{item.name}}</a>
          </li>
          <li @click="myWallet">
            <a>{{$t('My'+this.$tokenName)}}</a>
          </li>
        </ul>
      </div>
      <div
        class="langSelect"
        v-if="langShow"
        @mouseover="langShow = true"
        @mouseleave="langShow = false"
      >
        <div v-for="item in langList" v-bind:key="'lang_'+item.name" @click="selectLang(item)">{{item.name}}</div>
      </div>
      <div class="lang" @mouseover="langShow = true">{{langName}}</div>
    </div>
  </div>
</template>

<script>
import Cookie from 'js-cookie';
import { goTo } from '@/utils/index';
import wallet from './wallet.vue'
export default {
  components: {
    wallet
  },
  data () {
    return {
      lang: Cookie.get('lang') || 'en-US',
      langName: '',
      goTo: goTo,
      menu: [
        {
          name: 'About',
          router: '/about',
          routerChildren: '/about',
          active: true
        },
        {
          name: 'Checking',
          router: '/checking',
          routerChildren: '/checking,/trade',
          active: true
        },
        {
          name: 'Loan',
          router: '/loan',
          routerChildren: '/loan',
          active: false
        },
        {
          name: 'Exchange',
          router: '/exchange',
          routerChildren: '/exchange',
          active: false
        },
        {
          name: 'Credit Analysis',
          router: '/creditAnalysis',
          routerChildren: '/creditAnalysis',
          active: false
        },
        {
          name: 'Payment',
          router: '/payment',
          routerChildren: '/payment',
          active: false
        },
        {
          name: 'Portfolio Mgmt.',
          router: '/fundManagement',
          routerChildren: '/fundManagement',
          active: false
        },
        // {
        //   name: 'About',
        //   router: '/about',
        //   routerChildren: '/about',
        //   active: false
        // }        
      ],
      menuAcitve: '',
      langShow: false,
      langList: [
        {
          key: 'en-US',
          name: 'EN'
        },
        {
          key: 'ko-KR',
          name: '한국어',
        }
      ],
      minMenuShow: false,
    }
  },
  watch: {
    '$route.path' (e) {
      // 라우터 url 변경시 Active 속성 true 적용 메뉴 활성화
      this.menu.forEach(o => {
        o.active = false;
        if (o.routerChildren.indexOf(e) > -1) {
          o.active = true;
        }
      })
    }
  },
  created () {
    // created 인스턴스가 작성된 후 동기적으로 호출 이후에 mounted 순서로 작동
    this.langName = this.langList.filter(e => this.lang === e.key)[0].name;
  },
  methods: {
    myWallet () {
      // My DONY (오른쪽 메뉴)
      this.$store.commit('updateMyWalletModel', true);
    },
    selectLang (e) {
      // 언어 변경 메뉴 
      this.$i18n.locale = e.key;
      Cookie.set('lang', e.key);
      this.$store.commit('updateLang', e.key);
      this.langName = e.name;
      this.routerReload();
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/color.less';
.header {
  width: 100%;
  height: 70px;
  z-index: 100;
  // background-color: black;
  display: flex;
  justify-content: center;
  position: fixed;
  background: rgba(0,0,0, 0.2);

  
  .middle_header {
    width: 100%;
    display: flex;
    // max-width: 1440px;
    position: relative;
    .icon {
      display: flex;
      align-items: center;
      cursor: pointer;
      img {
        width: 130px;
        margin: 0px 0 0 30px;
      }
    }
    .header_menu_layout {
      margin-left: auto;
      display: flex;
    }

    .header_menu {
      flex: 1;
      margin-right: 40px;
      


      ul {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        li {
          margin: 0 20px;
          list-style: none;
          font-size: 16px;
          color: @white;
          cursor: pointer;
        }
        .active {
          font-size: 18px;
          font-weight: 500;
        }
      }
    }
    .header_wallet {
      margin-right: 105px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .langSelect {
      width: 55px;
      margin: 10px;
      position: absolute;
      z-index: 102;
      right: 0;
      top: 48px;
      background-color: #6cc28d;
      color: #fff;
      border-radius: 3px;
      cursor: pointer;
      div {
        width: 55px;
        height: 48px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      div:hover {
        background-color: #589e74;
      }
    }
    .lang {
      width: 55px;
      height: 46px;
      background-color: rgba(85, 188, 126, 0.8);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      cursor: pointer;
      position: absolute;
      z-index: 99;
      right: 10px;
      top: 12px;
    }
    .min_menu_icon {
      img {
        width: 20px;
        height: 20px;
        position: absolute;
        top: 25px;
        right: 95px;
      }
    }
    .min_menu {
      background-color: #6cc28d;
      position: absolute;
      border-radius: 5px;
      top: 70px;
      right: 80px;
      li {
        list-style: none;
        color: #fff;
        padding: 10px 15px;
        text-align: center;
        border-radius: 5px;
        cursor: Z;
      }
      li:hover {
        background-color: #589e74;
      }
    }
  }
}
@media (max-width: 920px) {
  .header {
    height: 44px;
    .middle_header {
      .icon {
        img {
          width: 100px;
          margin: 0px 0 0 16px;
        }
      }
      .min_menu_icon {
        img {
          width: 16px;
          height: 14px;
          top: 15px;
          right: 66px;
        }
      }
      .min_menu {
        top: 45px;
        right: 62px;
      }
      .lang {
        background-color: transparent;
        color: #118B80;
        font-size: 14px;
        top: 0;
        right: 0;
      }
      .langSelect {
        top: 35px;
        right: -10px;
      }
    }
  }
  .header_menu {
    display: none;
  }
}
@media (min-width: 920px) {
  .min_menu_icon {
    display: none;
  }
}
</style>
