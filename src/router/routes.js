const Main = () => import(/* webpackChunkName:'Main' */ '@/views/main/index.vue');

const Savings = () => import(/* webpackChunkName:'Farmer' */ '@/views/savings/index.vue');
const Trade = () => import(/* webpackChunkName:'Farmer' */ '@/views/savings/trade.vue');

const About = () => import('@/views/about/index.vue');
const Loan = () => import('@/views/loan/index.vue');
const Exchange = () => import('@/views/exchange/index.vue');
const CreditScore = () => import('@/views/creditScore/index.vue');
const Card = () => import('@/views/card/index.vue');
const FundManagement = () => import('@/views/fundManagement/index.vue');
const ComingSoon = () => import('@/views/commingSoon/index.vue');

const showComingSoonPage = true
// const showComingSoonPage = false //for iostTest

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
        path: '/savings',
        name: 'Savings',
        component: showComingSoonPage ? ComingSoon : Savings,
        meta: {
            title: 'Savings',
            key: 'savings'
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
        path: '/CreditScore',
        name: 'CreditScore',
        component: showComingSoonPage ? ComingSoon : CreditScore,
        meta: {
            title: 'CreditScore',
            key: 'creditScore'
        }
    },
    {
      path: '/Card',
      name: 'Card',
      component: showComingSoonPage ? ComingSoon : Card,
      meta: {
          title: 'Card',
          key: 'card'
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
