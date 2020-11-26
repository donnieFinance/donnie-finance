import Vue from 'vue';
import Vuex from 'vuex';
import errorHandler from '@/utils/errorHandler';
import i18n from '../plugins/i18n'
Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';
const state = {
    lang: 'en-US',
    network: '',
    address: '',
    walletModel: false,
    myWalletModel: false,
    stake: {
        startTime: '',
        time: '',
        leftTime: '',
        status: 0,
        startInWeek: 0
    },
    coinList: [],
    //xCoin: 'gxc',
    xCoin: 'iost',  //dony test
    reloadTime: '',
    disConnet: false,
    isRouterAlive: true,
    routerLoading: false,
    barShow: false
};
const mutations = {
    updateLang (state, lang) {
        state.lang = lang;
    },
    updateNetWorkChanged (state, value) {
        state.network = value;
    },
    updateAccountsChanged (state, value) {
        state.address = value;
    },
    updateWalletModel (state, value) {
        state.walletModel = value;
    },
    updateMyWalletModel (state, value) {
        state.myWalletModel = value;
    },
    updateStakeStartTime (state, value) {
        state.stake.startTime = value;
    },
    updateStakeTime (state, value) {
        state.stake.time = value;
    },
    updateStakeLeftTime (state, value) {
        state.stake.leftTime = value;
    },
    updateStakeStatus (state, value) {
        state.stake.status = value;
    },

    updateStakeStartInWeek (state, value) {
        state.stake.startInWeek = value;
    },

    updateCoinList (state, value) {
        state.coinList = value;
    },
    updateSelectCoin (state, value) {
        state.xCoin = value;
    },
    updateReload (state, value) {
        state.reloadTime = value;
    },
    updateDisNotConnet (state, value) {
        state.disConnet = value;
    },
    updateIsRouterAlive (state, value) {
        state.isRouterAlive = value;
    },
    updateRouterLoading (state, value) {
        state.routerLoading = value;
    },
    updateBarShow (state, value) {
        state.barShow = value;
    }
};
const actions = {
    postAssetsInfo ({
        commit,
        state
    }, params) {
        return commit('updateCoinList', params);
    },
    getIostAddress ({
        commit,
        state
    }) {
        //if (!window.ethereum) {
        if (!window.IWalletJS) {
            Vue.prototype.$message({
                message: i18n.t('Please Install chrome iWallet'),
                type: 'warning'
            });
            return;
        }
        const iost = window.IWalletJS.newIOST(window.IOST);

        //window.ethereum.enable().then((accounts) => {
        window.IWalletJS.enable().then((account) => {
            console.log('==========accountIost', account)

            //commit('updateAccountsChanged', accounts[0])
            commit('updateAccountsChanged', account)
            commit('updateWalletModel', false);
        }).catch((err) => {
            alert('==========chrome iwallet ERROR')
            errorHandler(err);
        })
    }
};
export default new Vuex.Store({
    state,
    mutations,
    actions,
    strict: debug
});
