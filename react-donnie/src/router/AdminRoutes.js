import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import {PrivateRoute} from "./PrivateRoute";
import loadable from '@loadable/component'

// const Home = loadable(() => import('~/components/admin/home'));
// const Notice = loadable(() => import('~/components/admin/notice'));
// const Faq = loadable(() => import('~/components/admin/faq'));
// const Error = loadable(() => import('~/components/common/templates/Error'));

const IDO = loadable(() => import('~/components/admin/ido'));

const ErcDonDepositSwap = loadable(() => import('~/components/admin/ercDonDepositSwap'));
const ErcDonWithdrawSwap = loadable(() => import('~/components/admin/ercDonWithdrawSwap'));

//idoErc추가 ///////////////////////
const IdoErcDepositSwap = loadable(() => import('~/components/admin/idoErcDepositSwap'));
const IdoErcWithdrawSwap = loadable(() => import('~/components/admin/idoErcWithdrawSwap'));


const IwDepositSwap = loadable(() => import('~/components/admin/iwDepositSwap'));
const IwWithdrawSwap = loadable(() => import('~/components/admin/iwWithdrawSwap'));

const BnbDepositSwap = loadable(() => import('~/components/admin/bnbDepositSwap'));
const BnbWithdrawSwap = loadable(() => import('~/components/admin/bnbWithdrawSwap'));

const AvaxDepositSwap = loadable(() => import('~/components/admin/avaxDepositSwap'));
const AvaxWithdrawSwap = loadable(() => import('~/components/admin/avaxWithdrawSwap'));

const Home = loadable(() => import('~/components/admin/home'));
const Exchange = loadable(() => import('~/components/admin/exchange'));
const Properties = loadable(() => import('~/components/admin/properties'));
const ExContractHistory = loadable(() => import('~/components/admin/exContractHistory'));

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

//idoErc 추가
const IdoWitchDepositSwap = (props) => <IdoErcDepositSwap {...props}/>
const IdoWitchWithdrawSwap = (props) => <IdoErcWithdrawSwap {...props}/>

//coops, tvs: idoErc활용.
const CoopsDepositSwap = (props) => <IdoErcDepositSwap {...props}/>
const CoopsWithdrawSwap = (props) => <IdoErcWithdrawSwap {...props}/>
const TvsDepositSwap = (props) => <IdoErcDepositSwap {...props}/>
const TvsWithdrawSwap = (props) => <IdoErcWithdrawSwap {...props}/>


//Wrapper 를 통해 새로운 객체로 인식해서 didMount 를 일으켜 주기 위함
const IwBlyDepositSwap = (props) => <IwDepositSwap {...props}/>
const IwBtcDepositSwap = (props) => <IwDepositSwap {...props}/>
const IwEthDepositSwap = (props) => <IwDepositSwap {...props}/>

const IwBlyWithdrawSwap = (props) => <IwWithdrawSwap {...props}/>
const IwBtcWithdrawSwap = (props) => <IwWithdrawSwap {...props}/>
const IwEthWithdrawSwap = (props) => <IwWithdrawSwap {...props}/>

