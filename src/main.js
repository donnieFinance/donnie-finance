import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store';
import i18n from './plugins/i18n'

import './plugins/element';
import './plugins/mixin';

import './styles/fonts.css'

import Server from './property'

// 메인 토큰 네임 DONY
Vue.prototype.$tokenName = Server.token.name;

Vue.config.productionTip = false;
new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app')
