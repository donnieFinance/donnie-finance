import React, {useEffect, useState} from 'react';
import useCoin from '~/hooks/useCoin'
import useRunningStatus from '~/hooks/useRunningStatus'
import ComUtil from "~/util/ComUtil";
import {withTranslation} from "react-i18next";
import loadable from '@loadable/component'
import {withRouter} from 'react-router-dom'
import iostApi from "~/lib/iostApi";
import useWallet from "~/hooks/useWallet";
import WalletUtil from "~/util/WalletUtil";
import axios from "axios";

const DepositBigCard = loadable(() => import('../common/layouts/DepositBigCard'))
const DepositSmallCard = loadable(() => import('~/components/common/layouts/DepositSmallCard'))


const Item = ({ uniqueKey, contract, t, history, size = 'big' }) => {
    const {pool, forcedStartTime, forcedEndTime, totalDon, isIwFlag } = contract

    const {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet} = useWallet()

    const [coin, refresh, setRefreshInterval] = useCoin(uniqueKey)
    const [status, startTime, endTime, duration] = useRunningStatus({
        pool: pool,
        //TODO 아래는 테스트를 쉽게 하기위한 프로퍼티 입니다. 배포 전 /properties.js 의 forcedStartTime, forcedEndTime 삭제 요망 [delete]
        forcedStartTime: forcedStartTime ? forcedStartTime : null,
        forcedEndTime: forcedEndTime ? forcedEndTime : null
    })

    const {name, img, mining, explain, total, usd, rate, buttonText, loading} = ComUtil.getCheckingAndSavingCoinInfo(coin, status, t)


    const [myStaked, setMyStaked] = useState(false)



    useEffect(() => {
        if(address)
            getAllBalance()
    }, [address])

    useEffect(() => {
        //진행중
        if (status === 1) {
            refresh()                          //코인정보 갱신
            setRefreshInterval(3000)    //3초마다 코인정보 interval
        }
        //종료
        else if ([0,2,3].includes(status)) {
            refresh()                          //코인정보 갱신
            setRefreshInterval(null)    //코인정보 interval 중단
        }
    }, [status])

    const onGoTrade = () => {
        history.push(`/trade/${uniqueKey}`)
    }

    const getAllBalance = async () => {

        try{

            if (!contract.tokenName)
                return


            const myWallet = WalletUtil.getMyWallet();
            if(hasIWallet()) {

                if (isLogin()) {

                    const result = await iostApi.getTradeBalanceAll(pool, address);

                    // console.log('===========iost-PeriodFinish:' + result[0], uniqueKey)

                    let userBalance = result[0];

                    if (userBalance === "null") {
                        userBalance = 0;
                    }
                    userBalance = parseFloat(userBalance);
                    if(userBalance > 0){
                        setMyStaked(true)
                        return
                    }


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
                            const iostHost = iost.currentRPC._provider._host;

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

//                console.log("rewardPerToken : ", rewardPerToken);
                            let donnieBalance = parseFloat((userBalance * 0.9).toFixed(4));
                            if (donnieBalance === NaN) {
                                donnieBalance = 0;
                            }

                            // console.log("donnieBalance : ", donnieBalance, uniqueKey);

                            if(donnieBalance > 0){
                                setMyStaked(true)
                                return
                            }
                        }
                    }
                }
            }

        }catch (error){
            console.log(error)
        }
    }

    if (size === 'big') {
        return (
            <DepositBigCard
                isIwFlag={isIwFlag}
                status={status}
                startTime={startTime}
                endTime={endTime}
                duration={duration}
                // stakeLeftTime={stakeLeftTime}
                // endTime={endTime}
                name={name}
                img={img}
                mining={mining}
                explain={explain}
                total={total}
                usd={usd}
                rate={rate}
                buttonText={buttonText}
                loading={loading}
                myStaked={myStaked}
                totalDon={totalDon}
                onDepositClick={onGoTrade}
            />
        )
    }else {
        return(
            <DepositSmallCard
                isIwFlag={isIwFlag}
                status={status}
                startTime={startTime}
                endTime={endTime}
                duration={duration}
                // openTime={openTime}
                // stakeLeftTime={stakeLeftTime}
                // endTime={endTime}
                name={name}
                img={img}
                mining={mining}
                explain={explain}
                total={total}
                usd={usd}
                rate={rate}
                buttonText={buttonText}
                loading={loading}
                myStaked={myStaked}
                totalDon={contract.totalDon}
                onDepositClick={onGoTrade}
            />
        )
    }

};

export default withTranslation()(withRouter(Item));