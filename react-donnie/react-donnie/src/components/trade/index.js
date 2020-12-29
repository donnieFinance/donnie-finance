import React, {useState, useEffect} from 'react';
import loadable from "@loadable/component";
import BigNumber from "bignumber.js";
import iostApi from "~/lib/iostApi";
import {useParams, Redirect} from 'react-router-dom'
import useSize from "~/hooks/useSize";
import useIWallet from '~/hooks/useIWallet'
import {Div, Flex, Button, XCenter} from "~/styledComponents/shared";
import useTokenBalance from "~/hooks/useTokenBalance";
import TimeCountDown from "~/components/common/layouts/TimeCountDown";
import properties from "~/properties";
import {withTranslation} from "react-i18next";
import {useRecoilState} from "recoil";
import axios from 'axios'
import ComUtil from "~/util/ComUtil";
import {
    checkingCoinListSelector,
    checkingReloadTimeSelector,
    checkingStakeLeftTimeSelector, checkingStakeSelector,
    myAddressSelector,
    connectWalletModalState, checkingCoinListLoadingState
} from "~/hooks/atomState";

import coinDonyImg from '~/assets/coin_dony.png';
import EarnCoinCard from "~/components/common/layouts/EarnCoinCard";


const TradeBigCard = loadable(() => import('~/components/common/layouts/TradeBigCard'))
const DepositModal = loadable( () => import("~/components/common/modals/DepositModal"));
const WithDrawModal = loadable( () => import("~/components/common/modals/WithDrawModal"));
const HarvestModal = loadable( () => import("~/components/common/modals/HarvestModal"));
const HarvestWithDrawModal = loadable( () => import("~/components/common/modals/HarvestWithDrawModal"));

