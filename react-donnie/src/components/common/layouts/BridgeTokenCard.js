import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";
import useWallet from '~/hooks/useWallet'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import {Skeleton} from 'antd'
import {withTranslation} from "react-i18next";
import {
    connectWalletModalState, bridgeDepositModalState, bridgeWithdrawModalState
} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import properties from "~/properties";
import {BsArrowRightShort, BsArrowDownShort, BsArrowUpShort, BsBoxArrowInRight, BsBoxArrowInLeft} from 'react-icons/bs'
import {color} from "~/styledComponents/Properties";
import iostApi from "~/lib/iostApi";
import BigNumber from "bignumber.js";
import useInterval from "~/hooks/useInterval";
const Content = styled(Div)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
`;

/*
*
* ercTokenName = BNB
*
* */
const BridgeTokenCard = ({
                          name = '',
                          ircTokenName,
                          ercTokenName,
                          loading,
                          t
                      }) => {

    const {address} = useWallet()
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    const [intervalTime, setIntervalTime] = useState(null)

    const [, setDepositState] = useRecoilState(bridgeDepositModalState)
    const [, setWithdrawOpen] = useRecoilState(bridgeWithdrawModalState)

    const [tokenBalance,setTokenBalance] = useState();

    //로그인 시 5초마다 밸런스 갱신
    //로그아웃 시 갱신 종료
    useEffect(() => {
        getIwTokenBalance()

        if (address) {
            setIntervalTime(5000)
        }else {
            setIntervalTime(null)
        }
    }, [address])

    useInterval(() => {
        getIwTokenBalance()
    }, intervalTime)

    const onDepositIWClick = () => {
        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setDepositState({
            tokenName: name.toLowerCase(),
            ircTokenName:ircTokenName,
            ercTokenName:ercTokenName,
            isOpen: true
        })
    }
    const onWithdrawIWClick = () => {
        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setWithdrawOpen({
            tokenName: name.toLowerCase(),
            ircTokenName:ircTokenName,
            ercTokenName:ercTokenName,
            isOpen: true
        });
    }

    const getIwTokenBalance = async() => {

        if (!address)
            return

        let vIwTokenBalance = await iostApi.getTokenBalance({address: address, tokenName:name})
        //console.log({address, name, vIwTokenBalance})

        //iw 일 경우 destroy amount
        if (ercTokenName && ercTokenName.toUpperCase() === 'BLY') {
            vIwTokenBalance = new BigNumber(vIwTokenBalance).minus(ComUtil.getDestroyBlyAmount(address)).toNumber()
        }
        else if (ercTokenName && ercTokenName.toUpperCase() === 'WBTC') {
            vIwTokenBalance = new BigNumber(vIwTokenBalance).minus(ComUtil.getDestroyBtcAmount(address)).toNumber()
        }

        setTokenBalance(vIwTokenBalance)
    }

    return (
        <Flex relative shadow={'lg'} rounded={4} bg={'white'} p={20} width={'100%'} justifyContent={'center'}>

            {
                loading ? <Skeleton active/> : (
                    <>
                        {
                            !address ? (
                                <Button
                                    bg={'primary'} fg={'white'}
                                    fontSize={14} px={15}
                                    onClick={changeConnectWallet}>
                                    {t('connectWallet')}
                                </Button>
                            ) : (
                                <Div flexGrow={1}>

                                    <GridColumns repeat={2} colGap={10}>
                                        <Flex flexDirection={'column'}>
                                            <Div fontSize={16} fg={'gray'}>swap-in</Div>
                                            <Button
                                                block
                                                bg={'white'}
                                                bc={'light'}
                                                fontSize={16}
                                                py={15}
                                                px={15}
                                                onClick={onDepositIWClick}
                                            >
                                                <Flex flexDirection={'column'}>
                                                    <Div>{ercTokenName} ({ComUtil.ethGbNm(ercTokenName)})</Div>
                                                    <Flex mb={5}>
                                                        <BsArrowDownShort size={40} color={color.info}/>
                                                    </Flex>
                                                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                                                        <Div bg={'info'} fg={'white'} py={5} px={12} rounded={5}>{ircTokenName} (IRC)</Div>
                                                    </Div>
                                                </Flex>
                                            </Button>
                                        </Flex>

                                        <Flex flexDirection={'column'}>
                                            <Div fontSize={16} fg={'gray'}>swap-out</Div>
                                            <Button
                                                block
                                                bg={'white'}
                                                bc={'light'}
                                                fontSize={16}
                                                p={15}
                                                onClick={onWithdrawIWClick}
                                            >
                                                <Flex flexDirection={'column'}>
                                                    <Div>{ComUtil.coinName(ercTokenName)} ({ComUtil.ethGbNm(ercTokenName)})</Div>
                                                    <Flex mb={5}>
                                                        <BsArrowUpShort size={40} color={color.info}/>
                                                    </Flex>
                                                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                                                        <Div bg={'info'} fg={'white'} py={5} px={12} rounded={5}>{ircTokenName} (IRC)</Div>
                                                    </Div>
                                                </Flex>
                                            </Button>
                                        </Flex>
                                    </GridColumns>

                                    <Flex justifyContent={'center'}>
                                        <Div fontSize={19} bold mt={14} textAlign={'center'}>
                                                {
                                                `You have ${tokenBalance} ${ircTokenName} `
                                                }
                                        </Div>
                                    </Flex>
                                </Div>
                            )
                        }
                    </>
                )
            }
        </Flex>
    );
};

export default withTranslation()(BridgeTokenCard);
