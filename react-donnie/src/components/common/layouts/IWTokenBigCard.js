import React from 'react';
import {Button, Div, Flex, GridColumns, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";
import useWallet from '~/hooks/useWallet'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import {Skeleton} from 'antd'
import {withTranslation} from "react-i18next";
import {connectWalletModalState, depositIWERCModalState, withdrawIWERCModalState} from "~/hooks/atomState";
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

    const [, setdepositIWERCState] = useRecoilState(depositIWERCModalState)
    const onDepositBlyERCClick = () => {

        // if(properties.serverMode === 'production'){
        //     //임시로 준비중으로 막음
        //     window.$message.warning(t('preparing'))
        //     return
        // }

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setdepositIWERCState({
            uniqueKey:uniqueKey,
            tokenName:name.toLowerCase(),
            isOpen:true
        })
    }

    const [, setWithdrawIWERCOpen] = useRecoilState(withdrawIWERCModalState)
    const onWithdrawERCClick = () => {

        //임시로 준비중으로 막음
        // window.$message.warning(t('preparing'))
        // return

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setWithdrawIWERCOpen({
            uniqueKey:uniqueKey,
            tokenName:name.toLowerCase(),
            isOpen:true
        })
    }

    return (
        <Flex relative shadow={'lg'} rounded={4} bg={'white'} p={20} width={'100%'} justifyContent={'center'}>

            {
                loading ? <Skeleton /> : (
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
                                    <Div fontSize={19} bold mb={10} textAlign={'center'}>
                                        {
                                            `You have ${balance} ${ComUtil.coinName(name)}`
                                        }
                                    </Div>
                                    <GridColumns repeat={2} colGap={10}>
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
                                            onClick={onDepositBlyERCClick}
                                        >
                                            <Flex flexDirection={'column'}>
                                                <Div>{ercTokenName} (ERC)</Div>
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
                                        <Button
                                            block
                                            // rounded={20}
                                            bg={'white'}
                                            // fg={'white'}
                                            bc={'light'}

                                            fontSize={16}
                                            p={15}
                                            disabled ={!contract.enableSwap}
                                            onClick={onWithdrawERCClick}
                                        >
                                            <Flex flexDirection={'column'}>
                                                <Div>{ComUtil.coinName(ercTokenName)} (ERC)</Div>
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
                                    </GridColumns>
                                </Div>
                            )
                        }
                    </>
                )
            }
        </Flex>
    );


    return(
        <RoundedCard relative shadow={'lg'} >
            <Flex bg={'light'} flexDirection={'column'} justifyContent={'center'} height={110}>
                <Div width={40}>
                    {/*<Img src={img} alt={name}/>*/}
                </Div>
                <Div fontSize={20} bold>
                    {/*{name}*/}
                    My {ComUtil.coinName(name)}
                </Div>
                <Div textAlign={'center'}>
                    {
                        balance && <Content fontSize={16}>{balance}</Content>
                    }
                </Div>
            </Flex>
            <Flex p={15} bg={'white'} minHeight={140} flexDirection={'column'} justifyContent={'center'} relative>
                {
                    loading ? <Skeleton /> : (
                        <>
                            <Content>
                                {
                                    !address && <Button
                                        bg={'primary'} fg={'white'}
                                        fontSize={14} px={15}
                                        onClick={changeConnectWallet}>
                                        {t('connectWallet')}
                                    </Button>
                                }

                                {
                                    address ? <>
                                        <Div mt={2}>
                                            <Button
                                                bg={'primary'} fg={'white'}
                                                fontSize={14} px={15}
                                                disabled ={
                                                    (![1].includes(status)) ? true : false //종료시 disable 20200107
                                                }
                                                onClick={onDepositBlyERCClick}
                                            >
                                                SWAP <br/>
                                                BLY(ERC) to {ComUtil.coinName(name)}(IRC)
                                            </Button>
                                        </Div>
                                        <Div mt={2}>
                                            <Button
                                                bg={'primary'} fg={'white'}
                                                fontSize={14} px={15}
                                                disabled ={
                                                    (![1].includes(status)) ? true : false //종료시 disable 20200107
                                                }
                                                onClick={onWithdrawERCClick}
                                            >
                                                SWAP <br/>
                                                {ComUtil.coinName(name)}(IRC) to BLY(ERC)
                                            </Button>
                                        </Div>
                                    </> : null
                                }
                            </Content>

                        </>

                    )
                }

            </Flex>
        </RoundedCard>
    )
};

export default withTranslation()(IWTokenBigCard);
