import React, {useState, useEffect} from 'react';
import loadable from "@loadable/component";
import iostApi from "~/lib/iostApi";
import {useParams, Redirect} from 'react-router-dom'
import useSize from "~/hooks/useSize";
import useWallet from '~/hooks/useWallet'
import {Div, A, Flex, Span, Button, XCenter, Img} from "~/styledComponents/shared";
import styled from 'styled-components'
import properties from "~/properties";
import {withTranslation} from "react-i18next";
import {useRecoilState} from "recoil";
import axios from 'axios'
import ComUtil from "~/util/ComUtil";
import WalletUtil from "~/util/WalletUtil"
import {Modal} from "antd";
import {connectWalletModalState, nowState} from "~/hooks/atomState";

import coinDonyImg from '~/assets/coin_dony.png';
import useInterval from "~/hooks/useInterval";
import {withRouter} from 'react-router-dom'
import useRunningStatus from "~/hooks/useRunningStatus";
import Server from "~/properties";

import {FaChevronDown, FaChevronUp} from 'react-icons/fa'
import useModal from "~/hooks/useModal";
import {HexEdge} from "~/styledComponents/shared/Shapes";
import BigNumber from "bignumber.js";
import {SymbolGroup} from "~/components/exchange/Components";
import {HeartBeat} from "~/styledComponents/shared/AnimationLayouts";

const IWTokenBigCard = loadable(() => import('~/components/common/layouts/IWTokenBigCard'))
const TradeBigCard = loadable(() => import('~/components/common/layouts/TradeBigCard'))
const Deposit = loadable( () => import("~/components/common/contents/Deposit"));
const Harvest = loadable( () => import("~/components/common/contents/Harvest"));
const Withdraw = loadable( () => import("~/components/common/contents/Withdraw"));
const HarvestWithDraw = loadable( () => import("~/components/common/contents/HarvestWithDraw"));
const {contractList, tokenImages} = properties;
const contractAddress = properties.address.token;

const HarvestWidthdrawButton = styled.div`

`

