// import React, {useEffect} from 'react';
// import {Route, Switch, useHistory} from "react-router-dom";
// import Theme from "~/styledComponents/Theme";
// import loadable from "@loadable/component";
// import useWallet from "~/hooks/useWallet";
// import useWindowDimensions from "~/hooks/useWindowDimensions";
// import {useRecoilState} from "recoil";
// import {windowSizeState} from "~/hooks/atomState";
// import useScrollPosition from "~/hooks/useScrollPosition";
// import ComUtil from "~/util/ComUtil";
//
// const Template = loadable(() => import('~/components/template'))
// const Home = loadable(() => import('~/components/home'))
// const About = loadable(() => import('~/components/about'))
//
// const CheckingWrap = loadable(() => import('~/components/common/wraps/CheckingWrap'))
// const Checking = loadable(() => import('~/components/checking'))
// const Trade = loadable(() => import('~/components/trade'))
//
// const Loan = loadable(() => import('~/components/loan'))
// const Exchange = loadable(() => import('~/components/exchange'))
// const CreditAnalysis = loadable(() => import('~/components/creditAnalysis'))
// const Payment = loadable(() => import('~/components/payment'))
// const Portfolio = loadable(() => import('~/components/portfolio'))
// const ConnectWalletModal = loadable(() => import('~/components/common/modals/ConnectWalletModal'))
// const MenuModal = loadable(() => import('~/components/common/modals/MenuModal'))
// const MyDonModal = loadable(() => import('~/components/common/modals/MyDonModal'))
//
// const UserRoutes = (props) => {
//     const history = useHistory()
//
//     console.log({history})
//
//     const {connectIWallet} = useWallet()
//
//     const {width} = useWindowDimensions()
//     const [, setSize] = useRecoilState(windowSizeState)
//
//     useScrollPosition()
//
//     useEffect(() => {
//
//         async function fetch() {
//             await initWallet()
//             connectIWallet()
//         }
//
//         history.listen(() => window.scrollTo({top: 0}))
//
//         fetch()
//
//     }, [])
//
//     const initWallet = async() => {
//         window.myWallet = {};
//         window.myWallet.IWallet = window.IWalletJS ? window.IWalletJS : null;
//         await ComUtil.delay(3000)
//         window.myWallet.Jetstream = window.jet && window.jet.iost ? window.jet.iost : null;
//
//         console.log("window.myWallet.IWallet===",window.myWallet.IWallet)
//         console.log("window.myWallet.Jetstream===",window.myWallet.Jetstream)
//     }
//
//
//     useEffect(() => {
//         // lg, md, sm
//         setSize(ComUtil.getWindowSize(width))
//
//     }, [width])
//
//     useEffect(() => {
//
//         console.log({history})
//     }, [history.location.key])
//
//     return (
//         <Switch>
//             <Route exact path={'/'}>
//                 <Theme.Gray />
//                 <Home />
//             </Route>
//
//             <Route path={'/'}>
//                 <Switch>
//                     <Template>
//                         <Theme.Gray />
//
//                         <Route exact path={'/about'} >
//                             <Theme.White />
//                             <About/>
//                         </Route>
//                         <Route exact path={'/checking'} >
//                             <CheckingWrap>
//                                 <Checking />
//                             </CheckingWrap>
//                         </Route>
//
//                         <Route exact path={'/trade/:tokenName'} >
//                             <CheckingWrap>
//                                 <Trade />
//                             </CheckingWrap>
//                         </Route>
//                         <Route exact path={'/loan'} >
//                             <Loan />
//                         </Route>
//                         <Route exact path={'/exchange'} >
//                             <Exchange />
//                         </Route>
//                         <Route exact path={'/credit'} >
//                             <CreditAnalysis />
//                         </Route>
//                         <Route exact path={'/payment'} >
//                             <Payment />
//                         </Route>
//                         <Route exact path={'/portfolio'} >
//                             <Portfolio />
//                         </Route>
//                     </Template>
//                 </Switch>
//
//                 <ConnectWalletModal />
//                 <MenuModal />
//                 <MyDonModal />
//
//             </Route>
//         </Switch>
//     );
// };
// export default UserRoutes;
