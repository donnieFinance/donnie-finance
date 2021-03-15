import React from 'react';
import {Button, Div, Flex, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";
import useWallet from '~/hooks/useWallet'
import useSize from "~/hooks/useSize";
import styled from "styled-components";
import {Skeleton} from 'antd'
import {withTranslation} from "react-i18next";
import {connectWalletModalState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import ComUtil from "~/util/ComUtil";
import {HexEdge} from "~/styledComponents/shared/Shapes";


const Content = styled(Div)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
`;

const TradeBigCard = ({
                          isIwFlag,
                          img = '',
                          name = '',
                          balance,
                          explain,
                          childButton,
                          loading,
                          type,
                          t
                      }) => {


    const {address} = useWallet()
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    return (
        <RoundedCard relative shadow={'lg'} >
            <Flex bg={'light'} flexDirection={'column'} justifyContent={'center'} height={140}>
                {
                    isIwFlag ? (
                        <HexEdge width={60} height={60}>
                            <Img src={img} width={32} height={32} alt={name}/>
                        </HexEdge>
                    ) : (
                        <Img src={img} width={50} alt={name}/>
                    )
                }

                <Div fontSize={20} mt={8} bold>{ComUtil.coinName(name)}</Div>
            </Flex>
            <Flex p={15} bg={'white'} minHeight={140} flexDirection={'column'} justifyContent={'center'} relative>
                {
                    loading ? <Skeleton /> : (
                        <>

                            {
                                explain &&
                                <Div absolute top={-31/2} bg={'white'}
                                     bc={type === 'harvest' ? 'danger' : 'info'}
                                     fg={type === 'harvest' ? 'danger' : 'info'}
                                     fw={500} rounded={12} px={10} py={4} xCenter>
                                    <Content fontSize={14}>
                                        {explain.toString()}
                                    </Content>
                                </Div>
                            }

                            <Div mb={15} textAlign={'center'}>
                                {
                                    balance && <Content fontSize={16}>{balance}</Content>
                                }

                            </Div>
                            <Content>
                                {
                                    address ? childButton: <Button
                                        bg={'primary'} fg={'white'}
                                        fontSize={14} px={15}
                                        onClick={changeConnectWallet}>
                                        {t('connectWallet')}
                                    </Button>
                                }
                            </Content>

                        </>

                    )
                }

            </Flex>
        </RoundedCard>
    );
};

export default withTranslation()(TradeBigCard);
