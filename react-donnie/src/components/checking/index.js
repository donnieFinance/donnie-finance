import React, {useEffect} from 'react';
import properties from "~/properties";
import {Button, Div, Flex, Right, GridColumns, XCenter} from "~/styledComponents/shared";
import {useHistory} from 'react-router-dom'
import {withTranslation} from "react-i18next";
import PageHeading from "~/components/common/layouts/PageHeading";
import useSize from "~/hooks/useSize";
import loadable from "@loadable/component";
import {useRecoilState} from "recoil";
import {
    myAddressSelector, disConnectSelector,
    checkingCoinListSelector,
    checkingStakeSelector,
    checkingStakeLeftTimeSelector, checkingCoinListLoadingState
} from '~/hooks/atomState'

import TimeCountDown from "~/components/common/layouts/TimeCountDown";
import EarnCoinCard from "~/components/common/layouts/EarnCoinCard";

import firstImg from '~/assets/first.png'
import secondImg from '~/assets/second.png'
import thirdImg from '~/assets/third.png'
import doubleEnImg from '~/assets/double_en.png'
import doubleKoImg from '~/assets/double_ko.png'
import ComUtil from "~/util/ComUtil";

const DepositBigCard = loadable(() => import('~/components/common/layouts/DepositBigCard'))
const DepositSmallCard = loadable(() => import('~/components/common/layouts/DepositSmallCard'))

export default withTranslation()((props) => {
    const {t} = props;
    const {contractList} = properties
    const contractAddress = properties.address.token;
    //const { checking } = coinList
    const history = useHistory()

    const {size, sizeValue} = useSize()

    const [address,] = useRecoilState(myAddressSelector);
    const [disConnect,] = useRecoilState(disConnectSelector);
    const [stake,] = useRecoilState(checkingStakeSelector);
    const [leftTime,] = useRecoilState(checkingStakeLeftTimeSelector);
    const [coinList,] = useRecoilState(checkingCoinListSelector);

    // Checking CoinList loading 여부
    const [loading,] = useRecoilState(checkingCoinListLoadingState)

    const {checking} = t('menu', {returnObjects: true})

    const onTokenScan = () => {
        window.open("https://www.iostabc.com/token/" + contractAddress)
    }

    const onGoTrade = (coinName) => {
        history.push(`/trade/${coinName}`)
    }

    return (
        <Div>
            <PageHeading
                title={checking.name}
                description={checking.desc}
            />


            <EarnCoinCard
                onTokenScan={onTokenScan}
                contractAddress={contractAddress}
                leftTime={leftTime}
            />


            <Flex justifyContent={'center'} my={sizeValue(50, 40, 40)}>
                {
                    size !== 'sm' ? (
                        <Flex flexWrap={'wrap'} justifyContent={'center'} maxWidth={928}>
                            {
                                coinList.map( (coin,i) => {
                                    const c = ComUtil.getCheckingAndSavingCoinInfo(coin, t)

                                    return (
                                        <DepositBigCard
                                            key={`depositBigCard${i}`}
                                            number={i+1}
                                            {...c}
                                            loading={loading}
                                            onClick={onGoTrade.bind(this, coin.name)}
                                        />)
                                })
                            }
                        </Flex>
                    ) : (
                        <GridColumns repeat={1} rowGap={22} width={'90%'}>
                            {
                                coinList.map( (coin,i) => {
                                    const c = ComUtil.getCheckingAndSavingCoinInfo(coin, t)

                                    return (
                                        <DepositSmallCard
                                            key={`depositBigCard${i}`}
                                            number={i+1}
                                            {...c}
                                            loading={loading}
                                            onClick={onGoTrade.bind(this, coin.name)}
                                        />)
                                })
                            }
                        </GridColumns>
                    )
                }
            </Flex>

            <XCenter mb={50+10}>
                {
                    stake.status === 1 ? <Div fontSize={sizeValue(20, null, 16)} fg={'primary'}>{t('StagePhase')}</Div>:null
                }
            </XCenter>


        </Div>
    );
});