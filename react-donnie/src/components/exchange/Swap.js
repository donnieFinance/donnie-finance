import React, {useState, useEffect} from 'react';
import {Div, Flex, Hr, Img, Right, Input, Button, Span} from "~/styledComponents/shared";
import properties from "~/properties";
import useModal from "~/hooks/useModal";
import TokenSelection from "~/components/common/contents/TokenSelection";
import SlippageTolerance from '~/components/common/contents/SlippageTolerance'

import {IoSwapVertical} from 'react-icons/io5'
import {AiOutlineSwap} from 'react-icons/ai'
import {FaChevronDown} from "react-icons/fa";
import {RiArrowUpDownLine} from 'react-icons/ri'
import {Modal, Tooltip} from "antd";

import {Heading, TokenBox} from './Components'
import {IoMdSettings} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";
import {useRecoilState} from "recoil";
import {usdPriceState, swapPairsState, connectWalletModalState, loadingState} from "~/hooks/atomState";
import {} from "~/hooks/atomState";
import useWallet from "~/hooks/useWallet";
import {useTranslation} from "react-i18next";
import iostApi from "~/lib/iostApi";
import useSize from "~/hooks/useSize";
import useInterval from "~/hooks/useInterval";
import {BsQuestionCircle} from 'react-icons/bs'

import {FaRegLaugh, FaRegLaughBeam, FaRegSmile, FaRegFrown} from 'react-icons/fa'

const StyledSetting = styled(Div)`
    color: ${color.info}; 
    &:hover {
        color: ${color.lightInfo};
    }
`;

const PROVIDER_FEE = 0.0008; //TODO 0.0025; //0.25% -> 0.0017 (panCake 기준)  0.08%
const PLATFORM_FEE = 0.0002; //TODO 0.0005; //0.05% -> 0.0003                0.02%
const TOTAL_FEE = new BigNumber(PROVIDER_FEE).plus(PLATFORM_FEE);
const MIN_TOKEN = new BigNumber("0.000001");

BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

