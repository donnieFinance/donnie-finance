import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, Hr, Img, Right, Span, SymbolIcon} from "~/styledComponents/shared";
import useSize from "~/hooks/useSize";
import {useTranslation} from "react-i18next";
import {Heading, SymbolGroup, TokenBox} from "~/components/exchange/Components";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import useModal from "~/hooks/useModal";
import {Modal, Skeleton, Tooltip} from "antd";
import SlippageTolerance from "~/components/common/contents/SlippageTolerance";
import {useRecoilState} from "recoil";
import {connectWalletModalState, loadingState, swapPairsState, usdPriceState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
import {Route, useHistory} from "react-router-dom";
import {AiOutlinePlus} from "react-icons/ai";
import {RiCloseFill}  from "react-icons/ri";
import BigNumber from "bignumber.js";
import useWallet from "~/hooks/useWallet";
import useInterval from "~/hooks/useInterval";
import iostApi, {getTokenCurrentSupply} from "~/lib/iostApi";
import properties from "~/properties";
import {withRouter, useParams} from 'react-router-dom'
import loadable from "@loadable/component";
import {BsQuestionCircle} from "react-icons/bs";
import {FaChevronDown} from "react-icons/fa";

// import TokenSelection from "~/components/common/contents/TokenSelection";
const PairSelection = loadable(() => import('~/components/common/contents/PairSelection'))
const TokenSelection = loadable(() => import('~/components/common/contents/TokenSelection'))

const StyledSetting = styled(Div)`
    color: ${color.info}; 
    &:hover {
        color: ${color.lightInfo};
    }
`;
const LiquidityItem = ({data}) => {
    const {t} = useTranslation()
    return(
        <Div
            bg={'white'}
            py={17}
            px={26}
            shadow={'lg'}
            bc={'light'}
            rounded={20}
        >
            <Div flexGrow={1}>


                <Flex justifyContent={'space-between'}>
                    <Flex justifyContent={'center'}>
                        <SymbolGroup
                            symbol1={data.symbol1}
                            symbol2={data.symbol2}
                            size={30}
                        />
                        <Div mx={5} mt={3} fontSize={16}>
                            {data.dpLpTokenName} ({data.symbol1}-{data.symbol2})
                        </Div>
                        <Div fg={'blue'} mt={6}>
                            <Tooltip title={t('lpTokenDesc')} placement="top">
                                <BsQuestionCircle />
                            </Tooltip>
                        </Div>
                    </Flex>
                </Flex>
                <Div mt={10}>
                    <Flex justifyContent={'space-between'}>
                        <Flex>
                            <Div mr={5}>{t('myLpToken')}</Div>
                            <Div mt={3}  fg={'blue'}>
                                <Tooltip title={t('myShareDesc')} placement="top">
                                    <BsQuestionCircle />
                                </Tooltip>
                            </Div>
                        </Flex>
                        <Div fg={'info'}>{data.lpTokenBalance}</Div>
                    </Flex>
                    <Flex justifyContent={'space-between'}>
                        <Div>{data.symbol1.toUpperCase()}</Div>
                        <Div>
                            {(data.symbol1Balance && data.symbol1Balance > 0) ? new BigNumber(data.symbol1Balance).toNumber().toFixed(4) : 0}
                        </Div>
                    </Flex>
                    <Flex justifyContent={'space-between'}>
                        <Div>{data.symbol2.toUpperCase()}</Div>
                        <Div>
                            {(data.symbol2Balance && data.symbol2Balance > 0) ? new BigNumber(data.symbol2Balance).toNumber().toFixed(4) : 0}
                        </Div>
                    </Flex>
                    <Flex justifyContent={'space-between'}>
                    </Flex>
                    <Flex justifyContent={'space-between'}>
                        <Div>{t('poolShare')}</Div>
                        <Div>{data.lpTokenBalanceRate.toFixed(2)}%</Div>
                    </Flex>
                </Div>
            </Div>
        </Div>
    )
}


const AddLiquidity = ({history}) => {

    const {sizeValue} = useSize()
    const {t} = useTranslation()

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const tExchange = t('exchange', {returnObjects: true})

    // const history = useHistory()

    let {symbol1, symbol2} = useParams();
    console.log({history: history, symbol1, symbol2})

    const [, setConnectWalletModalOpen] = useRecoilState(connectWalletModalState)
    const [, setLoadingState] = useRecoilState(loadingState)

    const {address} = useWallet()

    //1분마다 갱신되는 usdPrice
    const [usdPrice] = useRecoilState(usdPriceState)

    // [{don: "10.00000000", husd: "30.00000000", invariant: "300.00000000}, ...]
    const [swapPairs] = useRecoilState(swapPairsState)

    const [pairSelectionModalOpen, , , , , pairSelectionToggle] = useModal();
    const [tokenSelectionModalOpen, , , , , tokenSelectionToggle] = useModal();

    const [settingsModalOpen, , , , , settingsToggle] = useModal();
    const [rate, setRate] = useState(0.5)

    //PRICES AND POOL SHARE
    const [price1, setPrice1] = useState('')
    const [price2, setPrice2] = useState('')
    const [sharPoolRate, setSharPoolRate] = useState(0.1)

    const [pair, setPair] = useState()
    const [tokenList, setTokenList] = useState([])

    //어디가 계산되어야 할 지 여부
    const [estimated, setEstimated] = useState('to')

    //'from' or 'to'
    const [whichToken, setWhichToken] = useState('from')

    //from token
    const [tokenFrom, setTokenFrom] = useState({
        tokenBalance: 0,    //total balance
        tokenName: '',
        img: '',
        balance: '',
        // estimated: false
    })

    //to token
    const [tokenTo, setTokenTo] = useState({
        tokenBalance: 0,    //total balance
        tokenName: '',
        img: '',
        balance: '',
        // estimated: false
    })

    const [myLpToken, setMyLpToken] = useState()
    const [isMyLpTokenLoading, setIsMyLpTokenLoading] = useState(true)

    useEffect(() => {
        if (symbol1 && symbol2) {
            iostApi.getLpTokenList().then(res => {

                let pair = res.find(pair => pair.symbol1 === symbol1 && pair.symbol2 === symbol2)

                if (pair) {
                    console.log("==================",{res, pair,symbol1,symbol2})
                    setPair(pair)
                }
            })
        }
    }, [])

    useEffect(() => {
        if (pair) {
            let tokenList = properties.exchange.tokenList.filter(token => token.tokenName === pair.symbol1 || token.tokenName === pair.symbol2)
            setTokenList(tokenList)

            setTokenFrom({
                ...tokenFrom,
                tokenName: pair.symbol1,
                img: properties.tokenImages[symbol1]
            })

            setTokenTo({
                ...tokenTo,
                tokenName: pair.symbol2,
                img: properties.tokenImages[symbol2]
            })
        }

    }, [pair])

    useEffect(() => {

        async function fetchBalance() {
            const res = await Promise.all([
                getTokenBalance(address, symbol1),
                getTokenBalance(address, symbol2),
            ])

            console.log({res})

            setTokenFrom({
                ...tokenFrom,
                tokenBalance: res[0]
            })

            setTokenTo({
                ...tokenTo,
                tokenBalance: res[1]
            })

        }

        if (address && symbol1 && symbol2) {
            fetchBalance()
        }

    }, [address])

    //Calculate all footer values
    useEffect(() => {

        //footer 계산
        calculatePrice()

        if(tokenFrom.tokenName && tokenTo.tokenName){
            getMyLpToken(tokenFrom.tokenName, tokenTo.tokenName);
        }

    }, [tokenFrom, tokenTo, usdPrice, whichToken])

    const getMyLpToken = async (symbol1,symbol2) => {


        if (!address) return

        // console.log("swapPair=====symbol1===",symbol1)
        // console.log("swapPair=====symbol2===",symbol2)
        if(symbol1 && symbol2) {
            const swapPair = ComUtil.findSwapPair(swapPairs, symbol1, symbol2)
            //console.log("swapPair====", swapPair);
            if(swapPair) {
                const {pairKey} = swapPair;
                //console.log("pairKey====", pairKey);
                const data = await iostApi.getMyLpToken(address, pairKey);
                console.log({pairKey})
                const currentSupply = await getTokenCurrentSupply(data.lpTokenName);

                console.log("getMyLpToken", data);
                setMyLpToken({
                    ...data,
                    currentSupply: currentSupply,
                    lpTokenBalanceRate: new BigNumber(data.lpTokenBalance).div(currentSupply).multipliedBy(100).toNumber()
                });
            }
        }
        setIsMyLpTokenLoading(false);
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

            const amount = getCalculatedLiquidityAmount(tokenFrom.tokenName, tokenTo.tokenName, balance)
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

            const amount = getCalculatedLiquidityAmount(tokenFrom.tokenName, tokenTo.tokenName, balance)
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
            });
            updateEstimatedBalance('to', value);

        }else {
            setTokenTo({
                ...tokenTo,
                balance: value
            });
            updateEstimatedBalance('from', value);
        }
    }

    //which : 'from' or 'to'
    const onTokenClick = (which) => {
        setWhichToken(which);
        tokenSelectionToggle();
    }

    //Max click
    const onMaxClick = () => {
        if (tokenFrom.tokenName) {
            setTokenFrom({
                ...tokenFrom,
                balance: tokenFrom.tokenBalance
            });

            //To 값 구하기
            const toAmount = getCalculatedLiquidityAmount(tokenFrom.tokenName, tokenTo.tokenName, tokenFrom.tokenBalance);
            console.log({tokenFrom,toAmount})
            setTokenTo({
                ...tokenTo,
                balance: toAmount
            });
        }
    }


    const calculatePrice = () => {

        try{
            if (
                !tokenFrom.balance || tokenFrom.balance === '0' || !tokenFrom.tokenName ||
                !tokenTo.balance || tokenTo.balance === '0' || !tokenTo.tokenName)
            {
                setPrice1(null)
                setPrice2(null)
                return
            }

            console.log("======",tokenFrom.balance)

            // xPool:yPool = xBalance:yBalance

            // xBalance = (xPool * yBalance) / yPool
            // yBalance = (yPool * xBalance) / xPool

            let amount1, amount2;

            console.log("tokenFrom.balance",tokenFrom.balance)
            console.log("tokenTo.balance",tokenTo.balance)

            amount1 = new BigNumber(tokenTo.balance).div(tokenFrom.balance).decimalPlaces(8)
            amount2 = new BigNumber(tokenFrom.balance).div(tokenTo.balance).decimalPlaces(8)

            console.log("amount1",amount1)
            console.log("amount2",amount2)

            setPrice1(`${amount1} ${ComUtil.getDisplayTokenName(tokenTo.tokenName)} per ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)}`)
            setPrice2(`${amount2} ${ComUtil.getDisplayTokenName(tokenFrom.tokenName)} per ${ComUtil.getDisplayTokenName(tokenTo.tokenName)}`)

            const xTokenName = tokenFrom.tokenName
            const xTokenBalance = tokenFrom.balance

            const yTokenName = tokenTo.tokenName
            const yTokenBalance = tokenTo.balance

            if (!swapPairs || !xTokenName || !xTokenBalance || !yTokenName || !yTokenBalance) return

            const swapPair = ComUtil.findSwapPair(swapPairs, xTokenName, yTokenName)
            //console.log({swapPair})

            const xPool = swapPair[xTokenName] //100
            const yPool = swapPair[yTokenName] //1000
            const kPool = swapPair.invariant   //풀의 총 량

            // 2 / 11 *100
            const xTotalPool = new BigNumber(xTokenBalance).plus(xPool).toFixed(8);
            const tSharePoolRate = new BigNumber(xTokenBalance).div(xTotalPool).multipliedBy(100).toFixed(8);

            // share Pool Rate
            setSharPoolRate(tSharePoolRate);
        }
        catch (err) {
            console.error(err)
        }
    }

    //Liquidity 될 Pool Amount 계산
    const getCalculatedLiquidityAmount = (xTokenName, yTokenName, value) => {

        //to 일때
        // xTokenName = DON
        // yTokenName = HUSD
        // const xTokenName = tokenFrom.tokenName
        // const yTokenName = tokenTo.tokenName

        if (!xTokenName || !yTokenName) {
            return null
        }

        if (!value) {
            return 0
        }

        const balance = new BigNumber(value);

        console.log({swapPairs, xTokenName, yTokenName})

        const swapPair = ComUtil.findSwapPair(swapPairs, xTokenName, yTokenName);
        let amountData = swapPair;



        // xPool:yPool = xBalance:yBalance
        // xBalance = (xPool * yBalance) / yPool
        // yBalance = (yPool * xBalance) / xPool
        // pool 의 비율로 구함
        let symbol1Pool = new BigNumber(amountData[xTokenName]).toFixed(8);  //10 DON
        let symbol2Pool = new BigNumber(amountData[yTokenName]).toFixed(8);  //30 HUSDT

        //console.log("symbol1Pool",symbol1Pool.toFixed())
        //console.log("symbol2Pool",symbol2Pool.toFixed())

        return balance.multipliedBy(symbol2Pool).div(symbol1Pool).toFixed(8);
    }


    //Swap click
    //TODO : TokenName, TotlalBalance 만 바꾸기로 교체함 ver 1.0
    const onLiquidityTokenClick = () => {

        //To 값 구하기
        const toAmount = getCalculatedLiquidityAmount(tokenTo.tokenName, tokenFrom.tokenName, tokenFrom.balance)

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
    }


    // const onPairClick = () => {
    //     pairSelectionToggle()
    // }


    const onPairTokenSelected = async (item) => {
        console.log({item})

        let tokenList = properties.exchange.tokenList.filter(token => token.tokenName === item.symbol1 || token.tokenName === item.symbol2)
        setTokenList(tokenList)

        pairSelectionToggle()

        setPair(item)

        let res;
        if (address){
            res = await Promise.all([
                getTokenBalance(address, item.symbol1),
                getTokenBalance(address, item.symbol2)
            ])

        }

        setTokenFrom({
            ...tokenFrom,
            tokenName: item.symbol1,
            tokenBalance: res ? res[0] : '',
            img: properties.tokenImages[item.symbol1]
        })

        const amount = getCalculatedLiquidityAmount(item.symbol1, item.symbol2, tokenFrom.balance)

        setTokenTo({
            ...tokenTo,
            tokenName: item.symbol2,
            tokenBalance: res ? res[1] : '',
            img: properties.tokenImages[item.symbol2],
            balance: amount
        })



    }

    //Modal token callback
    const onTokenSelected = (item) => {
        if (item.tokenBalance !== undefined) {
            tokenSelectionToggle()
        }

        const newTokenName = item.tokenName

        if (whichToken === 'from') {
            if (newTokenName === tokenTo.tokenName) {
                onLiquidityTokenClick()
                return
            }

            //코인 변경
            setTokenFrom({
                ...tokenFrom,
                ...item,
            })

            let amount = '';
            if (tokenTo.tokenName) {
                amount = getCalculatedLiquidityAmount(newTokenName, tokenTo.tokenName, tokenFrom.balance)
            }

            //To balance 업데이트
            setTokenTo({
                ...tokenTo,
                balance: amount ? amount : ''
            })

        }else {
            if (newTokenName === tokenFrom.tokenName) {
                onLiquidityTokenClick()
                return
            }

            let amount = '';
            if (tokenFrom.tokenName) {
                amount = getCalculatedLiquidityAmount(tokenFrom.tokenName, newTokenName, tokenFrom.balance)
            }

            //코인 변경, balance 업데이트
            setTokenTo({
                ...tokenTo,
                ...item,
                balance: amount ? amount : ''
            })
        }
    }

    //Add Liquidity
    const onAddLiquidityClick = async () => {

        try {

            if (!address) {
                setConnectWalletModalOpen(true)
                return
            }
            const xTokenName = tokenFrom.tokenName;
            const xTokenBalance = tokenFrom.balance;

            const yTokenName = tokenTo.tokenName;
            const yTokenBalance = tokenTo.balance;

            if (!swapPairs || !xTokenName || !xTokenBalance || !yTokenName || !yTokenBalance) return

            const swapPair = ComUtil.findSwapPair(swapPairs, xTokenName, yTokenName)

            //setLoadingState('confirmation')
            const {result, isSuccess} = await iostApi.exchangeAddLiquidity(xTokenName,yTokenName,xTokenBalance,yTokenBalance);
            if (isSuccess) {
                //setLoadingState('success')
                window.$message.success('Success');
            }else{
                window.$message.error('failed');
                let errorMessage = "";
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = tMessage.failedToSendSwap;
                            if(error.message){
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                } else if (typeof result === 'object') {
                    if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else if (result.status_code === 'RUNTIME_ERROR') {
                        errorMessage = `${tMessage.failedToSendSwap}`;
                    } else{
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                if(errorMessage) {
                    alert(errorMessage);
                }
            }
        }catch (err) {
            //setLoadingState('failed')
            window.$message.error('failed');
        }
    }


    // Add Liquidity 버튼의 상태값 리턴
    const getLiquidityButtonErrorText = () => {

        const buttonState = {
            text: '',
            disabled: false
        }

        if (!address){
            buttonState.text = t('connectWallet')
            buttonState.disabled = true
            return buttonState
        } else if (!tokenFrom.tokenName || !tokenTo.tokenName){
            buttonState.text = t('selectToken')
            buttonState.disabled = true
            return buttonState
        } else if(!tokenFrom.balance || parseFloat(tokenFrom.balance) <= 0) {
            buttonState.text = t('enterAmount')
            buttonState.disabled = true
            return buttonState
        } else if (tokenTo.balance === 'NaN') {
            buttonState.text = t('enterAmount')
            buttonState.disabled = true
            return buttonState
        } else if (parseFloat(tokenFrom.balance) < 0.001) {
            buttonState.text = t('minimumAmount', {x: '0.001'})
            buttonState.disabled = true
            return buttonState
        } else if (parseFloat(tokenFrom.balance) > parseFloat(tokenFrom.tokenBalance)) {
            buttonState.text = t('insufficientTokenBalance', {x: tokenFrom.tokenName.toUpperCase()})//`Insufficient ${tokenFrom.tokenName.toUpperCase()} balance`
            buttonState.disabled = true
            return buttonState
        } else if (parseFloat(tokenTo.balance) > parseFloat(tokenTo.tokenBalance)) {
            buttonState.text = t('insufficientTokenBalance', {x: tokenTo.tokenName.toUpperCase()})//`Insufficient ${tokenFrom.tokenName.toUpperCase()} balance`
            buttonState.disabled = true
            return buttonState
        }

        buttonState.text = tExchange.supply;
        return buttonState
    }


    //코인별 전체 밸런스 업데이트(5초마다 체크)
    useInterval(async () => {
        if (tokenFrom.tokenName) {
            const tokenBalance = await getTokenBalance(address, tokenFrom.tokenName)
            setTokenFrom({
                ...tokenFrom,
                tokenBalance: tokenBalance
            })
            // iostApi.getTokenBalance({address, tokenName: tokenFrom.tokenName}).then((tokenBalance) => {
            //     setTokenFrom({
            //         ...tokenFrom,
            //         tokenBalance: tokenBalance
            //     })
            // })
        }
        if (tokenTo.tokenName) {


            const tokenBalance = await getTokenBalance(address, tokenTo.tokenName)

            const amount = getCalculatedLiquidityAmount(tokenFrom.tokenName, tokenTo.tokenName, tokenFrom.balance)

            setTokenTo({
                ...tokenTo,
                tokenBalance: tokenBalance,
                balance: amount
            })
            // iostApi.getTokenBalance({address, tokenName: tokenTo.tokenName}).then((tokenBalance) => {
            //     setTokenTo({
            //         ...tokenTo,
            //         tokenBalance: tokenBalance
            //     })
            // })
        }

        if(tokenFrom.tokenName && tokenTo.tokenName){
            getMyLpToken(tokenFrom.tokenName, tokenTo.tokenName);
        }
    }, [5000])

    const getTokenBalance = async (address, tokenName) => {
        return await iostApi.getTokenBalance({address, tokenName: tokenName})
    }

    const buttonState = getLiquidityButtonErrorText()

    const getDisabledTokenNames = () => {

        const disabledTokenNames = ['don', 'iost']

        const fromTokenName = tokenFrom.tokenName
        const toTokenName = tokenTo.tokenName

        if (!fromTokenName && !toTokenName) return

        if (whichToken === 'from') {
            if (!toTokenName) return []
            if (toTokenName === 'iwbnb') {
                return disabledTokenNames
            }
            if (fromTokenName === 'husd') {
                return []
            }
            return ['iwbnb']
        }
        if (whichToken === 'to') {
            if (!fromTokenName) return
            if (fromTokenName === 'iwbnb') {
                return disabledTokenNames
            }
            if (fromTokenName === 'husd') {
                return []
            }
            return ['iwbnb']
        }

        if (tokenFrom.tokenName === 'iwbnb' || tokenTo.tokenName === 'iwbnb' ) {
            return ['don', 'iost']
        }
    }


    return (
        <Div width={sizeValue(436, null, '95%')}>
            <Div bg={'white'} minHeight={400} rounded={10} shadow={'lg'}>

                {/* Card */}
                <Div>

                    <Div relative>
                        {/* Title */}
                        <Heading
                            title={'Add Liquidity'}
                            desc={t('addLiquidityDesc')}
                        />
                        {/* Back */}
                        <StyledSetting absolute top={24} right={24} cursor={1}>
                            <RiCloseFill size={25} onClick={()=>history.goBack()}/>
                        </StyledSetting>
                    </Div>
                    <Hr/>
                    <Div p={24}>
                        <Div textAlign={'left'} mb={5}>
                            <Button bg={'light'} p={0} onClick={pairSelectionToggle} rounded={5} px={13} height={40}>
                                <Flex alignItems={'center'} justifyContent={'space-between'}  >
                                    {
                                        pair ? (
                                            <>
                                                <SymbolGroup symbol1={pair.symbol1} symbol2={pair.symbol2} size={25} />
                                                <Div ml={10} mt={4}>{pair.dpLpTokenName}</Div>
                                            </>
                                        ) : (
                                            <Span lineHeight={1.2}>Select a pair</Span>
                                        )
                                    }

                                    <Flex ml={8}>
                                        <FaChevronDown />
                                    </Flex>
                                </Flex>
                            </Button>
                        </Div>
                        {
                            pair && (
                                <>
                                    <TokenBox
                                        title={'Input'}
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

                                    <Flex justifyContent={'center'} py={13}>
                                        <AiOutlinePlus size={20}/>
                                    </Flex>

                                    <TokenBox
                                        title={'Input'}
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
                                </>
                            )
                        }


                        {/* PRICES AND POOL SHARE */}
                        {
                            (price1 && price2) &&
                            <Div fg={'darkMid'} mt={20} lineHeight={23} rounded={5} bc={'light'} p={13}>
                                <Div fg={'black'}>
                                    Price & Pool Share
                                </Div>
                                <Flex justifyContent={'space-between'}>
                                    <Div></Div>
                                    <Div>{price1}</Div>
                                </Flex>
                                <Flex justifyContent={'space-between'}>
                                    <Div></Div>
                                    <Div>{price2}</Div>
                                </Flex>
                                <Flex justifyContent={'space-between'}>
                                    <Div></Div>
                                    <Div>{sharPoolRate}% Share of Pool</Div>
                                </Flex>
                            </Div>
                        }


                        {/* Add Liquidity Button */}
                        <Button mt={20} bg={'primary'} fg={'white'} block rounded={5} bold fontSize={15} height={48} onClick={onAddLiquidityClick} disabled={buttonState.disabled}>
                            {
                                buttonState.text
                            }
                        </Button>
                    </Div>

                    <Hr/>

                    {/* Content */}
                    {
                        pair && (
                            <Div p={24}>
                                <Div mb={10}>
                                    <Flex justifyContent={'space-between'}>
                                        <Div>{t('lpTokenWalletDesc')}</Div>
                                        <Flex>
                                            <Div></Div>
                                        </Flex>
                                    </Flex>
                                </Div>
                                {
                                    (tokenFrom.tokenName && tokenTo.tokenName) && (
                                        isMyLpTokenLoading ? <Skeleton active/> :
                                            <Div textAlign={'center'}>
                                                {
                                                    myLpToken ?
                                                        <LiquidityItem key={'myLpTokenItem'} data={myLpToken}/>
                                                        :
                                                        <Div>No liquidity found.</Div>
                                                }
                                            </Div>
                                    )
                                }
                            </Div>

                        )
                    }

                </Div>

            </Div>

            <Modal
                title={'Select a pair'}
                visible={pairSelectionModalOpen}
                onCancel={pairSelectionToggle}
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
                    <PairSelection
                        selectedLpTokenName={pair ? pair.lpTokenName : ''}
                        onItemClick={onPairTokenSelected}
                    />
                </Div>
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
                        tokenList={tokenList}
                        selectedTokenName={whichToken === 'from' ? tokenFrom.tokenName : tokenTo.tokenName}
                        disabledTokenNames={[]
                            // whichToken === 'to' ? getDisabledTokenNames() : []
                        }
                        onItemClick={onTokenSelected}
                    />
                </Div>
            </Modal>

        </Div>
    );
};

export default withRouter(AddLiquidity);
