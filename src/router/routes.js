const Main = () => import(/* webpackChunkName:'Main' */ '@/views/main/index.vue');

const Savings = () => import(/* webpackChunkName:'Farmer' */ '@/views/savings/index.vue');
const Trade = () => import(/* webpackChunkName:'Farmer' */ '@/views/savings/trade.vue');

const About = () => import('@/views/about/index.vue');
const Loan = () => import('@/views/loan/index.vue');
const Exchange = () => import('@/views/exchange/index.vue');
const CreditAnalysis = () => import('@/views/creditAnalysis/index.vue');
const Payment = () => import('@/views/payment/index.vue');
const FundManagement = () => import('@/views/fundManagement/index.vue');
const ComingSoon = () => import('@/views/commingSoon/index.vue');

// const showComingSoonPage = true
const showComingSoonPage = false //for iostTest

const routes = [
    {
        path: '/about',
        name: 'About',
        component: About,
        meta: {
            title: 'About',
            key: 'about'
        }
    },
    {
        path: '/checking',
        name: 'Checking',
        component: showComingSoonPage ? ComingSoon : Savings,
        meta: {
            title: 'Checking',
            key: 'checking'
        }
    },
    {
        path: '/trade',
        name: 'Trade',
        component: showComingSoonPage ? ComingSoon : Trade,
        meta: {
            title: 'Trade',
            key: 'trade'
        }
    },
    {
      path: '/loan',
      name: 'Loan',
      component: showComingSoonPage ? ComingSoon : Loan,
      meta: {
          title: 'Loan',
          key: 'loan'
      }
    },
    {
      path: '/exchange',
      name: 'Exchange',
      component: showComingSoonPage ? ComingSoon : Exchange,
      meta: {
          title: 'Exchange',
          key: 'exchange'
      }
    },
    {
        path: '/CreditAnalysis',
        name: 'CreditAnalysis',
        component: showComingSoonPage ? ComingSoon : CreditAnalysis,
        meta: {
            title: 'CreditAnalysis',
            key: 'creditAnalysis'
        }
    },
    {
      path: '/Payment',
      name: 'Payment',
      component: showComingSoonPage ? ComingSoon : Payment,
      meta: {
          title: 'Payment',
          key: 'payment'
      }
    },
    {
      path: '/FundManagement',
      name: 'FundManagement',
      component: showComingSoonPage ? ComingSoon : FundManagement,
      meta: {
          title: 'FundManagement',
          key: 'fundManagement'
      }
    },
    {
        path: '/',
        name: 'Main',
        component: Main,
        meta: {
            title: 'Main',
            key: 'main'
        },
    },
]


export default routes;
