import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import {PrivateRoute} from "./PrivateRoute";
import loadable from '@loadable/component'

// const Home = loadable(() => import('~/components/admin/home'));
// const Notice = loadable(() => import('~/components/admin/notice'));
// const Faq = loadable(() => import('~/components/admin/faq'));
// const Error = loadable(() => import('~/components/common/templates/Error'));

const ErcDonDepositSwap = loadable(() => import('~/components/admin/ercDonDepositSwap'));
const ErcDonWithdrawSwap = loadable(() => import('~/components/admin/ercDonWithdrawSwap'));

const IwDepositSwap = loadable(() => import('~/components/admin/iwDepositSwap'));
const IwWithdrawSwap = loadable(() => import('~/components/admin/iwWithdrawSwap'));

const Home = loadable(() => import('~/components/admin/home'));
const Properties = loadable(() => import('~/components/admin/properties'));

const iwStore = {
    wbtc: {
        tokenName: 'iwbtc',
        ercTokenName: 'wBTC'
    },
    weth: {
        tokenName: 'iweth',
        ercTokenName: 'wETH'
    },
    bly: {
        tokenName: 'iwbly',
        ercTokenName: 'BLY'
    },
    // link: {
    //     tokenName: 'iwlink',
    //     ercTokenName: 'LINK'
    // }
}

export default () => {
    return (
        <Switch>
            <PrivateRoute exact path="/admin" type={'admin'}>
                <Home />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/home" type={'admin'}>
                <Home />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/properties" type={'admin'}>
                <Properties />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/ercDonDepositSwap" type={'admin'}>
                <ErcDonDepositSwap />
            </PrivateRoute>

            {/* ercDonWithdrawSwap 사용안함 */}
            {/*<PrivateRoute exact path="/admin/ercDonWithdrawSwap" type={'admin'}>*/}
            {/*    <ErcDonWithdrawSwap />*/}
            {/*</PrivateRoute>*/}

            {/* iw Token */}
            <PrivateRoute exact path="/admin/iwbtcDepositSwap" type={'admin'}>
                <IwDepositSwap iwTokenName={iwStore.wbtc.tokenName} ercTokenName={iwStore.wbtc.ercTokenName}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwbtcWithdrawSwap" type={'admin'}>
                <IwWithdrawSwap iwTokenName={iwStore.wbtc.tokenName} ercTokenName={iwStore.wbtc.ercTokenName}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwethDepositSwap" type={'admin'}>
                <IwDepositSwap iwTokenName={iwStore.weth.tokenName} ercTokenName={iwStore.weth.ercTokenName}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwethWithdrawSwap" type={'admin'}>
                <IwWithdrawSwap iwTokenName={iwStore.weth.tokenName} ercTokenName={iwStore.weth.ercTokenName}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwblyDepositSwap" type={'admin'}>
                <IwDepositSwap iwTokenName={iwStore.bly.tokenName} ercTokenName={iwStore.bly.ercTokenName}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwblyWithdrawSwap" type={'admin'}>
                <IwWithdrawSwap iwTokenName={iwStore.bly.tokenName} ercTokenName={iwStore.bly.ercTokenName}/>
            </PrivateRoute>


        </Switch>
    )
}