import React from 'react';
import {Button, Div, Flex, GridColumns, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";
import useWallet from '~/hooks/useWallet'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import {Skeleton} from 'antd'
import {withTranslation} from "react-i18next";
import {
    connectWalletModalState,
    depositIWERCModalState, withdrawIWERCModalState,
    depositBNBModalState, withdrawBNBModalState,
    depositAVAXModalState, withdrawAVAXModalState,
} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import properties from "~/properties";
import {BsArrowRightShort, BsArrowDownShort, BsArrowUpShort, BsBoxArrowInRight, BsBoxArrowInLeft} from 'react-icons/bs'
import {color} from "~/styledComponents/Properties";
const Content = styled(Div)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
`;



const IWTokenBigCard = ({
                          uniqueKey='',
                          img = '',
                          name = '',
                          ercTokenName,
                          balance,
                          explain,
                          childButton,
                          status,
                          loading,
                          type,
                          t
                      }) => {


    const contract = properties.contractList[uniqueKey]

    const {address} = useWallet()
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    //IWERC
    const [, setdepositIWERCState] = useRecoilState(depositIWERCModalState)
    const [, setWithdrawIWERCOpen] = useRecoilState(withdrawIWERCModalState)

    //BNB
    const [, setdepositBNBState] = useRecoilState(depositBNBModalState)
    const [, setWithdrawBNBOpen] = useRecoilState(withdrawBNBModalState)

    //AVAX
    const [, setdepositAVAXState] = useRecoilState(depositAVAXModalState)
    const [, setWithdrawAVAXOpen] = useRecoilState(withdrawAVAXModalState)

    const onDepositIWClick = () => {

        // if(properties.serverMode === 'production'){
        //     //임시로 준비중으로 막음
        //     window.$message.warning(t('preparing'))
        //     return
        // }

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }

        // alert("Temporarily Stoped Deposit.")
        // return ;

        console.log(ercTokenName)
        if(ercTokenName.toUpperCase() === "BNB"){
            setdepositBNBState({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            })
        }else if(ercTokenName.toUpperCase() === "AVAX"){
            setdepositAVAXState({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            })
        } else {
            setdepositIWERCState({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            })
        }
    }
    const onWithdrawIWClick = () => {

        //임시로 준비중으로 막음
        // window.$message.warning(t('preparing'))
        // return

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }

        // alert("Temporarily Stoped Withdraw.")
        // return ;

        if(ercTokenName.toUpperCase() === "BNB"){
            setWithdrawBNBOpen({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            });
        }else if(ercTokenName.toUpperCase() === "AVAX"){
            setWithdrawAVAXOpen({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            });
        } else {
            setWithdrawIWERCOpen({
                uniqueKey: uniqueKey,
                tokenName: name.toLowerCase(),
                isOpen: true
            });
        }
    }

    return (
        <Flex relative shadow={'lg'} rounded={4} bg={'white'} p={20} width={'100%'} justifyContent={'center'}>

            {
                loading ? <Skeleton active /> : (
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
                                                // rounded={20}
                                                bg={'white'}
                                                // fg={'white'}
                                                bc={'light'}
                                                fontSize={16}
                                                py={15}
                                                px={15}
                                                disabled ={!contract.enableSwap}
                                                onClick={onDepositIWClick}
                                            >
                                                <Flex flexDirection={'column'}>
                                                    <Div>{ercTokenName} ({ComUtil.ethGbNm(ercTokenName)})</Div>
                                                    <Flex mb={5}
                                                          // justifyContent={'center'} bg={'donnie'} rounded={'50%'} width={32} height={32}
                                                    >
                                                        <BsArrowDownShort size={40} color={color.info}/>
                                                    </Flex>
                                                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                                                        <Div bg={'info'} fg={'white'} py={5} px={12} rounded={5}>{ComUtil.coinName(name)} (IRC)</Div>
                                                    </Div>
                                                </Flex>
                                            </Button>
                                        </Flex>

                                        <Flex flexDirection={'column'}>
                                            <Div fontSize={16} fg={'gray'}>swap-out</Div>
                                            <Button
                                                block
                                                // rounded={20}
                                                bg={'white'}
                                                // fg={'white'}
                                                bc={'light'}

                                                fontSize={16}
                                                p={15}
                                                disabled ={!contract.enableSwap}
                                                onClick={onWithdrawIWClick}
                                            >
                                                <Flex flexDirection={'column'}>
                                                    <Div>{ComUtil.coinName(ercTokenName)} ({ComUtil.ethGbNm(ercTokenName)})</Div>
                                                    <Flex mb={5}
                                                          // justifyContent={'center'} bg={'donnie'} rounded={'50%'} width={32} height={32}
                                                    >
                                                        <BsArrowUpShort size={40} color={color.info}/>
                                                    </Flex>
                                                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                                                        <Div bg={'info'} fg={'white'} py={5} px={12} rounded={5}>{ComUtil.coinName(name)} (IRC)</Div>
                                                    </Div>
                                                </Flex>
                                            </Button>
                                        </Flex>
                                    </GridColumns>

                                    <Flex justifyContent={'center'}>
                                        <Div fontSize={19} bold mt={14} textAlign={'center'}>
                                                {
                                                `You have ${balance} ${ComUtil.coinName(name)} `
                                                }
                                        </Div>
                                        {/*<Div fontSize={16} ml={10} mt={7}> (stake ↓, swap-out ↑)</Div>*/}
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

export default withTranslation()(IWTokenBigCard);
