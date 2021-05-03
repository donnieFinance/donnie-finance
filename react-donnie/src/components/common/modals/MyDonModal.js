import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Modal, Space} from "antd";
import {myDonModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import iostIcon from '~/assets/MetaMask.png'
import Connected from '~/assets/icon_connect.svg'
import {withTranslation, useTranslation} from "react-i18next";
import coin_don from '~/assets/coin_don.png'
import properties from "~/properties";
import axios from 'axios'
import iostApi from "~/lib/iostApi";

const ModalContent = () => {
    const {t} = useTranslation()
    const [, setMyDonOpen] = useRecoilState(myDonModalState)
    const {address, hasIWallet, isLogin, connectIWallet, disconnectIWallet} = useWallet()
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        loadBalance()
    }, [])


    const loadBalance = async () => {
        // console.log('loadBalance - hasIWallet:' + hasIWallet());
        // console.log('loadBalance - isLogin:' + isLogin());
        if (hasIWallet() && isLogin()){
            const data = await iostApi.getTokenBalance({address:address, tokenName:properties.address.token});
            console.log('loadBalance - data:' + data);
            setBalance(data);
        }
    }

    const onDisconnectClick = () => {
        disconnectIWallet()
        setMyDonOpen(false)
    }

    return(
        <Div minWidth={260}>
            <Div p={10} mb={10} textAlign={'center'} shadow={'md'} bc={'light'}>
                {address}
            </Div>

            <Div textAlign={'center'} my={20}>
                <img src={coin_don} alt={'don'} width={56}/>
                <Div fontSize={20} fg={'dark'}>
                    {window.$tokenName}
                </Div>
                <Div textAlign={'center'} fontSize={25} bold>
                    {balance}
                </Div>
            </Div>


            <GridColumns repeat={1} colGap={10}>
                <Button bg='white'
                        bc={'primary'}
                        // py={15}
                        // px={6}
                        block
                        onClick={() => window.open("https://www.iostabc.com/account/" + address)}
                >
                    {t('ViewonEtherscan')}
                </Button>
                {/*<Button bg='white'*/}
                {/*        bc={'primary'}*/}
                {/*        py={15}*/}
                {/*        px={6}*/}
                {/*        onClick={onDisconnectClick}*/}
                {/*>{t('disconnected')}</Button>*/}
            </GridColumns>
        </Div>
    )

}

const MyDonModal = () => {

    const {t} = useTranslation()
    const [myDonOpen, setMyDonOpen] = useRecoilState(myDonModalState)

    return (
        <>
            <Modal
                title={t('MyDONY')}
                visible={myDonOpen}
                onCancel={() => setMyDonOpen(false)}
                footer={null}
                width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
                destroyOnClose={true}
            >
                <ModalContent />
            </Modal>

        </>
    );
};

export default MyDonModal;
