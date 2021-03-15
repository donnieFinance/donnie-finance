import React, {useState} from 'react';
import {Div, Flex, Button, Fixed} from "~/styledComponents/shared";
import styled from 'styled-components'
import Server from '~/properties'
import {getValue} from "~/styledComponents/Util";
import {myDonModalState, depositERCModalState, withdrawERCModalState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import {withTranslation} from "react-i18next";
import useWallet from "~/hooks/useWallet";
import {color} from "~/styledComponents/Properties";
const HoverContainer = styled(Div)`
    & > div:nth-child(2) {
        display: none;
    }
    & > div:nth-child(3) {
        display: none;
    }
    &:hover { 
        & > div {
            box-shadow: 2px 2px 8px rgba(0,0,0, 0.3);
        }
    
        & > div:nth-child(2) {
            display: flex;
        }
        & > div:nth-child(3) {
            display: flex;
        }
    }
`;
const RoundedButton = styled(Flex)`
    transition: 0.2s;
    border: 1px solid white;
    justify-content: center;
    &:hover {
        transform: scale(1.2);
    }
`;

const MyDon = ({t}) => {

    const [, setIsMyDonOpen] = useRecoilState(myDonModalState)
    const [, setDepositERCOpen] = useRecoilState(depositERCModalState)
    const [, setWithdrawERCOpen] = useRecoilState(withdrawERCModalState)
    const {address} = useWallet()

    const onMyDonClick = () => {
        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setIsMyDonOpen(true)
    }
    const onDepositERCClick = () => {

        // if(Server.serverMode === 'production'){
        //     //임시로 준비중으로 막음
        //     window.$message.warning(t('preparing'))
        //     return
        // }

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setDepositERCOpen(true)
    }
    const onWithdrawERCClick = () => {

        //임시로 준비중으로 막음
        // window.$message.warning(t('preparing'))
        // return

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setWithdrawERCOpen(true)
    }

    return (
        <Fixed m={20} right={0} zIndex={1}>
            <HoverContainer>
                <RoundedButton justifyContent={'center'} cursor={1} rounded={10}
                               bg={address ? 'donnie' : 'secondary'}
                               fg={'white'}
                               p={15}
                               fontSize={16}
                               onClick={onMyDonClick}
                >
                My DON
                </RoundedButton>
                <RoundedButton my={20}
                               justifyContent={'center'} cursor={1} rounded={10}
                               bg={address ? 'info' : 'secondary'}
                               fg={'white'}
                               p={15}
                               onClick={onDepositERCClick}
                >
                    <Div lineHeight={14}>
                        <Div fontSize={14} textAlign={'center'}>Swap</Div>
                        <Div fontSize={13} textAlign={'center'}>ERC to IRC</Div>
                    </Div>
                </RoundedButton>
                {/*<RoundedButton justifyContent={'center'} cursor={1} rounded={10}*/}
                {/*               bg={address ? 'info' : 'secondary'}*/}
                {/*               fg={'white'}*/}
                {/*               p={15}*/}
                {/*               width={70}*/}
                {/*               height={70}*/}
                {/*               onClick={onWithdrawERCClick}>*/}
                {/*    <Div lineHeight={14}>*/}
                {/*        <Div fontSize={13}>Withdraw</Div>*/}
                {/*        <Div fontSize={13} lighter textAlign={'center'}>ERC</Div>*/}
                {/*    </Div>*/}
                {/*</RoundedButton>*/}
            </HoverContainer>
        </Fixed>
    );
};

export default withTranslation()(MyDon);
