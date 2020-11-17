import Vue from 'vue'
import Router from 'vue-router';
import Routes from './routes.js';
import store from '@/store'
Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [].concat(Routes)
});
Vue.routerGo = router;

router.beforeEach((to, from, next) => {

    if(to.path === '/'){
        store.commit('updateBarShow', false);
    }else{
        store.commit('updateBarShow', true);
    }

    next();
})

export default router;