export default () => {
    return (
        <Switch>
            <PrivateRoute exact path="/admin" type={'admin'}>
                <Home />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/home" type={'admin'}>
                <Home />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/exchange" type={'admin'}>
                <Exchange/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/properties" type={'admin'}>
                <Properties />
            </PrivateRoute>

            <PrivateRoute exact path="/admin/ido" type={'admin'}>
                <IDO />
            </PrivateRoute>

            {/*   don Token  */}
            <PrivateRoute exact path="/admin/ercDonDepositSwap" type={'admin'}>
                <ErcDonDepositSwap />
            </PrivateRoute>

             {/*ercDonWithdrawSwap open 202104 */}
            <PrivateRoute exact path="/admin/ercDonWithdrawSwap" type={'admin'}>
                <ErcDonWithdrawSwap />
            </PrivateRoute>


            {/*   ido witch Token  */}
            <PrivateRoute exact path="/admin/idoWitchDepositSwap" type={'admin'}>
                <IdoWitchDepositSwap iwTokenName={'iwwitch'} ercTokenName={'WITCH'} key={'idoWitchDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/idoWitchWithdrawSwap" type={'admin'}>
                <IdoWitchWithdrawSwap iwTokenName={'iwwitch'} ercTokenName={'WITCH'} key={'idoWitchWithdrawSwap'}/>
            </PrivateRoute>

            {/*   Coops/Tvs Token  */}
            <PrivateRoute exact path="/admin/coopsDepositSwap" type={'admin'}>
                <CoopsDepositSwap iwTokenName={'iwcoops'} ercTokenName={'COOPS'} key={'coopsDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/coopsWithdrawSwap" type={'admin'}>
                <CoopsWithdrawSwap iwTokenName={'iwcoops'} ercTokenName={'COOPS'} key={'coopsWithdrawSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/tvsDepositSwap" type={'admin'}>
                <TvsDepositSwap iwTokenName={'iwtvs'} ercTokenName={'TVS'} key={'tvsDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/tvsWithdrawSwap" type={'admin'}>
                <TvsWithdrawSwap iwTokenName={'iwtvs'} ercTokenName={'TVS'} key={'tvsWithdrawSwap'}/>
            </PrivateRoute>


            {/*    bly Token  */}
            <PrivateRoute exact path="/admin/iwblyDepositSwap" type={'admin'}>
                <IwBlyDepositSwap iwTokenName={iwStore.bly.tokenName} ercTokenName={iwStore.bly.ercTokenName} key={'iwblyDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwblyWithdrawSwap" type={'admin'}>
                <IwBlyWithdrawSwap iwTokenName={iwStore.bly.tokenName} ercTokenName={iwStore.bly.ercTokenName} key={'iwblyWithdrawSwap'}/>
            </PrivateRoute>

            {/*    btc Token  */}
            <PrivateRoute exact path="/admin/iwbtcDepositSwap" type={'admin'}>
                <IwBtcDepositSwap iwTokenName={iwStore.wbtc.tokenName} ercTokenName={iwStore.wbtc.ercTokenName} key={'iwbtcDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwbtcWithdrawSwap" type={'admin'}>
                <IwBtcWithdrawSwap iwTokenName={iwStore.wbtc.tokenName} ercTokenName={iwStore.wbtc.ercTokenName} key={'iwbtcWithdrawSwap'}/>
            </PrivateRoute>

            {/*    eth Token  */}
            <PrivateRoute exact path="/admin/iwethDepositSwap" type={'admin'}>
                <IwEthDepositSwap iwTokenName={iwStore.weth.tokenName} ercTokenName={iwStore.weth.ercTokenName} key={'iwethDepositSwap'}/>
            </PrivateRoute>
            <PrivateRoute exact path="/admin/iwethWithdrawSwap" type={'admin'}>
                <IwEthWithdrawSwap iwTokenName={iwStore.weth.tokenName} ercTokenName={iwStore.weth.ercTokenName} key={'iwethWithdrawSwap'}/>
            </PrivateRoute>

            {/* bnb Token*/}
            <PrivateRoute exact path="/admin/bnbDepositSwap" type={'admin'}>
                <BnbDepositSwap />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/bnbWithdrawSwap" type={'admin'}>
                <BnbWithdrawSwap />
            </PrivateRoute>

            {/* avax Token*/}
            <PrivateRoute exact path="/admin/avaxDepositSwap" type={'admin'}>
                <AvaxDepositSwap />
            </PrivateRoute>
            <PrivateRoute exact path="/admin/avaxWithdrawSwap" type={'admin'}>
                <AvaxWithdrawSwap />
            </PrivateRoute>

            <PrivateRoute exact path="/admin/exContractHistory" type={'admin'}>
                <ExContractHistory />
            </PrivateRoute>

        </Switch>
    )
}