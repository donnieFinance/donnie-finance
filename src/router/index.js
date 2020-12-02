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

router.afterEach(() => {
    // Check if a new cache is available on page load.
    window.addEventListener('load', function () {
        window.applicationCache.addEventListener('updateready', function () {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                // Browser downloaded a new app cache.
                // Swap it in and reload the page to get the new hotness.
                window.applicationCache.swapCache()
                window.location.reload()
            } else {
                // Manifest didn't changed. Nothing new to server.
            }
        }, false)
    }, false)
})

export default router;
