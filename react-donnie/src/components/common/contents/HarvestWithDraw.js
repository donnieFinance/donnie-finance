import React, {useState, useEffect} from 'react';
import {Button, Space, InputNumber} from 'antd';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {useTranslation} from "react-i18next";
import IostApi from "~/lib/iostApi";
import properties from "~/properties";
import {useRecoilState} from "recoil";
import ComUtil from "~/util/ComUtil";
import WalletUtil from "~/util/WalletUtil";
import axios from "axios";
import iostApi from "~/lib/iostApi";
import useWallet from "~/hooks/useWallet";
import useInterval from "~/hooks/useInterval";
import useCoin from '~/hooks/useCoin'

const {contractList, oldAddress} = properties;

const HarvestWithDraw = ({
                             uniqueKey,
                             pool,
                             onClose,
                             donyBalance,
                             stakeBalance
                         }) => {

    const contract = contractList[uniqueKey]
    const [coin] = useCoin(uniqueKey)

    const {t} = useTranslation()

    const tMessage = t('message', {returnObjects: true})
    const {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet} = useWallet()
    const [decimals,setDecimals] = useState(0);

    // const [donyBalance,setDonyBalance] = useState('...');
    // const [coinBalance,setCoinBalance] = useState('...');
    // const [stakeBalance,setStakeBalance] = useState('...');
    const [sending, setSending] = useState(false)

    // useEffect(() => {
    //     getBalance()
    // }, [])

    // useInterval(() => getBalance(), 1000)

    // const getBalance = async () => {
    //     const v_decimals = coin.decimals //coinList.find(e => (e.name === name)).decimals;
    //
    //     if (v_decimals) {
    //         setDecimals(eval(`1e${v_decimals}`));
    //
    //
    //         const myWallet = WalletUtil.getMyWallet();
    //
    //         if(hasIWallet()) {
    //             if (isLogin()) {
    //
    //                 const result = await iostApi.getTradeBalanceAll(pool, address);
    //
    //                 let userBalance = result[0];
    //
    //                 if (userBalance === "null") {
    //                     userBalance = 0;
    //                 }
    //
    //                 userBalance = parseFloat(userBalance);
    //                 setStakeBalance(userBalance);
    //
    //                 let rewardPerToken = parseFloat(result[1]);
    //                 let totalSupply = parseFloat(result[2]);
    //                 let rewardRate = parseFloat(result[3]);
    //                 let periodFinish = parseFloat(result[4]);
    //                 let lastUpdate = parseFloat(result[5]);
    //                 let userRewardPerTokenPaid = result[6];
    //                 if (userRewardPerTokenPaid === "null") {
    //                     userRewardPerTokenPaid = 0;
    //                 }
    //                 userRewardPerTokenPaid = parseFloat(userRewardPerTokenPaid);
    //
    //                 let userReward = result[7];
    //                 if (userReward === "null") {
    //                     userReward = 0;
    //                 }
    //                 userReward = parseFloat(userReward);
    //
    //                 let lastTimeRewardApplicable = periodFinish;  // block.time 가져와서 비교하기
    //
    //                 const iost = myWallet.wallet.newIOST(window.IOST);
    //                 const iostHost = iost.currentRPC._provider._host;
    //
    //                 axios.get(iostHost + "/getNodeInfo").then((data) => {
    //                     let serverTime = parseFloat((data.data.server_time / (10 ** 9)).toFixed(0));
    //
    //                     // console.log('!!!! server_time : ', serverTime);
    //                     // console.log(periodFinish);
    //
    //                     if (periodFinish >= serverTime) {
    //                         lastTimeRewardApplicable = serverTime;
    //                     }
    //
    //                     // console.log({
    //                     //     lastTimeRewardApplicable,
    //                     //     lastUpdate,
    //                     //     rewardRate,
    //                     //     totalSupply,
    //                     //     rewardPerToken,
    //                     //     userReward,
    //                     //     userRewardPerTokenPaid
    //                     // })
    //
    //                     let addingReward = 0;
    //                     if (totalSupply > 0) {
    //                         addingReward = (lastTimeRewardApplicable - lastUpdate) * rewardRate / totalSupply;
    //                     }
    //
    //                     rewardPerToken = rewardPerToken + addingReward;
    //                     userBalance = userBalance * (rewardPerToken - userRewardPerTokenPaid) + userReward;
    //                     setDonyBalance(parseFloat(userBalance.toFixed(4)));
    //
    //                 }).catch(err => {
    //                     console.log(err);
    //                 });
    //
    //
    //                 if(address != null) {
    //                     if(address != '') {
    //                         const data = await iostApi.getTokenBalance({address:address, tokenName: contract.tokenName});
    //                         setCoinBalance(data);
    //                     }
    //                 }
    //
    //             }
    //         }
    //
    //
    //     }
    // }

    const onHarvestWithDrawSend = async() => {
        try {

            //내 DON 원금, 채굴된 DON 이 없으면 막기
            if (!stakeBalance && !donyBalance){
                window.$message.info(t('insufficientBalance'))
                return
            }

            setSending(true);

            if(!stakeBalance) {
                let contractID = contract.pool
                let gasLimit = 200000;  // gasLimit를 늘려줌

                const {result, isSuccess} = await IostApi.onHarvestSendBC(gasLimit, contractID);
                console.log({isSuccess: isSuccess, result:result});
                if (isSuccess) {
                    window.$message.success('Success');
                    onClose();
                } else {
                    let errorMessage = `${tMessage.failedToSend}`;
                    if (typeof result === 'string') {
                        if (result.indexOf('{') > -1) {
                            let error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                            if (error.code === 2) {
                                let vFailedToSend = `${tMessage.lackOfIgas} ${gasLimit} \n${tMessage.chargeIgasTime}`;
                                if (error.message) {
                                    vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                                }
                                errorMessage = vFailedToSend
                            } else {
                                errorMessage = result
                            }
                        }
                    } else if(typeof result === 'object') {
                        if(result.status_code === 'BALANCE_NOT_ENOUGH') {
                            errorMessage = `${tMessage.lackOfIram}`;
                        }else{
                            errorMessage = `${tMessage.jetstreamFail}`;
                        }
                    }
                    alert(errorMessage);
                }

            } else {

                let gasLimit = 300000;  // gasLimit를 늘려줌Z
                const {result, isSuccess} = await IostApi.onHarvestWithDrawSendBC(gasLimit, pool);
                console.log({isSuccess: isSuccess, result: result});

                if (isSuccess) {
                    window.$message.success('Success');
                    onClose()
                } else {
                    let errorMessage = `${tMessage.failedToSend}`;
                    if (typeof result === 'string') {
                        if (result.indexOf('{') > -1) {
                            let error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                            if (error.code === 2) {
                                let vFailedToSend = `${tMessage.lackOfIgas} ${gasLimit} \n${tMessage.chargeIgasTime}`;
                                if (error.message) {
                                    vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                                }
                                errorMessage = vFailedToSend
                            } else {
                                errorMessage = result
                            }
                        }
                    } else if (typeof result === 'object') {
                        if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                            errorMessage = `${tMessage.lackOfIram}`
                        }else{
                            errorMessage = `${tMessage.jetstreamFail}`;
                        }
                    }
                    alert(errorMessage);
                }
            }

            setSending(false);

        } catch(err){
            setSending(false);
            console.error(err.message);
        }
    }

    return(
        <Div minWidth={300}
            // bg={'background'}
            // px={20}
        >
            <Div fontSize={20}>
                <Flex bold>
                    <Div width={'50%'} textAlign={'right'}>{donyBalance}</Div>
                    <Div pl={10} width={'50%'}>{window.$tokenName.toUpperCase()}</Div>
                </Flex>
                <Flex bold>
                    <Div width={'50%'} textAlign={'right'}>{stakeBalance}</Div>
                    <Div pl={10} width={'50%'} >{ComUtil.coinName(contract.tokenName.toUpperCase())}</Div>
                </Flex>
            </Div>

            {/*<Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>*/}
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button onClick={onClose}>{t('cancel')}</Button>
                    <Button type="primary" loading={sending} onClick={onHarvestWithDrawSend}>{t('HarvestWithdraw')}</Button>
                </Space>
            </Flex>
        </Div>
    )
}

// const HarvestWithDrawModal = ({
//                                   isOpen, onClose, onClick, isLoading,
//                                   stakeBalance, donyBalance, xCoin, tokenName,
//                                   t
//                               }) => {
//
//     const [errorMsg, setErrorMsg] = useState('')
//
//     // const onSend = () => {
//     //
//     //     //내 DON 원금, 채굴된 DON 이 없으면 막기
//     //     if (stakeBalance === 0 || donyBalance === 0){
//     //         window.$message.info('잔액이 없습니다.')
//     //         return
//     //     }
//     //     onClick()
//     // }
//
//     return (
//         <Modal
//             title={`${t('HarvestWithdraw')}${xCoin.toUpperCase()}`}
//             visible={isOpen}
//             onCancel={onClose}
//             // bodyStyle={{padding: 0}}
//             footer={null}
//             width={'auto'}
//             centered={true}
//             focusTriggerAfterClose={false}
//             getContainer={false}
//             maskClosable={false}
//         >
//             <ModalContent
//
//             />
//         </Modal>
//     );
// };

export default HarvestWithDraw