const Trade = withTranslation()(({t, history}) => {


    //파라미터로 넘어온 토큰명(name)history
    const {uniqueKey} = useParams()
    const contract = contractList[uniqueKey] || {tokenName: null, img: null, pool: null, forcedStartTime: null, forcedEndTime: null}
    const {tokenName, tokenName: iwTokenName, ercTokenName, tokenType, img, pool} = contract//contractList[uniqueKey]
    // const {tokenName, tokenType, img, pool} = contracttokenType, img, pool

    const [, setNow] = useRecoilState(nowState)

    const [status, startTime, endTime, duration] = useRunningStatus(
        {
            uniqueKey: uniqueKey,
            pool: pool,
            //TODO 아래는 테스트를 쉽게 하기위한 프로퍼티 입니다. 배포 전 /properties.js 의 forcedStartTime, forcedEndTime 삭제 요망 [delete]
            forcedStartTime: contract.forcedStartTime ? contract.forcedStartTime : null,
            forcedEndTime: contract.forcedEndTime ? contract.forcedEndTime : null
        }
    )

    const {sizeValue} = useSize()

    const [iwLoading, setIwLoading] = useState(true)
    const [donLoading, setDonLoading] = useState(true)
    const [stakedLoading, setStakedLoading] = useState(true)

    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet} = useWallet()

    const [iwTokenBalance,setIwTokenBalance] = useState();
    const [donyBalance,setDonyBalance] = useState();
    const [stakeBalance,setStakeBalance] = useState();

    const [harvestWithDrawModal,setHarvestWithDrawModal] = useState(false);

    const [harvestModal,setHarvestModal] = useState(false);
    // const [receiveDonyAmt,setReceiveDonyAmt] = useState('');
    const [withDrawModal,setWithDrawModal] = useState(false);
    const [depositModal,setDepositModal] = useState(false);
    const [intervalTime, setIntervalTime] = useState(null)



    //swap state
    const [swapOpen, setSwapOpen, selected, setSelected, setSwapState, toggleSwap] = useModal();


    useEffect(() => {

        setNow(Date.parse(new Date))

        //don balance
        getAllBalance()

        //staked balance

        getIwTokenBalance()
        // async function fetch() {
        //     await Promise.all([getAllBalance(), getIwTokenBalance()])
        //     setLoading(false)
        // }

        // fetch()
    }, [])

    // 1초에 한번씩 global 로 사용될 now 갱신
    useInterval(() => {
        setNow(Date.parse(new Date))
    }, 1000)


    //로그인 시 5초마다 밸런스 갱신
    //로그아웃 시 갱신 종료
    useEffect(() => {

        getAllBalance()

        getIwTokenBalance()

        if (address) {
            setIntervalTime(5000)
        }else {
            setIntervalTime(null)
        }
    }, [address])

    useInterval(() => {
        getAllBalance()
        getIwTokenBalance()
    }, intervalTime)


    const getDonBalance = async () => {
        try {

            if (!tokenName){
                return
                setDonLoading(false)
            }


            const myWallet = WalletUtil.getMyWallet();
            if(hasIWallet()) {
                if (isLogin()) {

                    const iost = myWallet.wallet.newIOST(window.IOST);
                    const iostHost = properties.IOST_ADDR;//iost.currentRPC._provider._host;

                    const res = await Promise.all([
                        getBatchContractStorage(),
                        getNodeInfo(iostHost)
                    ])

                    const batchContractStorage = res[0]
                    const nodeInfo = res[1]

                    let userBalance = batchContractStorage[0];

                    if (userBalance === "null") {
                        userBalance = 0;
                    }
                    userBalance = parseFloat(userBalance);
                    // setStakeBalance(userBalance);

                    let rewardPerToken = parseFloat(batchContractStorage[1]);
                    let totalSupply = parseFloat(batchContractStorage[2]);
                    let rewardRate = parseFloat(batchContractStorage[3]);
                    let periodFinish = parseFloat(batchContractStorage[4]);
                    let lastUpdate = parseFloat(batchContractStorage[5]);
                    let userRewardPerTokenPaid = batchContractStorage[6];
                    if (userRewardPerTokenPaid === "null") {
                        userRewardPerTokenPaid = 0;
                    }
                    userRewardPerTokenPaid = parseFloat(userRewardPerTokenPaid);

                    let userReward = batchContractStorage[7];
                    if (userReward === "null") {
                        userReward = 0;
                    }
                    userReward = parseFloat(userReward);

                    let lastTimeRewardApplicable = periodFinish;  // block.time 가져와서 비교하기


                    let serverTime = parseFloat((nodeInfo.data.server_time / (10 ** 9)).toFixed(0));
                    if (periodFinish >= serverTime) {
                        lastTimeRewardApplicable = serverTime;
                    }

                    let addingReward = 0;
                    if (totalSupply > 0) {
                        addingReward = (lastTimeRewardApplicable - lastUpdate) * rewardRate / totalSupply;
                    }

                    rewardPerToken = rewardPerToken + addingReward;
                    userBalance = userBalance * (rewardPerToken - userRewardPerTokenPaid) + userReward;

                    console.log("userBalance : ", userBalance);

                    if (isNaN(userBalance)) {
                        userBalance = 0
                    }

                    let tempDonyBalance = parseFloat((userBalance * 0.9).toFixed(4));
                    if(userBalance <= 0.00011) {
                        tempDonyBalance = 0;
                    }
                    setDonyBalance(tempDonyBalance);
                    // setDonLoading(false)
                }
                else{
                    setDonyBalance(0)
                }
            }
            setDonLoading(false)
        }catch (err){
            console.log(err)
        }
    }

    const getStakedBalance = async() => {
        if (!tokenName){
            return
            setStakedLoading(false)
        }
        if(hasIWallet()) {
            if (isLogin()) {
                const stakedBalance = await iostApi.getTradeUserStakeBalance(pool, address)
                setStakeBalance(stakedBalance)
            }else{
                setStakeBalance(0)
            }
        }
        setStakedLoading(false)
    }

    //속도 개선용
    const getAllBalance = async () => {
        getDonBalance()
        getStakedBalance()
    }

    //기존 버전 backup
    const getAllBalance_bak = async () => {
        console.time()
        try{

            if (!tokenName)
                return



            const myWallet = WalletUtil.getMyWallet();
            if(hasIWallet()) {
                if (isLogin()) {

                    const result = await getBatchContractStorage()

                    console.log('===========iost-PeriodFinish:' + result)

                    let userBalance = result[0];

                    if (userBalance === "null") {
                        userBalance = 0;
                    }
                    userBalance = parseFloat(userBalance);
                    setStakeBalance(userBalance);

                    let rewardPerToken = parseFloat(result[1]);
                    let totalSupply = parseFloat(result[2]);
                    let rewardRate = parseFloat(result[3]);
                    let periodFinish = parseFloat(result[4]);
                    let lastUpdate = parseFloat(result[5]);
                    let userRewardPerTokenPaid = result[6];
                    if (userRewardPerTokenPaid === "null") {
                        userRewardPerTokenPaid = 0;
                    }
                    userRewardPerTokenPaid = parseFloat(userRewardPerTokenPaid);

                    let userReward = result[7];
                    if (userReward === "null") {
                        userReward = 0;
                    }
                    userReward = parseFloat(userReward);

                    let lastTimeRewardApplicable = periodFinish;  // block.time 가져와서 비교하기

                    if(hasIWallet()) {
                        if(isLogin()) {
                            const iost = myWallet.wallet.newIOST(window.IOST);
                            //const iostHost = iost.currentRPC._provider._host;
                            const iostHost = properties.IOST_ADDR;
                            const data = await axios.get(iostHost + "/getNodeInfo")

                            let serverTime = parseFloat((data.data.server_time / (10 ** 9)).toFixed(0));

                            // console.log('!!!! server_time : ', serverTime);
                            // console.log(periodFinish);

                            if (periodFinish >= serverTime) {
                                lastTimeRewardApplicable = serverTime;
                            }

                            // console.log("lastTimeRewardApplicable : ", lastTimeRewardApplicable);
                            // console.log("lastUpdate: ", lastUpdate);
                            // console.log("rewardRate: ", rewardRate);
                            // console.log("totalSupply : ", totalSupply);
                            // console.log("rewardPerToken : ", rewardPerToken);
                            // console.log("userReward : ", userReward);
                            // console.log("userRewardPerTokenPaid : ", userRewardPerTokenPaid);

                            let addingReward = 0;
                            if (totalSupply > 0) {
                                addingReward = (lastTimeRewardApplicable - lastUpdate) * rewardRate / totalSupply;
                            }

                            rewardPerToken = rewardPerToken + addingReward;
                            userBalance = userBalance * (rewardPerToken - userRewardPerTokenPaid) + userReward;
//                console.log("addingReward : ", addingReward);
                            console.log("userBalance : ", userBalance);
//                console.log("rewardPerToken : ", rewardPerToken);

                            if (isNaN(userBalance)) {
                                userBalance = 0
                            }

                            setDonyBalance(parseFloat((userBalance * 0.9).toFixed(4)));
                        }
                    }
                }
            }
            console.timeEnd()
        }catch (error){
            console.log(error)
        }
    }

    const getNodeInfo = async (iostHost) => {
        return await axios.get(iostHost + "/getNodeInfo")
    }


    const getIwTokenBalance = async() => {
        if (!address){
            setIwLoading(false)
            return
        }

        let vIwTokenBalance = await iostApi.getTokenBalance({address: address, tokenName:iwTokenName})
        // console.log({address, iwTokenName, vIwTokenBalance})

        //iw 일 경우 destroy amount
        if (tokenType === 'iw') {
            if (contract.tokenName === 'iwbly') {
                vIwTokenBalance = new BigNumber(vIwTokenBalance).minus(ComUtil.getDestroyBlyAmount(address)).toNumber()
            }
            else if (contract.tokenName === 'iwbtc') {
                vIwTokenBalance = new BigNumber(vIwTokenBalance).minus(ComUtil.getDestroyBtcAmount(address)).toNumber()
            }
        }
        setIwTokenBalance(vIwTokenBalance)
        setIwLoading(false)
    }

    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    const isPoolOpen = () => {
        return iostApi.getPoolIsOpen(pool)
    }

    const onWithDraw = async () => {
        if (await isPoolOpen()) {
            setWithDrawModal(true);
            getAllBalance()
        }
    }
    const onWithDrawClose = async () => {
        if (await isPoolOpen()) {
            setWithDrawModal(false);
            getAllBalance()
        }
    }

    const onDepositClick = async () => {

        if(status === 0){
            window.$message.warning('Not Deposit');
            return false;
        }
        // setDepositFormNumber('');
        if (await isPoolOpen()) {
            setDepositModal(true);
        }
    }

    const onDepositClose = () => {
        setDepositModal(false);
        getAllBalance()
    }


    const onHarvest = () => {
        if (!donyBalance) {
            return;
        }
        // setReceiveDonyAmt(donyBalance)
        setHarvestModal(true);
    }
    const onHarvestClose = () => {
        setHarvestModal(false);
        getAllBalance()
    }


    const onHarvestWithDraw = () => {
        setHarvestWithDrawModal(true);
    }
    const onHarvestWithDrawClose = () => {
        setHarvestWithDrawModal(false);
        getAllBalance()
    }

    const getTradeDepositWithDrawBtns = () => {
        let btn1 = null;
        let btn2 = null;
        if(parseFloat(stakeBalance) > 0){
            btn1 = <Button
                minWidth={78}
                bg={'primary'} fg={'white'}
                fontSize={14} mr={10} px={10}
                disabled={
                    (![1].includes(status)) ? true:false //종료시 disable 20200107
                }
                minHeight={38}
                onClick={onWithDraw}
            >
                {t('withdraw')}
            </Button>;
        }

        if((parseFloat(stakeBalance) >= 0) && status !== 3) {
            btn2 = <Button
                minWidth={78}
                bg={'primary'} fg={'white'}
                fontSize={14} px={10}
                disabled={
                    // (isOpen && coinListX.status > 0) ? false:true
                    (status == 1) ? false:true  //종료시(status==2) disable 20200107
                }
                minHeight={38}
                onClick={onDepositClick}
            >
                {t('Deposit2')}
            </Button>;
        }

        return <div>{btn1}{btn2}</div>;
    }

    const getBatchContractStorage = async() => {
        return await iostApi.getTradeBalanceAll(pool, address);
    }

    const Symbol = () => {
        if (tokenType === 'iw') {
            return(
                <HexEdge width={60} height={60}>
                    <Img src={img} width={32} height={32} alt={ComUtil.coinName(tokenName)}/>
                </HexEdge>
            )
        }else if (tokenType === 'lp') {
            const lpTokenNames = ComUtil.getLpTokenNames(tokenName)
            return (
                <SymbolGroup symbol1={lpTokenNames[0]} symbol2={lpTokenNames[1]} size={40} />
                // <Flex>
                //     <SymbolIcon src={img} alt="" width={size} zIndex={1}/>
                //     <SymbolIcon src={img2} alt="" width={size} ml={-7}/>
                // </Flex>
            )
        }else {
            return <Img src={img} width={40} height={40} alt={ComUtil.coinName(tokenName)}/>
        }
    }


    if (!tokenName) return <Redirect to={'/checking'} />


    let symbol1 = null;
    let symbol2 = null;
    if(tokenType === 'lp') {
        const lpTokenNames = ComUtil.getLpTokenNames(tokenName)
        symbol1 = lpTokenNames[0];
        symbol2 = lpTokenNames[1];
    }
    return (
        <Div pt={50}>



            <Flex justifyContent={'center'} fg={'white'} fontSize={35} minHeight={52}>
                {
                    status === -1 && (
                        <Div>
                            <Div textAlign={'center'}>Preparing</Div>
                        </Div>
                    )
                }
                {
                    status === 0 && (
                        <Div>
                            <Div textAlign={'center'}>Coming soon</Div>
                            <Div lighter>{ComUtil.countdown(ComUtil.leftTime(duration))}</Div>
                        </Div>
                    )
                }
                {
                    status === 1 && (
                        <Div>
                            <Div textAlign={'center'}>Running</Div>
                            <Div lighter>{ComUtil.countdown(ComUtil.leftTime(duration))}</Div>
                        </Div>
                    )
                }
                {
                    status === 2 && (
                        <Div>
                            Finished
                        </Div>
                    )
                }

            </Flex>

            {
                (tokenType === 'iw' && contract.tokenAddress) && (
                    <Flex justifyContent={'center'}  mt={20} mb={20} >
                        <Div fg={'white'} textAlign={'center'}
                             width={sizeValue('unset', null, '90%')}
                             fontSize={15} py={5} px={10}
                             bc={'info'}
                            // bg={'rgba(255,255,255, 0.9)'}
                             rounded={7}
                             style={{wordBreak: 'break-word'}}
                        >
                            <Span mr={10}>{contract.ircTokenName} Contract Address is</Span>
                            <A fg={'white'} target={'_blank'} href={`https://www.iostabc.com/contract/${contract.tokenAddress}`}>
                                <b>{contract.tokenAddress}</b>
                            </A>
                        </Div>
                    </Flex>
                )
            }


            {
                tokenType === 'iw' && (
                    <Flex flexDirection={'column'} justifyContent={'center'} >
                        <Flex flexDirection={'column'}
                            // bg={swapOpen && 'white'}
                            // p={20}
                            // rounded={10}
                              width={sizeValue(450, null, '90%')}
                              m={sizeValue(16, null, 0)}
                        >
                            <Button bg={'info'} fg={'white'} fontSize={18} px={15}
                                    onClick={toggleSwap}
                            >
                                <Flex>{ercTokenName && ercTokenName.toUpperCase()} Swap<Flex ml={5}>{swapOpen ? <FaChevronUp />:<FaChevronDown />}</Flex></Flex>
                            </Button>

                            {
                                swapOpen && (
                                    <Flex flexGrow={1} width={'100%'} flexDirection={'column'} pt={20}>
                                        <IWTokenBigCard
                                            uniqueKey={uniqueKey}
                                            name={contract.tokenName}
                                            ercTokenName={ercTokenName}
                                            balance={iwTokenBalance?iwTokenBalance:0}
                                            status={status}
                                            loading={iwLoading}
                                        />
                                    </Flex>

                                )
                            }
                        </Flex>
                    </Flex>
                )
            }




            <Flex flexDirection={sizeValue('row', null, 'column')} justifyContent={'center'} my={50}>

                <Div width={sizeValue(230, null, '90%')}
                     m={sizeValue(16, null, 0)}
                     mb={sizeValue(16, null, 30)}
                >
                    <TradeBigCard
                        name={window.$tokenName}
                        img={coinDonyImg}
                        balance={donyBalance}
                        explain={t('harvest')}
                        childButton={
                            <Button
                                minWidth={78}
                                bg={'primary'} fg={'white'}
                                fontSize={14} px={10}
                                disabled={
                                    //coinListX.status == 2추가  종료시 무조건 disable 20200107 => Harvest & Withdraw 이용유도.
                                    //Running 일 경우만 Harvest(획득) 가능
                                    //Harvest 도니 잔액이 없을경우 버튼 비활성화 21.02.26 david
                                    !donyBalance ? true: (![1].includes(status)) ? true:false
                                }
                                minHeight={38}
                                onClick={onHarvest}
                            >
                                {t('get')}
                            </Button>
                        }
                        type={'harvest'}
                        loading={donLoading}
                    />
                </Div>
                <Div width={sizeValue(230, null, '90%')}
                     m={sizeValue(16, null, 0)}
                     mb={sizeValue(16, null, 30)}
                >
                    <TradeBigCard
                        tokenName={contract.tokenName}
                        // isIwFlag={contract.isIwFlag}
                        name={contract.tokenName.toUpperCase()}
                        img={contract.img}
                        // img2={contract.img2}
                        tokenType={contract.tokenType}
                        balance={stakeBalance}
                        explain={t('Depositing')}
                        childButton={getTradeDepositWithDrawBtns()}
                        loading={stakedLoading}
                        type={'mining'}
                    />
                </Div>
                {/*{*/}
                {/*    // iwBly 일경우 나오게*/}
                {/*    uniqueKey.toUpperCase() === 'IWBLY' &&*/}
                {/*    <Div width={sizeValue(230, null, '90%')}*/}
                {/*         m={sizeValue(16, null, 0)}>*/}
                {/*        <IWBlyBigCard*/}
                {/*            uniqueKey={uniqueKey}*/}
                {/*            name={contract.tokenName}*/}
                {/*            balance={iwTokenBalance?iwTokenBalance:0}*/}
                {/*            status={status}*/}
                {/*            loading={loading}*/}
                {/*        />*/}
                {/*    </Div>*/}
                {/*}*/}
            </Flex>


            {/* 수익획득 및 코인인출 */}
            <XCenter mb={50}>
                <HeartBeat play={[2,3].includes(status)} duration={2} delay={1}>
                    <Button
                        bg={'primary'} fg={'white'}
                        fontSize={16} mr={10}
                        px={15}
                        py={10}
                        rounded={3}
                        disabled={[-1, 0].includes(status)}
                        shadow={'md'}
                        onClick={address ? onHarvestWithDraw:changeConnectWallet}
                    >
                        {t('HarvestWithdraw')}({ComUtil.coinName(tokenName.toUpperCase())})
                    </Button>
                </HeartBeat>
            </XCenter>

            {/* 획득 harvest */}
            <Modal
                title={<Flex><img src={tokenImages.don} style={{display: 'block', width: 20}} /><Div lineHeight={25} ml={8} mb={-3}>{t('HarvestDONY')}</Div></Flex>}
                visible={harvestModal}
                onCancel={onHarvestClose}
                // bodyStyle={{padding: 0}}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
            >
                <Harvest
                    uniqueKey={uniqueKey}
                    onClose={onHarvestClose}
                    donyBalance={donyBalance}
                />
            </Modal>

            {/* 인출 withdraw */}
            <Modal
                title={
                    tokenType === 'iw' ? (
                        <Flex>
                            <HexEdge width={35} height={35}>
                                <img src={contract.img} style={{display: 'block', width: 20}} />
                            </HexEdge>
                            <Div lineHeight={25} ml={8} mb={-3}>{t('withdraw')}</Div>
                        </Flex>
                    ) : tokenType === 'lp' ? (
                        <Flex>
                            <SymbolGroup symbol1={symbol1} symbol2={symbol2} size={30} />
                            <Div lineHeight={25} ml={8} mb={-3}>{t('withdraw')}</Div>
                        </Flex>
                    ) : (
                        <Flex>
                            <img src={contract.img} style={{display: 'block', width: 20}} />
                            <Div lineHeight={25} ml={8} mb={-3}>{t('withdraw')}</Div>
                        </Flex>
                    )

                }
                visible={withDrawModal}
                onCancel={onWithDrawClose}
                // bodyStyle={{padding: 0}}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
            >
                <Withdraw
                    uniqueKey={uniqueKey}
                    status={status}
                    name={tokenName}
                    onClose={onWithDrawClose}
                    balance={stakeBalance}
                />
            </Modal>

            {/* 예치 deposit */}
            {
                <Modal
                    title={
                        tokenType === 'iw' ? (
                            <Flex>
                                <HexEdge width={35} height={35}>
                                    <img src={contract.img} style={{display: 'block', width: 20}} />
                                </HexEdge>
                                <Div lineHeight={25} ml={8} mb={-3}>{t('Deposit2')}</Div>
                            </Flex>
                        ) : tokenType === 'lp' ? (
                            <Flex>
                                <SymbolGroup symbol1={symbol1} symbol2={symbol2} size={30} />
                                <Div lineHeight={25} ml={8} mb={-3}>{t('Deposit2')}</Div>
                            </Flex>
                        ) : (
                            <Flex>
                                <img src={contract.img} style={{display: 'block', width: 20}} />
                                <Div lineHeight={25} ml={8} mb={-3}>{t('Deposit2')}</Div>
                            </Flex>
                        )

                    }
                    visible={depositModal}
                    onCancel={onDepositClose}
                    // bodyStyle={{padding: 0}}
                    footer={null}
                    width={'auto'}
                    centered={true}
                    focusTriggerAfterClose={false}
                    getContainer={false}
                    maskClosable={false}
                >
                    <Deposit
                        name={tokenName}
                        uniqueKey={uniqueKey}
                        status={status}
                        // tokenName={window.$tokenName}
                        // pool={contract.pool}
                        onClose={onDepositClose}
                    />
                </Modal>
            }
            {/* 수익획득 및 코인인출 Harvest & Withdraw*(DON) */}
            {
                <Modal
                    title={
                        <Flex>
                            <img src={tokenImages.don} alt="don" style={{display: 'block', width: 20}}/>
                            <Div lineHeight={25} mx={8} mb={-3}>X</Div>
                            {
                                tokenType === 'iw' ? (
                                    <HexEdge width={35} height={35}>
                                        <img src={contract.img} alt={contract.tokenName} style={{display: 'block', width: 20}}/>
                                    </HexEdge>
                                ) : tokenType === 'lp' ? (
                                    <SymbolGroup symbol1={symbol1} symbol2={symbol2} size={30} />
                                ) : (
                                    <img src={contract.img} alt={contract.tokenName} style={{display: 'block', width: 20}}/>
                                )
                            }
                            <Div lineHeight={25} ml={8} mb={-3}>{t('HarvestWithdraw')}</Div>
                        </Flex>
                    }
                    visible={harvestWithDrawModal}
                    onCancel={onHarvestWithDrawClose}
                    // bodyStyle={{padding: 0}}
                    footer={null}
                    width={'auto'}
                    centered={true}
                    focusTriggerAfterClose={false}
                    getContainer={false}
                    maskClosable={false}
                >
                    <HarvestWithDraw
                        uniqueKey={uniqueKey}
                        // name={tokenName}
                        tokenName={window.$tokenName}
                        pool={contract.pool}
                        donyBalance={donyBalance}
                        stakeBalance={stakeBalance}
                        onClose={onHarvestWithDrawClose}
                    />
                </Modal>
            }

        </Div>
    );
});
export default withTranslation()(withRouter(Trade))