// import React, {useEffect, useState} from 'react';
// import properties from '~/properties'
// import {useRecoilState} from "recoil";
// import {
//     checkingCoinListState,
//     checkingCoinListLoadingState,
//     checkingCoinListSelector,
//     checkingReloadTimeSelector, checkingStakeSelector,
//     checkingStakeStatusSelector,
//     checkingStakeStartTimeSelector,
//     checkingStakeTimeSelector,
//     checkingStakeLeftTimeSelector,
//     checkingStakeStartInWeekSelector, myAddressSelector,
// } from '~/hooks/atomState'
// import BigNumber from 'bignumber.js'
// import iostApi from "~/lib/iostApi";
// import priceApi, {getIostUsd} from "~/lib/priceApi";
// import useInterval from '~/hooks/useInterval'
// import ComUtil from "~/util/ComUtil";
//
// // Checking or Trade :: 공통 state 정보
// function CheckingWrap({children}) {
//
//     const [address,] = useRecoilState(myAddressSelector);
//
//     // contract 정보 (iost 및 don)
//     const contractList = properties.contractList;
//
//     // 날짜 갱신 및 공급량 갱신 recoil 변수
//     const [reloadTime,setReloadTime] = useRecoilState(checkingReloadTimeSelector)
//
//     /* Checking & Trade 타이머 정보 */
//     // stake status 정보
//     const [stakeStatus,setStakeStatus] = useRecoilState(checkingStakeStatusSelector)
//     // stake startTime 정보
//     const [stakeStartTime,setStakeStartTime] = useRecoilState(checkingStakeStartTimeSelector)
//     // stake time 정보
//     const [stakeTime,setStakeTime] = useRecoilState(checkingStakeTimeSelector)
//     // stake startInWeek 정보
//     const [stakeStartInWeek,setStakeStartInWeek] = useRecoilState(checkingStakeStartInWeekSelector)
//     // 카운트 다운 표시 용도
//     const [stakeLeftTime,setStakeLeftTime] = useRecoilState(checkingStakeLeftTimeSelector)
//
//     // Checking CoinList 정보
//     const [checkingCoinList, setCheckingCoinList] = useRecoilState(checkingCoinListState)
//     // Checking CoinList loading 여부
//     const [loading, setLoading] = useRecoilState(checkingCoinListLoadingState)
//
//     // 시작시간 일주일 전 부터 사용되는 인터벌 id [내부 인터벌 용도]
//     const [openTimeInterval, setOpenTimeInterval] = useState(null);
//     //  종료시간 체크용 [내부 인터벌 용도]
//     const [timeInterval, setTimeInterval] = useState(null);
//
//     // openTime, endTime [내부 용도]
//     const [openTime,setOpenTime] = useState(null);
//     const [endTime,setEndTime] = useState(null);
//
//
//     useEffect(() => {
//         init();
//     }, [])
//
//     useEffect(() => {
//         // if (address !== ''){
//         // alert("useEffect > statusChange() ")
//             statusChange()
//         // }
//     }, [stakeTime, address]) //stakeTime 이 바뀌어 반영되기 전에 setStatusChange() 가 비동기로 호출되어 status 계산을 제대로 할 수 없는 버그를 없애기 위해 statusChange와 address 모두 넣어줌
//
//     useEffect(() => {
//
//         if (reloadTime !== null) {
//             // console.log('reloadTime interval')
//
//             async function fetch() {
//
//                 const totalList = await getTotalSupply()
//                 const newCheckingCoinList = mergeList(totalList)
//                 // console.log('reloadTime interval > totalSupply update')
//                 setCheckingCoinList(newCheckingCoinList)
//             }
//
//             fetch()
//         }
//
//
//     }, [reloadTime]);
//
//
//     useInterval(async() => {
//
//         // console.log('setReloadTime interval')
//
//         setReloadTime(Date.parse(new Date()))
//     }, 15000);
//
//     // openTimeInterval
//     useInterval(async() => {
//
//         // console.log('openTimeInterval interval')
//
//         const vOpenTime = openTime - 1000;
//         setOpenTime(vOpenTime)
//
//         setStakeTime(vOpenTime)
//         setStakeLeftTime(ComUtil.leftTime(vOpenTime))
//
//         statusChange();
//
//         if (vOpenTime <= 0) {
//             // console.log('openTimeInterval ended')
//
//             // clearInterval
//             setOpenTimeInterval(null)
//
//             // 20210208 - 시작시간되면 자동 시작하도록 timer재설정.
//             let endTime =  properties.UNTIL; //endTime = (startTime * 1000 + properties.UNTIL) - Date.parse(new Date())
//             setEndTime(endTime)
//             setLoading(true);
//             init(); //처음부터 재호출해서 화면 다시 그리기.
//
//         }
//     }, openTimeInterval);
//
//     // timeInterval
//     useInterval(async() => {
//
//         //console.log('timeInterval interval - endTime:' + endTime) : endTime 1초씩 줄어듬.
//
//         const vEndTime = endTime - 1000;
//         setEndTime(vEndTime)
//
//         setStakeTime(vEndTime)
//         setStakeLeftTime(ComUtil.leftTime(vEndTime))
//
//         statusChange();
//
//         if (vEndTime <= 0) {
//
//             // console.log('timeInterval interval ended')
//
//             // clearInterval
//             setTimeInterval(null);
//             getContractDetail()
//         }
//
//     }, timeInterval);
//
//     const mergeList = (mergeList) => {
//         const newCheckingCoinList = checkingCoinList.map((item) => {
//                 const name = item.name
//                 const mergeItem = mergeList.find(t => t.name === name)
//                 return {
//                     ...item,
//                     ...mergeItem
//                 }
//             }
//         );
//         return newCheckingCoinList
//     }
//
//     // 초기 시작
//     const init = async () => {
//         await getContractDetail();
//         await getStartTime()
//
//         //console.log('loading:false')
//         setLoading(false)
//     }
//
//     const getContractDetail = async () => {
//
//         //console.log('getCoinDetail:')
//         const result = await Promise.all([getIsOpen(), getTotalSupply(), getCoinPrice()])
//
//         const combinedCoinList = checkingCoinList.map(item => {
//
//             const newItem = {...item}
//
//
//             const name = newItem.name
//
//             const isOpenList = result[0];
//             const totalList = result[1];
//             const coinPriceList = result[2];
//
//             const isOpenItem = isOpenList.find(c => c.name === name)
//             const totalItem = totalList.find(c => c.name === name)
//             const coinPriceItem = coinPriceList.find(c => c.name === name)
//
//             newItem.isOpen = isOpenItem.isOpen
//             newItem.total = totalItem.total
//             newItem.usd = coinPriceItem.usd
//             newItem.dony = coinPriceItem.dony
//
//             return newItem
//         })
//
//         //console.log({'getContractDetail - checkingCoinList': combinedCoinList})
//         const newCheckingCoinList =  await getAllRewardRate(combinedCoinList)
//
//         setCheckingCoinList(newCheckingCoinList)
//     }
//
//
//     const statusChange = () => {
//
//         //console.log('statusChange()')
//
//         let total = 0;
//         const newCheckingCoinList = checkingCoinList.map(item => {
//             const newItem = {...item}
//             if (typeof (newItem.total) === 'number' && typeof (newItem.usd) === 'number') {
//                 newItem.totalBalance = new BigNumber(newItem.total).times(newItem.usd).toNumber();
//             }
//             return newItem
//         })
//
//         let notStart = stakeStartTime - Date.parse(new Date()) > 0 ? true : false;
//
//         // console.log("|||stakeTime"+stakeTime)
//         // alert("in statusChange stakeTime : "+stakeTime)
//         if (stakeTime < 0) {
//             // console.log('==> stake.time <0 : ENDED ==== comingSoon')
//             setStakeStatus(2) //ENDED 추가 20200107
//         }
//         else if (stakeTime === 0) { //(notStart || this.stake.time === 0) {
//             // console.log('00 - NOT DEPLOYED ')
//             setStakeStatus(1)
//
//             newCheckingCoinList.map(item => {
//                 item.status = 0
//             })
//
//             getContractDetail(); //startInWeek -> start Change force.
//         }
//         //DON_ADD : startInWeek (30일 이내에 시작 예정)
//         else if (notStart && (stakeStartTime - Date.parse(new Date())) <= properties.DAYS30) { //30일 하드코딩,  ONE_WEEK=1주 하드코딩
//             //console.log('33 : START IN A WEEK ');
//
//             //status = 0
//             //startInWeek = 1
//             setStakeStartInWeek(1);
//         }
//
//         //RUNNING - in period(UNTIL or DAYS60)
//         else if (!notStart && stakeTime > 0 && (Date.parse(new Date()) - stakeStartTime) <= properties.UNTIL) {
//             setStakeStatus(1);//running
//             //console.log('11 Started- RUNNING  ')
//
//             // newCoinList = sortByKey(newCheckingCoinList, 'totalBalance');
//             sortByKey(newCheckingCoinList, 'totalBalance');
//             //if (this.address) { //지갑 연결시면 상태 변경. - 20201103
//             newCheckingCoinList.map(item => {
//                 item.status = 1
//                 total += item.totalBalance
//             })
//         }else { //종료 END status 추가: 20200107
//             // console.log('33 Endend  ')
//             newCheckingCoinList.map(item => {
//                 item.status = 2
//                 //total += item.totalBalance
//             })
//         }
//
//         //console.log({'statusChange - checkingCoinList': newCheckingCoinList})
//         setCheckingCoinList(newCheckingCoinList)
//     }
//
//     const getIsOpen = async() => {
//         return new Promise(async(resolve) => {
//             const list = []
//             const promises = checkingCoinList.map((e, i) =>
//                 getPoolIsOpen(e.name).then(result => {
//                     list.push({
//                         name: e.name,
//                         isOpen: result
//                     })
//                 }))
//
//             await Promise.all(promises)
//
//             resolve(list)
//         })
//     }
//
//     const getStartTime = async() => {
//         let startTime = await getPoolStartTime();
//         // console.log('getStartTime: ' + startTime);
//         //TODO 아래 삭제할것(테스트용) [delete]
//         // startTime = 1613433600 // 2021.2.16 09:00:00AM
//
//         const v_stakeStartTime = startTime * 1000; //20201027:08:55
//         setStakeStartTime(v_stakeStartTime);
//         //after peroid TEST
//         //this.$store.commit('updateStakeStartTime', (1600819200 + Server.UNTIL ) * 1000); // +시:1주일이내 시작:startInWeek   -:2단계
//         //this.$store.commit('updateStakeStartTime', (1600819200 + 900 ) * 1000); // +시:1주일이내 시작:startInWeek   -:2단계
//
//         /////////// periodFinith()도 여기서 호출 - 20201103 : 지감 미로그인시 오류때문. /////////////////////////////////////////////////
//         let endTime = (startTime * 1000 + properties.UNTIL) - Date.parse(new Date());
//
//         // console.log('===========iost-PeriodFinish:' + endTime, v_stakeStartTime, properties.UNTIL);
//         // alert("in getStartTime setStakeTime("+endTime+"+")
//
//         setStakeTime(endTime)
//         // console.log('===========iost-endTime:' + endTime)
//
//         let openTime = v_stakeStartTime - Date.parse(new Date());
//
//         //console.log('000')
//         //시작날짜로부터 일주일 이내에 접어 들었을때
//         if (openTime > 0 && openTime <= properties.DAYS30 ) { //ONE_WEEK * 5 ) { //5주 하드코딩 => 오픈전 30일로 변경.
//             setOpenTime(openTime);
//             setStakeTime(openTime)
//             setStakeLeftTime(ComUtil.leftTime(openTime))
//             setOpenTimeInterval(1000);
//             //console.log('111')
//         }else{
//             setOpenTimeInterval(null);
//             //시작 하였을때
//             if (endTime >= 0 && endTime <= properties.UNTIL) { //30 days
//                 setEndTime(endTime);
//                 setStakeTime(endTime)
//                 setStakeLeftTime(ComUtil.leftTime(endTime))
//                 setTimeInterval(1000);
//                 //console.log('222')
//             } else {
//
//                 setStakeLeftTime(ComUtil.leftTime(0))
//                 console.log('getStartTime > statusChange()')
//                 // alert("in getStatusTime > statusChange()")
//                 statusChange();
//                 //clearInterval
//                 setTimeInterval(null);
//                 //console.log('333')
//             }
//         }
//
//     }
//
//     const getCoinPrice = async() => {
//
//         return new Promise(async (resolve) => {
//
//             //IOST GET PRICE https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=2405
//             //paring data."2405".quote.USD.price
//             let iost_usdt = 0.02; //default value, in case of error.
//
//             try {
//                 //let {data: res} = await priceApi.getCmcUsd(2405);
//                 let {data: res} = await priceApi.getIostUsd();
//                 if (res) {
//                     //let tempPrice = res.data[2405].quote.USD.price; //data USD parsing
//                     let tempPrice = res; //data USD parsing
//                     if (tempPrice && !isNaN(tempPrice)) {
//                         iost_usdt = parseFloat(tempPrice);
//                         // console.log('iost_usdt from proxy:' + tempPrice)
//                     }
//                 }
//             }catch (error) {
//                 console.log(error);
//             }
//
//             // console.log("iost_usdt===",iost_usdt)
//
//             let v_DONYPrice = 2.5; //2.5달러 기본값
//             try {
//                 let {data:res} = await priceApi.getDonUsd();
//                 if (res) {
//                     let tempPrice = res; //data USD parsing
//                     if (tempPrice && !isNaN(tempPrice)) {
//                          v_DONYPrice  = parseFloat(tempPrice);
//                          // console.log('DONYPrice from proxy:' + v_DONYPrice)
//                     }
//                 }
//
//             } catch (error) {
//                 console.log(error);
//             }
//             // console.log("DONYPrice===",v_DONYPrice)
//
//             let husdPrice = 1;
//             let pptPrice = iost_usdt * 1.5; //iost가격의 1.5배로 임의설정.    0.02;
//
//             resolve([
//                 {name: 'iost', usd: new BigNumber(iost_usdt).toNumber(), dony: v_DONYPrice},
//                 {name: 'don', usd: new BigNumber(v_DONYPrice).toNumber(), dony: v_DONYPrice},
//                 {name: 'husd', usd: new BigNumber(husdPrice).toNumber(), dony: v_DONYPrice},
//                 {name: 'ppt', usd: new BigNumber(pptPrice).toNumber(), dony: v_DONYPrice},
//             ])
//
//
//         })
//     }
//
//     const getCurrentCoinList = () => checkingCoinList.map(item => ({...item}))
//
//     const getTotalSupply = async () => {
//         return new Promise(async (resolve) => {
//             const list = []
//             const promises = checkingCoinList.map((e, i) =>
//                 getPoolTotalSupply(e.name).then(result => {
//                     list.push({
//                         name: e.name,
//                         total: isNaN(result) ? 0 : parseFloat(result)
//                     })
//                 }).catch(err => {
//                     console.log('=================error================')
//                 })
//             )
//
//             await Promise.all(promises)
//
//             resolve(list)
//         })
//     }
//
//     const getAllRewardRate = async (coinList) => {
//
//         const newCoinList = []
//         const promises = coinList.map(item =>
//             getPoolRewardRate(item.name).then(result => {
//                 item.rate = calcAPR(result, item.total, item.dony, item.usd)
//                 //console.log({result: result, rate: item.rate, dony: item.dony})
//             })
//         )
//
//         await Promise.all(promises)
//
//         return coinList
//     }
//
//     const getPoolIsOpen = async (tokenName) => {
//         console.log('getPoolIsOpen:' + tokenName)
//         console.log(contractList[tokenName])
//         const p_Pool = contractList[tokenName].pool;
//
//         return await iostApi.getPoolIsOpen(p_Pool);
//     }
//
//     const getPoolStartTime = async () => {
//         // pool의 startTime을 수정할 때  00testnet.txt 파일 참고해서 콘솔에서 실행가능함.
//         const p_iostPool = contractList['iost'].pool;
//         return await iostApi.getPoolStartTime(p_iostPool);
//     }
//
//     const getPoolTotalSupply = async (tokenName) => {
//         // pool의 startTime을 수정할 때  00testnet.txt 파일 참고해서 콘솔에서 실행가능함.
//         const p_Pool = contractList[tokenName].pool;
//         return await iostApi.getPoolTotalSupply(p_Pool);
//     }
//
//     const getPoolRewardRate = async (tokenName) => {
//         const p_Pool = contractList[tokenName].pool;
//         return await iostApi.getPoolRewardRate(p_Pool);
//     }
//
//
//     const sortByKey = (array, key) => {
//         return array.sort(function (a, b) {
//             let x = a[key];
//             let y = b[key];
//             return ((x > y) ? -1 : ((x > y) ? 1 : 0));
//         })
//     }
//
//     const calcAPR = (symbol, total, dony, usd) => {
//         return (((symbol / (total < 1 ? 1 : total) * dony) * 360 * 24 * 60 * 60) / usd) * 100;
//     }
//
//     return children;
// }
//
// export default CheckingWrap;