const Swap = (props) => {

    const {sizeValue} = useSize()
    const {t} = useTranslation()

    // lang (en or ko)\
    const tMessage = t('message', {returnObjects: true})

    const [, setConnectWalletModalOpen] = useRecoilState(connectWalletModalState)
    const [, setLoadingState] = useRecoilState(loadingState)

    const {address} = useWallet()

    //1분마다 갱신되는 usdPrice
    const [usdPrice] = useRecoilState(usdPriceState)

    // [{don: "10.00000000", husd: "30.00000000", invariant: "300.00000000, swpPairKey: 'don_husd'}, ...]
    const [swapPairs, ] = useRecoilState(swapPairsState)

    const [tokenSelectionModalOpen, , , , , tokenSelectionToggle] = useModal();
    const [settingsModalOpen, , , , , settingsToggle] = useModal();
    const [rate, setRate] = useState(0.5)

    //어디가 계산되어야 할 지 여부
    const [estimated, setEstimated] = useState('to')

    //from token
    const [tokenFrom, setTokenFrom] = useState({
        tokenBalance: 0,    //total balance
        tokenName: null,
        img: null,
        balance: '',
        // estimated: false
    })

    //to token
    const [tokenTo, setTokenTo] = useState({
        tokenBalance: 0,    //total balance
        tokenName: null,
        img: null,
        balance: '',
        // estimated: false
    })

    //'from' or 'to'
    const [whichToken, setWhichToken] = useState('from')

    //Price
    const [priceSwitch, setPriceSwitch] = useState(true)
    const [price, setPrice] = useState('')


    const [result, setResult] = useState({
        minimumReceived: null,
        priceImpact: null,
        priceImpactStep: -1,
        transactionFee: null,
        visible: false
    })

    const [routeHusdAmountStr, setRouteHusdAmountStr] = useState("0.0")

    //Calculate all footer values
    useEffect(() => {
        //footer 계산
        calculate()
        calculatePrice()
        // changeSwapBalance('from', tokenFrom.balance)
    }, [tokenFrom, tokenTo, rate, usdPrice, whichToken])

    useEffect(() => {
        calculatePrice()
    }, [priceSwitch])

    //Price text (ex) 0.3 HUSD per DON
    // useEffect(() => {
    //     calculatePrice()
    // }, [tokenFrom, tokenTo,
    //     priceSwitch,
    //     swapPairs
    //     //usdPrice
    // ])


    //Setting change
    const onRateChange = (value) => {
        setRate(value)
    }

    const updateEstimatedBalance = (estimated, value) => {

        console.log({estimated})

        if (!tokenFrom.tokenName || !tokenTo.tokenName)
            return

        const balance = parseFloat(value)

        if (estimated === 'to') {

            //0.0001 보다 작으면 안되도록 함
            if (!balance || balance <= 0.0001) {

                //balance 초기화
                setTokenTo({
                    ...tokenTo,
                    balance: ''
                })

                return
            }

            const amount = getRouteSwapAmount(tokenFrom.tokenName, tokenTo.tokenName, balance)
            setTokenTo({
                ...tokenTo,
                balance: amount
            })
        }
        else {

            if (!balance) {

                //balance 초기화
                setTokenFrom({
                    ...tokenFrom,
                    balance: ''
                })

                return
            }

            const amount = getRouteSwapAmount(tokenFrom.tokenName, tokenTo.tokenName, balance)
            setTokenFrom({
                ...tokenFrom,
                balance: amount
            })
        }
    }

    //balance change
    const onBalanceChange = async (which, e) => {
        const {value} = e.target

        if (which === 'from') {

            //balance 업데이트
            setTokenFrom({
                ...tokenFrom,
                balance: value
            })

            // setEstimated('to')

            updateEstimatedBalance('to', value)

        }else {
            setTokenTo({
                ...tokenTo,
                balance: value
            })

            // setEstimated('from')

            updateEstimatedBalance('from', value)
        }
    }

    const needRoute = (symbol1, symbol2) => {
        if (symbol1 === "husd" || symbol2 === "husd" ||
            (symbol1 === "don" && symbol2 === "iost") || (symbol1 === "iost" && symbol2 === "don")) {
            return false;
        }
        return true;
    }

    //getCalculatedSwapAmount Wrapping 함수.
    //don<->iost swap아니고, husd가 symbol1,symbol2에 없을때, symbol1<->husd 후, husd<->symbol2 swap수행을 위해 symbol2 추정치 계산.
    const getRouteSwapAmount = (symbol1, symbol2, value) => {

        //일반적인 경우. - husd포함 혹은 don_iost pair
        if (!needRoute(symbol1, symbol2)) {

            console.log('일번적인 getCalculatedSwapAmount 호출');
            return getCalculatedSwapAmount(symbol1, symbol2, value);
        }

        console.log('route경유  getRouteSwapAmount 호출 ========= ');
        let routeHusdAmountStr = getCalculatedSwapAmount(symbol1, "husd", value);

        //routeHusdAmountStr (중간 husd값)은 state에 저장. - iostApi.routeSwapTokens 호출시 husd amount 값으로 사용됨.
        setRouteHusdAmountStr(routeHusdAmountStr)

        return getCalculatedSwapAmount("husd", symbol2, routeHusdAmountStr);

    }


    //Swap 될 Amount 계산 - return BigNumber type.
    const getCalculatedSwapAmount = (symbol1, symbol2, value) => {

        //to 일때
        // symbol1 = DON
        // symbol2 = HUSD
        // const symbol1 = tokenFrom.tokenName
        // const symbol2 = tokenTo.tokenName


        if (!symbol1 || !symbol2) {
            return null
        }

        if (!value) {
            return 0
        }

        const balance = new BigNumber(value)

        // const PROVIDER_FEE = 0.0008; //TODO 0.0025; //0.25% -> 0.0017 (panCake 기준)  0.08%
        // const PLATFORM_FEE = 0.0002; //TODO 0.0005; //0.05% -> 0.0003                0.02%
        // const TOTAL_FEE = new BigNumber(PROVIDER_FEE).plus(PLATFORM_FEE)



        const swapPair = ComUtil.findSwapPair(swapPairs, symbol1, symbol2)

        let amountData = swapPair//JSON.parse(storage.mapGet(mainPair, 'amountData'));
        // let providerData = JSON.parse(storage.mapGet(mainPair, 'providerData'));

        let providerGains = balance.multipliedBy(PROVIDER_FEE);  //0
        let platformGains = balance.multipliedBy(PLATFORM_FEE);  //0
        let totalFee = balance.multipliedBy(TOTAL_FEE); //1 * 0.0002 = 0.0002
        let amountToContract = balance.minus(platformGains);            //0 - 0 * 1 = 0

        //validation추가. gary(백엔드와 동일하게 추가)
        if (totalFee.lt(MIN_TOKEN)) totalFee = new BigNumber(0);


        let symbol1Pool = new BigNumber(amountData[symbol1]);  //10 DON

        //전체s1 + 수수료제외 입금액
        symbol1Pool = symbol1Pool.plus(balance.minus(totalFee)); //10 += 1 * 1 - 0 * 1 = 11

        //전체s2tobe
        let symbol2Pool = new BigNumber(amountData['invariant']).div(symbol1Pool); //300 / 11      //x*y=k -> y=k/x

        //전체s2 - 전체s2tobe
        let userReceives = new BigNumber(amountData[symbol2]).minus(symbol2Pool); //30 * 1 - 11 = 19 //total - y ?

        /*
        console.log({
            providerGains: providerGains.toNumber(),
            platformGains: platformGains.toNumber(),
            totalFee: totalFee.toNumber(),
            amountToContract: amountToContract.toNumber(),
            symbol1Pool: symbol1Pool.toNumber(),
            symbol2Pool: symbol2Pool.toNumber(),
            userReceives: userReceives.toNumber()
        })
        */

        // return userReceives.toFixed(8);  //contract에서 toFixed 사용 중. decimalPlaces(8)
        return userReceives.decimalPlaces(8,1);  //contract에서 toFixed 사용 중. decimalPlaces(8)

    }

    const calculatePrice = () => {

        if (!tokenFrom.balance || tokenFrom.balance === '0' || !tokenFrom.tokenName || !tokenTo.balance || tokenTo.balance === '0' || !tokenTo.tokenName) {
            setPrice(null)
            return
        }

        let amount;

        // 2.7 HUSD per DON
        if (priceSwitch) {
            amount = new BigNumber(tokenTo.balance).div(tokenFrom.balance).decimalPlaces(8)
            setPrice(`${amount} ${ComUtil.getDisplayTokenName(tokenTo.tokenName)} per ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)}`)
        }else{ //DON per HUSD
            amount = new BigNumber(tokenFrom.balance).div(tokenTo.balance).decimalPlaces(8)
            setPrice(`${amount.toString()} ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)} per ${ComUtil.getDisplayTokenName(tokenTo.tokenName)}`)
        }

        return;
        //
        // const xTokenName = tokenFrom.tokenName
        // const xTokenBalance = tokenFrom.balance
        //
        // const yTokenName = tokenTo.tokenName
        // const yTokenBalance = tokenTo.balance
        //
        // if (!swapPairs || !xTokenName || !xTokenBalance || !yTokenName || !yTokenBalance) return
        //
        // const swapPair = ComUtil.findSwapPair(swapPairs, xTokenName, yTokenName)
        //
        // console.log({swapPair})
        //
        // let value;
        //
        // //100 * 1000 = 100000
        //
        //
        // const xPool = swapPair[xTokenName] //100
        // const yPool = swapPair[yTokenName] //1000
        // const kPool = swapPair.invariant   //풀의 총 량
        //
        // const swapBalance = ((kPool / (xPool - xTokenBalance)) * 1.002) - yPool
        //
        // const swapBalance2 = ((kPool / (yPool - yTokenBalance)) * 1.002) - xPool
        // console.log({swapBalance, swapBalance2})
        // //pool 에서 swap 원하는 남은 양 계산
        // // const remainedAmount = (xAmount - tokenFrom.balance) * 1.003//99  //수수료
        //
        // // const aaa = (kAmount / remainedAmount) //k / x
        //
        // if (priceSwitch) {
        //     const num = new BigNumber(usdPrice[tokenFrom.tokenName]).div(usdPrice[tokenTo.tokenName]).decimalPlaces(8)
        //     value = `${new BigNumber(swapBalance).decimalPlaces(8)} ${ComUtil.getDisplayTokenName(tokenTo.tokenName)} per ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)}`
        // }else {
        //     const num = new BigNumber(usdPrice[tokenTo.tokenName]).div(usdPrice[tokenFrom.tokenName]).decimalPlaces(8)
        //     value = `${swapBalance} ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)} per ${ComUtil.getDisplayTokenName(tokenTo.tokenName)}`
        // }
        //
        // setPrice(value)

    }

    //which : 'from' or 'to'
    const onTokenClick = (which) => {
        setWhichToken(which)
        tokenSelectionToggle()
    }

    //Modal token callback
    const onTokenSelected = (item) => {

        if (item.tokenBalance !== undefined) {
            tokenSelectionToggle()
        }

        const newTokenName = item.tokenName

        if (whichToken === 'from') {
            if (newTokenName === tokenTo.tokenName) {
                onSwapTokenClick()
                return
            }

            //코인 변경
            setTokenFrom({
                ...tokenFrom,
                ...item,
            })

            let amount = '';
            if (tokenTo.tokenName) {
                amount = getRouteSwapAmount(newTokenName, tokenTo.tokenName, tokenFrom.balance)
            }

            //To balance 업데이트
            setTokenTo({
                ...tokenTo,
                balance: amount ? amount : ''
            })

        }else {
            if (newTokenName === tokenFrom.tokenName) {
                onSwapTokenClick()
                return
            }

            let amount = '';
            if (tokenFrom.tokenName) {
                amount = getRouteSwapAmount(tokenFrom.tokenName, newTokenName, tokenFrom.balance)
            }

            //코인 변경, balance 업데이트
            setTokenTo({
                ...tokenTo,
                ...item,
                balance: amount ? amount : ''
            })
        }
    }

    //Max click
    const onMaxClick = () => {
        if (tokenFrom.tokenName) {
            setTokenFrom({
                ...tokenFrom,
                balance: tokenFrom.tokenBalance
            })

            //To 값 구하기
            const toAmount = getRouteSwapAmount(tokenFrom.tokenName, tokenTo.tokenName, tokenFrom.tokenBalance)
            console.log({tokenFrom,toAmount})
            setTokenTo({
                ...tokenTo,
                balance: toAmount
            })
        }
    }

    //Swap click
    //TODO : TokenName, TotlalBalance 만 바꾸기로 교체함 ver 1.0
    const onSwapTokenClick = () => {

        //To 값 구하기
        const toAmount = getRouteSwapAmount(tokenTo.tokenName, tokenFrom.tokenName, tokenFrom.balance)


        //tokenName, totlalBalance 만 업데이트
        setTokenFrom({
            ...tokenFrom,
            img: tokenTo.img,
            tokenName: tokenTo.tokenName,
            tokenBalance: tokenTo.tokenBalance
        })

        //tokenName, totlalBalance, balance 업데이트
        setTokenTo({
            ...tokenTo,
            img: tokenFrom.img,
            tokenName: tokenFrom.tokenName,
            tokenBalance: tokenFrom.tokenBalance,
            balance: toAmount ? toAmount : ''
        })

        // const newEstimate = estimated === 'from' ? 'to' : 'from'
        // setEstimated(newEstimate)
        //
        // const newTokenFrom = Object.assign({}, tokenTo)
        // const newTokenTo = Object.assign({}, tokenFrom)
        //
        // if (newEstimate === 'from') {
        //     // newTokenFrom.balance = getCalculatedSwapAmount('to', newTokenTo.balance)
        //     // newTokenFrom.balance = getCalculatedFromSwapAmount('to', newTokenTo.balance)
        //
        // }else {
        //     // newTokenTo.balance = getCalculatedSwapAmount('from', newTokenFrom.balance)
        // }
        //
        // setTokenFrom(newTokenFrom)
        // setTokenTo(newTokenTo)
    }


    //Calculate all values
    const calculate = () => {

        try {
            if (tokenFrom.balance && tokenFrom.tokenName && tokenTo.balance && tokenTo.tokenName) {
                const minimumReceived = ComUtil.roundDown(new BigNumber(tokenTo.balance).minus(tokenTo.balance * (rate / 100)).toNumber(),8)
                // const priceImpact = 0;
                //TODO
                const transactionFee = new BigNumber(tokenFrom.balance).multipliedBy(TOTAL_FEE).decimalPlaces(8);// from balance 의 수수료 (0.2%)
                console.log({transactionFee: transactionFee.toNumber()})
                const usdPriceFrom = new BigNumber(usdPrice[tokenFrom.tokenName]).toNumber()
                const usdPriceTo = new BigNumber(usdPrice[tokenTo.tokenName]).toNumber()

                /*
                * After swap
                    usdc 를 100000 개가지고 eth ???
*
                    USDC = 2,010,000 (because we added 10,000 to the pool)
                    Constant Product = 2,000,000,000 (stays the same)
                    ETH = 995.024 (constant product / new usdc amount)
                    ETH recieved = 4.976 (old eth amount - new eth amount)
                    Price paid per ETH = 2009.64 USDC
                    Price impact = 0.48%
                *
                * */

                const swapPair = ComUtil.findSwapPair(swapPairs, tokenFrom.tokenName, tokenTo.tokenName)
                //
                // //xTokenFrom.balance
                // const balance = parseFloat(tokenFrom.balance) //1
                // //yTokenPool
                // const oldEthAmount = parseFloat(swapPair[tokenTo.tokenName])//27.27520683
                // //xTokenPool + tokenFrom.balance
                // const USDC = parseFloat(swapPair[tokenFrom.tokenName]) + balance //11.9998 (because we added 10,000 to the pool)
                // //invariant
                // const ConstantProduct = parseFloat(swapPair.invariant)// 300.02182016 //(stays the same)
                //
                // const newETHAmount = ConstantProduct / USDC // 25.002235050584176 = 300.02182016 / 11.9998   ||||995.024 (constant product / new usdc amount)
                // const ETHrecieved =  oldEthAmount - newETHAmount //2.272971779415824 = 27.27520683 - 25.002235050584176 ||||  4.976 (old eth amount - new eth amount)
                // const PricepaidperETH = balance / ETHrecieved //0.439952668597148 = 1 /  2.272971779415824  ||| 2009.64 USDC
                // const PriceImpact = newETHAmount / PricepaidperETH  //25.002235050584176 / 0.439952668597148 ||||   0.48%
                // console.log({balance, oldEthAmount, USDC, ConstantProduct, newETHAmount, ETHrecieved, PricepaidperETH, PriceImpact})

                // //xTokenFrom.balance
                // const balance = 200000
                // //tokenTo.balance
                // const oldEthAmount = 1000
                // //xTokenPool + tokenFrom.balance
                // const USDC = 2000000 + balance //(because we added 10,000 to the pool)
                // //invariant
                // const ConstantProduct = 2000000000 //(stays the same)
                // const newETHAmount = ConstantProduct / USDC //995.024 (constant product / new usdc amount)
                // const ETHrecieved =  oldEthAmount - newETHAmount //4.976 (old eth amount - new eth amount)
                // const PricepaidperETH = balance / ETHrecieved // 2009.64 USDC
                // const PriceImpact = newETHAmount / PricepaidperETH//0.48%
                // console.log({newETHAmount, ETHrecieved, PricepaidperETH, PriceImpact})

                const priceImpact = calculatePriceImpact( tokenFrom.tokenName, tokenTo.tokenName, tokenTo.balance, usdPriceTo/usdPriceFrom, tokenFrom.balance/tokenTo.balance )

                const priceImpactStep = getPriceStepImpact(priceImpact)

                /*
                const swapPair = ComUtil.findSwapPair(swapPairs, tokenFrom.tokenName, tokenTo.tokenName)

                const oldEthAmount = new BigNumber(swapPair[tokenTo.tokenName]).toNumber()

                const balance = new BigNumber(tokenFrom.balance).toNumber()

                const xPool = new BigNumber(swapPair[tokenFrom.tokenName]).toNumber()
                console.log({xPool})
                const usdc = new BigNumber(tokenFrom.balance).plus(xPool).toNumber()
                console.log({usdc})
                const constantProduct = new BigNumber(swapPair.invariant).toNumber() //전체 pool ex) don pool * husd pool
                console.log({constantProduct})
                const eth = new BigNumber(constantProduct).div(usdc).toNumber()
                console.log({eth, oldEthAmount})
                const recieved = new BigNumber(oldEthAmount).minus(eth).toNumber()
                console.log({recieved})
                const pricePaidPerEth = new BigNumber(balance).div(recieved).toNumber()
                console.log({pricePaidPerEth})
                const priceImpactTest = new BigNumber(eth).div(pricePaidPerEth).toNumber()
                console.log({priceImpactTest})
                */

                setResult({
                    minimumReceived: minimumReceived.toFixed(8), //1e-8때문에.
                    priceImpact,
                    priceImpactStep,
                    transactionFee,
                    usdPriceFrom: usdPriceFrom,
                    usdPriceTo: usdPriceTo,
                    visible: true
                })
            }else{
                setResult({
                    ...result,
                    visible: false
                })
            }
        }catch (err){
            console.error(err)

            setResult({
                ...result,
                visible: false
            })
        }

    }

    // if (priceSwitch) {
    //     getTransferedValue({
    //         tokenName: tokenFrom.tokenName,
    //         tokenBalance: tokenFrom.tokenBalance,
    //         targetTokenName: tokenTo.tokenName
    //     })
    // }else {
    //     getTransferedValue({
    //         tokenName: tokenTo.tokenName,
    //         tokenBalance: tokenTo.tokenBalance,
    //         targetTokenName: tokenFrom.tokenName
    //     })
    // }

    // getTransferedValue({
    //     tokenName: 'husd',
    //     tokenBalance: 1,
    //     targetTokenName: 'don'
    // })

    //Swap
    const onSwapClick = async () => {

        try {

            if (!address) {
                setConnectWalletModalOpen(true)
                return
            }

            //receive금액이 너무 작을때 에러
            if (MIN_TOKEN.gt(tokenTo.balance)) {
                alert(t('minReceiveAmountErr'));
                return;
            }

            //symbol1, symbol2, amount, amountOutMin
            const symbol1 = tokenFrom.tokenName
            const symbol2 = tokenTo.tokenName
            const amount = tokenFrom.balance
            const amountOutMin = result.minimumReceived

            if (!parseFloat(tokenFrom.tokenBalance) || parseFloat(tokenFrom.balance) > parseFloat(tokenFrom.tokenBalance)) {
                return
            }

            setLoadingState('confirmation')

            console.log({symbol1, symbol2, amount, amountOutMin})

            let isSuccess;
            let routeResult;
            if(needRoute(symbol1, symbol2)) {
                const result = await iostApi.routeSwapTokens(symbol1, symbol2, amount, routeHusdAmountStr, amountOutMin);
                isSuccess = result.isSuccess;
                routeResult = result.result;
            } else {
                const result1 = await iostApi.exchangeSwapTokens(symbol1, symbol2, amount, amountOutMin);
                isSuccess = result1.isSuccess;
                routeResult = result1.result;
            }

            if (isSuccess) {
                setLoadingState('success')

                // 바로 잔액 업데이트 처리
                const amount = getRouteSwapAmount(tokenFrom.tokenName, tokenTo.tokenName, tokenFrom.balance)
                setTokenTo({
                    ...tokenTo,
                    balance: amount
                });

            }else{
                setLoadingState('failed')
                let errorMessage = "";
                if (typeof routeResult === 'string') {
                    if (routeResult.indexOf('{') > -1) {
                        const error = JSON.parse(routeResult.substring(routeResult.indexOf('{'), routeResult.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = tMessage.failedToSendSwap;
                            if(error.message){
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = routeResult
                        }
                    }
                } else if (typeof routeResult === 'object') {
                    if (routeResult.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else if (routeResult.status_code === 'RUNTIME_ERROR') {
                        errorMessage = `${tMessage.failedToSendSwap}`;
                    } else{
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                alert(errorMessage);
                return
            }
            console.log({isSuccess})
        }catch (err) {
            setLoadingState('failed')
        }
    }

    //Swap 버튼의 상태값 리턴
    const getSwapButtonErrorText = () => {

        const buttonState = {
            text: '',
            disabled: false
        }

        if (!address){
            buttonState.text = t('connectWallet')
            buttonState.disabled = true
            return buttonState
        }else if (!tokenFrom.tokenName || !tokenTo.tokenName){
            buttonState.text = t('selectToken')
            buttonState.disabled = true
            return buttonState
        }else if(!tokenFrom.balance || parseFloat(tokenFrom.balance) <= 0) {
            buttonState.text = t('enterAmount')
            buttonState.disabled = true
            return buttonState
        }else if (parseFloat(tokenFrom.balance) < 0.001) {
            buttonState.text = t('minimumAmount', {x: '0.001'})
            buttonState.disabled = true
            return buttonState
        }else if (parseFloat(tokenFrom.balance) > parseFloat(tokenFrom.tokenBalance)) {
            buttonState.text = t('insufficientTokenBalance', {x: tokenFrom.tokenName.toUpperCase()})//`Insufficient ${tokenFrom.tokenName.toUpperCase()} balance`
            buttonState.disabled = true
            return buttonState
        }

        buttonState.text = t('swap');
        return buttonState
    }


    //for priceImpact: get Symbol2 amountData
    const getTargetTokenPoolAmountData = (symbol1, symbol2) => {

        const amountData = ComUtil.findSwapPair(swapPairs, symbol1, symbol2)
        return amountData[symbol2] * 1;  //number
    }


    //priceImpact = (actualVP - targetVP)/totalAcutalVP (VP=Volume*price)
    //actualPrice = husd market price / don market price =result.usdPriceTo/result.usdPriceFrom
    //targetPrice = don per husd (from switchPrice)
    const calculatePriceImpact = (symbol1, symbol2, targetBalance, actualPrice, targetPrice) => {


        let targetTokenAmountData = 0;

        if (needRoute(symbol1, symbol2)) { //route 필요 경우.
            targetTokenAmountData = getTargetTokenPoolAmountData("husd", symbol2);

        }else { //일반적인 경우
            targetTokenAmountData = getTargetTokenPoolAmountData(symbol1, symbol2); //get amountData[symbol2]
        }

        let actualVP = (targetBalance * 1) * actualPrice;
        let totalActualVP = (targetTokenAmountData * 1) * actualPrice;

        let priceImpact = 100 * (actualVP - (targetBalance * 1) * targetPrice) / totalActualVP;

        return ComUtil.roundDown(priceImpact, 3)

    }

    // const swapDisabled = (!parseFloat(tokenFrom.tokenBalance) || parseFloat(tokenFrom.balance) > parseFloat(tokenFrom.tokenBalance))

    //코인별 전체 밸런스 업데이트(5초마다 체크)
    useInterval(() => {
        if (tokenFrom.tokenName) {
            iostApi.getTokenBalance({address, tokenName: tokenFrom.tokenName}).then((tokenBalance) => {
                setTokenFrom({
                    ...tokenFrom,
                    tokenBalance: tokenBalance
                })
            })
        }
        if (tokenTo.tokenName) {
            iostApi.getTokenBalance({address, tokenName: tokenTo.tokenName}).then(async (tokenBalance) => {
               const amount = getRouteSwapAmount(tokenFrom.tokenName, tokenTo.tokenName, tokenFrom.balance)
                setTokenTo({
                    ...tokenTo,
                    tokenBalance: tokenBalance,
                    balance: amount
                })
            })
        }

    }, [5000])

    // const getPriceImpactStep

    const buttonState = getSwapButtonErrorText()

    /*
    *    {
                                                (result.priceImpact < -1) && <FaRegFrown />
                                            }
                                            {
                                                (result.priceImpact >= -1 && result.priceImpact <= 1) && <FaRegSmile />
                                            }
                                            {
                                                (result.priceImpact > 1) && <FaRegLaugh />
                                            }
    *
    * */

    const getPriceStepImpact = (priceImpact) => {
        if (priceImpact < -1)
            return -1
        else if (priceImpact >= -1 && priceImpact <= 1) {
            return 0
        }
        else if (priceImpact > 1) {
            return 1
        }
    }

    return (
        <Div width={sizeValue(436, null, '90%')} minHeight={721}>
            <Div bg={'white'} minHeight={400} rounded={10} shadow={'lg'}>
                {/* Card */}
                <Div>

                    <Div relative>
                        {/* Title */}
                        <Heading
                            title={'Exchange'}
                            desc={t('swapDesc')}
                        />
                        {/* Setting */}
                        <Tooltip title={t('slippageTolerance')} placement="top">
                            <StyledSetting absolute top={'50%'} right={24} yCenter cursor={1}>
                                <IoMdSettings size={25} onClick={settingsToggle}/>
                            </StyledSetting>
                        </Tooltip>
                    </Div>

                    <Hr/>

                    {/* Content */}
                    <Div p={24}>

                        {/* From */}
                        <TokenBox
                            title={'From'}
                            totalBalance={tokenFrom.tokenBalance}
                            img={tokenFrom.img}
                            tokenName={tokenFrom.tokenName}
                            balance={tokenFrom.balance}
                            onInputChange={onBalanceChange.bind(this, 'from')}
                            onTokenClick={onTokenClick.bind(this,  'from')}
                            showMax={true}
                            onMaxClick={onMaxClick}
                            estimated={estimated === 'from'}
                        />
                        {/*<Div rounded={5} bg={'light'} p={13} >*/}
                        {/*    <Flex fontSize={14} fw={500}>*/}
                        {/*        <Div>From</Div>*/}
                        {/*        <Right>Balance: 0</Right>*/}
                        {/*    </Flex>*/}
                        {/*    <Flex fontSize={16} mt={10}>*/}
                        {/*        <Div flexGrow={1}>*/}
                        {/*            <Input block placeholder={0.0} bc={'light'} bg={'light'} fg={'info'} height={'100%'} p={0} height={34} style={{fontSize:16}}/>*/}
                        {/*        </Div>*/}
                        {/*        <Right>*/}
                        {/*            <Flex>*/}
                        {/*                <Button bold fg={'info'} bg={'light'} mr={8} height={34} px={8} rounded={5}>*/}
                        {/*                    <Flex>*/}
                        {/*                        MAX*/}
                        {/*                    </Flex>*/}
                        {/*                </Button>*/}
                        {/*                <Button bg={'light'} p={0} onClick={onTokenClick.bind(this, 'from')} rounded={5}>*/}
                        {/*                    <Flex alignItems={'center'} justifyContent={'space-between'} height={34} px={8}>*/}
                        {/*                        <Img src={properties.tokenImages.bnb} width={24} height={24} />*/}
                        {/*                        <Span lineHeight={1.2} mx={8}>BNB</Span>*/}
                        {/*                        <FaChevronDown />*/}
                        {/*                    </Flex>*/}
                        {/*                </Button>*/}

                        {/*            </Flex>*/}
                        {/*        </Right>*/}
                        {/*    </Flex>*/}
                        {/*</Div>*/}


                        <Flex justifyContent={'center'} py={13}>
                            <Button bg={'light'} fg={'info'} width={35} height={35} rounded={'50%'} onClick={onSwapTokenClick}>
                                <RiArrowUpDownLine size={20}/>
                            </Button>
                        </Flex>


                        {/* To */}
                        <TokenBox
                            title={'To'}
                            totalBalance={tokenTo.tokenBalance}
                            img={tokenTo.img}
                            tokenName={tokenTo.tokenName}
                            balance={tokenTo.balance}
                            onInputChange={onBalanceChange.bind(this, 'to')}
                            onTokenClick={onTokenClick.bind(this,  'to')}
                            showMax={false}
                            readOnly={true}
                            estimated={estimated === 'to'}
                        />

                        {/* Price ~ Slippage tolerance */}
                        <Div my={20} lineHeight={23}>
                            <Flex justifyContent={'space-between'}>
                                <Div>{t('swapPrice')}</Div>
                                <Flex>
                                    <Div>{price}</Div>

                                    <Button ml={5} bg={'white'} fg={'info'} p={0} px={3} height={30} onClick={() => setPriceSwitch(!priceSwitch)}>
                                        <Flex justifyContent={'center'}>
                                            <AiOutlineSwap size={20}/>
                                        </Flex>
                                    </Button>


                                </Flex>
                            </Flex>
                            <Flex justifyContent={'space-between'}>
                                <Div>{t('slippageTolerance')}</Div>
                                <Div>{rate}%</Div>
                            </Flex>
                        </Div>

                        {/* Swap Button */}
                        <Button bg={'primary'} fg={'white'} block rounded={5} bold fontSize={15} height={48} onClick={onSwapClick} disabled={buttonState.disabled}>
                            {
                                buttonState.text
                            }
                            {/*{*/}
                            {/*    address ?*/}
                            {/*        swapDisabled ?*/}
                            {/*            `Insufficient ${tokenFrom.tokenName.toUpperCase()} balance` :*/}
                            {/*            'Swap' :*/}
                            {/*        `${t('connectWallet')}`*/}
                            {/*}*/}
                        </Button>

                    </Div>

                </Div>

            </Div>



            {/* Card Bottom */}
            {
                result.visible && (
                    <Div bg={'white'} rounded={10} shadow={'lg'} mt={20}>
                        <Div p={24} lineHeight={23}>
                            <Flex>
                                <Div mt={3} fg={'info'}>{t('minimumReceived')}</Div>
                                <Flex ml={7} fg={'blue'}>
                                    <Tooltip title={t('minimumReceivedInfo')} placement="top">
                                        <BsQuestionCircle />
                                    </Tooltip>
                                </Flex>
                                <Right> <Span fg={'info'}>{`${result.minimumReceived}`}</Span>{` ${ComUtil.getDisplayTokenName(tokenTo.tokenName)}`}</Right>
                            </Flex>
                            <Flex mt={3}>
                                <Div mt={3}>{t('priceImpact')}</Div>
                                <Flex ml={7} fg={'blue'}>
                                    <Tooltip title={t('priceImpactInfo')} placement="top">
                                        <BsQuestionCircle />
                                    </Tooltip>
                                </Flex>
                                <Right>
                                    <Flex>
                                        <Flex fontSize={18} mt={-5}>
                                            {
                                                (result.priceImpactStep === -1) && <FaRegFrown color={color.danger}/>
                                            }
                                            {
                                                (result.priceImpactStep === 0) && <FaRegSmile color={color.black}/>
                                            }
                                            {
                                                (result.priceImpactStep === 1) && <FaRegLaughBeam color={color.info}/>
                                            }
                                        </Flex>
                                        <Div ml={8}>{result.priceImpact}%</Div>
                                    </Flex>
                                </Right>
                            </Flex>
                            <Flex mt={3}>
                                <Div mt={3}>{t('transactionFee')}</Div>
                                <Flex ml={7} fg={'blue'}>
                                    {/*<Tooltip title={t(`${TOTAL_FEE*100}%`)} placement="top">*/}
                                    <Tooltip title={t('transactionFeeInfo', {x:TOTAL_FEE*100, y:PROVIDER_FEE*100, z:PLATFORM_FEE*100})} placement="top">
                                        <BsQuestionCircle/>
                                    </Tooltip>
                                </Flex>
                                <Right>{`${result.transactionFee} ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)}`}</Right>
                            </Flex>
                            <Hr my={10} bc={'light'}></Hr>
                            <Flex mt={15}>
                                <img src={tokenFrom.img} height={20}/>
                                <Div ml={5} mt={4}>{`${ComUtil.getDisplayTokenName(tokenFrom.tokenName)} price`}</Div>
                                <Right>{`$${result.usdPriceFrom.toFixed(3)}`}</Right>
                            </Flex>
                            <Flex mt={4}>
                                <img src={tokenTo.img} height={20}/>
                                <Div ml={5} mt={4}>{`${ComUtil.getDisplayTokenName(tokenTo.tokenName)} price`}</Div>
                                <Right>{`$${result.usdPriceTo.toFixed(3)}`}</Right>
                            </Flex>
                        </Div>
                    </Div>
                )
            }


            <Modal
                title={'Settings'}
                visible={settingsModalOpen}
                onCancel={settingsToggle}
                footer={null}
                width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
                centered={true}
                // focusTriggerAfterClose={true}
                // getContainer={false}
                // maskClosable={false}
                // destroyOnClose={true}
                // bodyStyle={{padding: 0}}
            >
                <SlippageTolerance
                    defaultRate={rate}
                    onChange={onRateChange}
                />
            </Modal>

            <Modal
                title={'Select a token'}
                visible={tokenSelectionModalOpen}
                onCancel={tokenSelectionToggle}
                footer={null}
                // width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
                centered={true}
                // focusTriggerAfterClose={false}
                // getContainer={false}
                // maskClosable={false}
                // destroyOnClose={true}
                bodyStyle={{padding: 0}}
            >
                <Div>
                    <TokenSelection
                        tokenList={properties.exchange.tokenList}
                        selectedTokenName={whichToken === 'from' ? tokenFrom.tokenName : tokenTo.tokenName}
                        // disabledTokenName={whichToken === 'from' ? tokenFrom.tokenName : tokenTo.tokenName}
                        onItemClick={onTokenSelected}
                    />
                </Div>
            </Modal>



        </Div>
    );
};

export default Swap;
