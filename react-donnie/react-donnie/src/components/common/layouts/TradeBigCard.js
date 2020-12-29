import React from 'react';
import {Button, Div, Flex, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";
import useIWallet from '~/hooks/useIWallet'
import useSize from "~/hooks/useSize";
import styled from "styled-components";
import {Spin} from 'antd'
import {withTranslation} from "react-i18next";
import {connectWalletModalState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";


const Content = styled(Div)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
`;

const TradeBigCard = ({
    img = '',
    name = '',
    balance,
    explain,
    childButton,
    loading,
    t
}) => {

    const {address} = useIWallet()
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const {sizeValue} = useSize()
    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    return (
        <RoundedCard relative shadow={'lg'} >
            <Flex bg={'light'} flexDirection={'column'} justifyContent={'center'} height={110}>
                <Div width={40}>
                    <Img src={img} alt={name}/>
                </Div>
                <Div fontSize={20} bold>{name}</Div>
            </Flex>
            <Flex p={15} bg={'white'} minHeight={140} flexDirection={'column'} justifyContent={'center'}>
                {
                    loading ? <Spin /> : (
                        <>
                            <Div mb={15} textAlign={'center'}>
                                {
                                    balance && <Content fontSize={14}>{balance}</Content>
                                }
                                {
                                    explain && <Content fontSize={14}>{explain}</Content>
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