export default withTranslation()((props) => {

    const {t} = props;

    const {tokenName} = useParams()

    const [token] = useTokenBalance({tokenName})

    const {sizeValue} = useSize()

    const {contractList} = properties;
    const contractAddress = properties.address.token;
    const [leftTime,] = useRecoilState(checkingStakeLeftTimeSelector);
    // const [address,] = useRecoilState(myAddressSelector);
    const [coinList,] = useRecoilState(checkingCoinListSelector);
    const [reloadTime,] = useRecoilState(checkingReloadTimeSelector)
    const [stake,] = useRecoilState(checkingStakeSelector);

    // Checking CoinList loading 여부
    const [loading,] = useRecoilState(checkingCoinListLoadingState)

    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet} = useIWallet()

    const [xCoin,setXCoin] = useState(tokenName);
    const [coinListX,setCoinListX] = useState({
        status:0
    });

    const [coinListCallBack,setCoinListCallBack] = useState(false);
    const [precision,setPrecision] = useState(0);
    const [decimals,setDecimals] = useState(0);
    const [coinImg,setCoinImg] = useState('');
    const [isOpen,setIsOpen] = useState(true);

    const [donyBalance,setDonyBalance] = useState('...');
    const [coinBalance,setCoinBalance] = useState('...');
    const [stakeBalance,setStakeBalance] = useState('...');

    const [harvestWithDrawModal,setHarvestWithDrawModal] = useState(false);
    const [loadingHarvestWithDraw,setLoadingHarvestWithDraw] = useState(false);

    const [harvestModal,setHarvestModal] = useState(false);
    const [receiveDonyAmt,setReceiveDonyAmt] = useState('');
    const [loadingHarvest,setLoadingHarvest] = useState(false);

    const [withDrawModal,setWithDrawModal] = useState(false);
    const [withDrawFormNumber,setWithDrawFormNumber] = useState('');
    const [loadingWithDraw,setLoadingWithDraw] = useState(false);

    const [depositModal,setDepositModal] = useState(false);
    const [depositModalType,setDepositModalType] = useState(1);
    const [depositFormNumber,setDepositFormNumber] = useState('');
    const [loadingDeposit,setLoadingDeposit] = useState(false);

    useEffect(() => {

        // Only once
        if (address && !coinListCallBack) {
            setCoinListCallBack(true);
            getBalanceAll()
        }
        const coinListX = coinList.filter(e => (e.name === xCoin));
        setCoinListX(coinListX.length > 0 ? coinListX[0] : '')

    }, [coinList])

    useEffect(() => {
        if(reloadTime != null) {
            if (coinList.length > 0) {
                getBalanceAll()
            }
        }
    }, [reloadTime])


    useEffect(() => {
        init();
    }, [])

    const init = () => {
        if (coinList.length > 0) {
            getBalanceAll()
        }
    }

    const getBalanceAll = () => {
        const v_isOpen = coinList.filter(e => (e.name === xCoin))[0].isOpen;
        setIsOpen(v_isOpen)
        const v_coin_img = coinList.filter(e => (e.name === xCoin))[0].img;
        setCoinImg(v_coin_img);
        const v_precision = coinList.filter(e => (e.name === xCoin))[0].precision;
        setPrecision(v_precision);
        const v_decimals = coinList.filter(e => (e.name === xCoin))[0].decimals;

        if (v_decimals) {
            setDecimals(eval(`1e${v_decimals}`));
            getBalance()
        }
    }

    const getBalance = async () => {
        if(hasIWallet()) {
            if (isLogin()) {

                getBatchContractStorage(xCoin).then( result => {

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
                            const iost = window.IWalletJS.newIOST(window.IOST);
                            const iostHost = iost.currentRPC._provider._host;
                            axios.get(iostHost + "/getNodeInfo").then((data) => {
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
                                setDonyBalance(parseFloat(userBalance.toFixed(4)));

                            }).catch(err => {
                                console.log(err);
                            });
                        }
                    }
                });

                if(address != null) {
                    if(address != '') {
                        const data = await iostApi.getTokenBalance({address:address, tokenName:contractList[xCoin].tokenName});
                        setCoinBalance(data);
                    }
                }

            }
        }
    }

    const onTokenScan = () => {
        window.open("https://www.iostabc.com/token/" + contractAddress)
    }

    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    const onWithDraw = () => {
        setWithDrawFormNumber('');
        if (isOpen) {
            setWithDrawModal(true);
        }
    }
    const onWithDrawClose = () => {
        setWithDrawModal(false);
    }
    const onWithDrawChange = (numberVal) => {
        console.log("onWithDrawChange==",numberVal)
        setWithDrawFormNumber(numberVal);
    }
    const onWithDrawSend  = (amount) => {

        let amountVal = ComUtil.numToString(new BigNumber(amount));

        let contractID = contractList[xCoin].pool;
        setLoadingWithDraw(true);
        let txWithdraw = window.IWalletJS.iost.callABI(contractID, "withdraw", [
            amountVal
        ]);
        txWithdraw.gasLimit = 100000;  // default gasLimit와 동일함
        txWithdraw.addApprove('iost', amountVal)
        txWithdraw.amount_limit.push({ token: "*", value: "unlimited" });
        window.IWalletJS.iost.signAndSend(txWithdraw).on("success", (succ) => {
            console.log("succ", succ);
            window.$message.success('Success');
            setLoadingWithDraw(false);
            setWithDrawModal(false);
        }).on("failed", (fail) => {
            console.log("fail", fail);
            window.$message.error('fail');
            setLoadingWithDraw(false);
            setWithDrawModal(false);
            let message = JSON.parse(fail.substring(7));
            if(message.code === 2) {
                alert(t('message.lackOfIgas') + txWithdraw.gasLimit + '\n' + t('message.chargeIgasTime') );
            }
        });
    }

    const onDeposit = () => {
        if(coinListX.status === 0){
            window.$message.warning('Not Deposit');
            return false;
        }
        setDepositFormNumber('');
        if (isOpen) {
            setDepositModal(true);
        }
    }
    const onDepositClose = () => {
        setDepositModal(false);
    }
    const onDepositChange = (numberVal) => {
        console.log("onDepositChange==",numberVal)
        setDepositFormNumber(numberVal);
    }
    const onDepositSend  = (amount) => {

        let amountVal = ComUtil.numToString(new BigNumber(amount));

        // console.log("!!! depositAuth : ", type, amount)
        let contractID = contractList[xCoin].pool;
        setLoadingDeposit(true);
        console.log('stake amount:' + amountVal)
        console.log(contractID);
        let tx = window.IWalletJS.iost.callABI(contractID, "stake", [
            amountVal
        ]);
        tx.addApprove('iost', amountVal)
        tx.amount_limit.push({token: "*", value: "unlimited"});
        window.IWalletJS.iost.signAndSend(tx).on("success", (succ) => {
            console.log("succ", succ);
            window.$message.success('Success');
            setLoadingDeposit(false);
            setDepositModal(false);

        }).on("failed", (fail) => {
            //errorHandler(fail);
            console.log("fail", fail);
            window.$message.error('fail');
            setLoadingDeposit(false);
            setDepositModal(false);
        });
    }

    const onHarvest = () => {
        if (donyBalance === '...' || donyBalance == 0) {
            return;
        }
        setReceiveDonyAmt(donyBalance)
        setHarvestModal(true);
    }
    const onHarvestClose = () => {
        setHarvestModal(false);
    }
    const onHarvestSend = () => {
        //let amount = ComUtil.numToString(new BigNumber(receiveDonyAmt)); // TODO iost는 decimal 곱하지 않고 입력한 숫자 그대로 보내는게 맞는듯

        setLoadingHarvest(true);
        let contractID = contractList[xCoin].pool;
        let txGetReward = window.IWalletJS.iost.callABI(contractID, "getReward", []);
        txGetReward.gasLimit = 200000;  // gasLimit를 늘려줌
        window.IWalletJS.iost.signAndSend(txGetReward).on("success", (succ) => {
            console.log("succ", succ);
            window.$message.success('Success');
            setLoadingHarvest(false);
            setHarvestModal(false);

        }).on("failed", (fail) => {
            console.log("fail", fail);
            window.$message.error('fail');
            setLoadingHarvest(false);
            setHarvestModal(false);
            if (typeof fail === 'object' && fail.status_code === "BALANCE_NOT_ENOUGH") {
                // alert(t('message.lackOfIram'));
                window.$message.warning(`${t('message.lackOfIram')} ${t('message.chargeIgasTime')}`)
            } else {
                let message = JSON.parse(fail.substring(7));
                if (message.code === 2) {
                    window.$message.warning(t('message.lackOfIgas') + txGetReward.gasLimit + '\n' + t('message.chargeIgasTime'));
                    // alert(t('message.lackOfIgas') + txGetReward.gasLimit + '\n' + t('message.chargeIgasTime'))
                }
            }
        });
    }

    const onHarvestWithDraw = () => {
        setHarvestWithDrawModal(true);
    }
    const onHarvestWithDrawClose = () => {
        setHarvestWithDrawModal(false);
    }
    const onHarvestWithDrawSend = () => {

        setLoadingWithDraw(true);

        let contractID = contractList[xCoin].pool;
        let txExit = window.IWalletJS.iost.callABI(contractID, "exit", []);
        txExit.gasLimit = 300000;  // gasLimit를 늘려줌
        window.IWalletJS.iost.signAndSend(txExit).on("success", (succ) => {
            this.$message({
                message: 'Success',
                type: 'success'
            });
            this.loading.receiveAll = false
            setLoadingWithDraw(false);
            setHarvestWithDrawModal(false);
            console.log("succ", succ);

        }).on("failed", (fail) => {
            console.log("fail", fail);
            window.$message.error('fail');
            setLoadingWithDraw(false);
            setHarvestWithDrawModal(false);
            let message = JSON.parse(fail.length >= 7 ? fail.substring(7) : '');
            if(message.code === 2) {
                alert(t('message.lackOfIgas') + txExit.gasLimit + '\n' + t('message.chargeIgasTime') )
            }
        });
    }

    const getTradeDepositWithDrawBtns = () => {
        let btn1 = null;
        let btn2 = null;
        if(parseFloat(stakeBalance) > 0){
            btn1 = <Button
                minWidth={78}
                bg={'primary'} fg={'white'}
                fontSize={14} mr={10} px={10}
                minHeight={38}
                onClick={onWithDraw}
            >
                {t('withdraw')}
            </Button>;
        }

        if((parseFloat(stakeBalance) >= 0) && coinListX.status !== 3) {
            btn2 = <Button
                minWidth={78}
                bg={'primary'} fg={'white'}
                fontSize={14} px={10}
                disabled={
                    (isOpen && coinListX.status > 0) ? false:true
                }
                minHeight={38}
                onClick={onDeposit}
            >
                {t('Deposit2')}
            </Button>;
        }

        return <div>{btn1}{btn2}</div>;
    }

    const getBatchContractStorage = async(tokenName) => {
        return await iostApi.getTradeBalanceAll(contractList[tokenName].pool, address);
    }

    return (
        <Div pt={50}>

            <EarnCoinCard
                coinIcon={coinImg}
                coinName={xCoin.toUpperCase()}
                onTokenScan={onTokenScan}
                contractAddress={contractAddress}
                leftTime={leftTime}
            />

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
                                    (donyBalance === '...' || donyBalance === 0) ? true : false
                                }
                                minHeight={38}
                                onClick={onHarvest}
                            >
                                {t('get')}
                            </Button>
                        }
                        loading={loading}
                    />
                </Div>
                <Div width={sizeValue(230, null, '90%')}
                     m={sizeValue(16, null, 0)}>
                    <TradeBigCard
                        name={xCoin.toUpperCase()}
                        img={coinImg}
                        balance={stakeBalance}
                        explain={xCoin.toUpperCase()+' '+t('Mining')}
                        childButton={getTradeDepositWithDrawBtns()}
                        loading={loading}
                    />
                </Div>
            </Flex>


            <XCenter mb={50}>
                <Button
                    bg={'white'} bc={'donnie'} fg={'donnie'}
                    fontSize={16} mr={10}
                    px={15}
                    py={10}
                    rounded={3}

                    onClick={address ? onHarvestWithDraw:changeConnectWallet}
                >
                    {t('HarvestWithdraw')}({xCoin.toUpperCase()})
                </Button>
            </XCenter>


            {
                depositModal &&
                <DepositModal
                    xCoin={xCoin}
                    // title={t('Deposit2')+' '+xCoin.toUpperCase()}
                    isOpen={depositModal}
                    onClose={onDepositClose}
                    stakeStatus={stake.status}
                    xCoin={xCoin}
                    balance={coinBalance}
                    depositFormNumber={depositFormNumber}
                    onChange={onDepositChange}
                    onClick={onDepositSend}
                    isLoading={loadingDeposit}
                />
            }

            {
                withDrawModal &&
                <WithDrawModal
                    xCoin={xCoin}
                    title={t('withdraw')+' '+xCoin.toUpperCase()}
                    isOpen={withDrawModal}
                    onClose={onWithDrawClose}
                    xCoin={xCoin}
                    balance={stakeBalance}
                    withDrawFormNumber={withDrawFormNumber}
                    onChange={onWithDrawChange}
                    onClick={onWithDrawSend}
                    isLoading={loadingWithDraw}
                />
            }

            {
                harvestModal &&
                <HarvestModal
                    isOpen={harvestModal}
                    onClose={onHarvestClose}
                    balance={donyBalance}
                    receiveDonyAmt={receiveDonyAmt}
                    onClick={onHarvestSend}
                    isLoading={loadingHarvest}
                />
            }

            {
                harvestWithDrawModal &&
                <HarvestWithDrawModal
                    isOpen={harvestWithDrawModal}
                    onClose={onHarvestWithDrawClose}
                    stakeBalance={stakeBalance}
                    donyBalance={donyBalance}
                    xCoin={xCoin}
                    tokenName={window.$tokenName}
                    onClick={onHarvestWithDrawSend}
                    isLoading={loadingHarvestWithDraw}
                />
            }

        </Div>
    );
});