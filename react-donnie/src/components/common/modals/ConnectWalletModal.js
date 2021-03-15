import React from 'react';
import {Button, Div, Flex, Img, Right, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {connectWalletModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import iostIWalletIcon from '~/assets/wallet_IWallet.png'
import iostJetStreamIcon from '~/assets/wallet_Jetstream.jpg'
import Connected from '~/assets/icon_connect.svg'
import {withTranslation, useTranslation} from "react-i18next";
import WalletUtil from "~/util/WalletUtil";

const ModalContent = () => {
    const {t} = useTranslation()
    const {address, connectIWallet, disconnectIWallet} = useWallet()
    const onConnect = (type) => {
        connectIWallet(type);
    }

    const wallet = WalletUtil.getMyWallet()

    return (
        <Div minWidth={300}
             bg={'background'}
             px={20}>
            <Flex height={56} bold fg={'grayText'}>{t('connectWallet')}</Flex>
            <Div py={20}>
                {/* wallet map */}
                <Flex height={56} bg={'white'} px={15} shadow={'lg'} mb={20}>
                    <Flex>
                        <Img src={iostIWalletIcon} width={32} mr={10}/>
                        <Span>Chrome IWallet</Span>
                    </Flex>
                    <Right>
                        {
                            (address && address.length > 0) && wallet.address && wallet.walletType == 'IWallet' ?
                                <Img src={Connected} width={30} /> :
                                <Button px={10} fg={'white'} bg={'primary'} onClick={onConnect.bind(this,'IWallet')}>{t('connect')}</Button>
                        }
                    </Right>
                </Flex>
                <Flex height={56} bg={'white'} px={15} shadow={'lg'} mb={20}>
                    <Flex>
                        <Img src={iostJetStreamIcon} width={32} mr={10}/>
                        <Span>Chrome Jetstream</Span>
                    </Flex>
                    <Right>
                        {
                            (address && address.length > 0) && wallet.address && wallet.walletType == 'Jetstream' ?
                                <Img src={Connected} width={30} /> :
                                <Button px={10} fg={'white'} bg={'primary'} onClick={onConnect.bind(this,'Jetstream')}>{t('connect')}</Button>
                        }
                    </Right>
                </Flex>

                {
                    address &&
                    <Button
                        block textAlign={'center'} bc={'primary'} fg={'primary'} bg={'background'} py={15}
                        onClick={disconnectIWallet}
                    >{t('disconnected')}</Button>
                }

                <Div textAlign={'center'} mt={20}>
                    <a href={"https://chrome.google.com/webstore/detail/iwallet/kncchdigobghenbbaddojjnnaogfppfj?hl="+t("lang").toLowerCase()} target={'_blank'}>
                        Download & Install IWallet
                    </a> <br/>
                    <a href={"https://chrome.google.com/webstore/detail/jetstream/ijancdlmlahmfgcimhocmpibadokcdfc?hl="+t("lang").toLowerCase()} target={'_blank'}>
                        Download & Install JetStream
                    </a>
                </Div>
            </Div>
        </Div>
    )
}

const ConnectWalletModal = () => {
    const {t} = useTranslation()
    const [connectWalletOpen, setConnectWalletOpen] = useRecoilState(connectWalletModalState)

    return (
        <Modal
            // title={'Language'}
            visible={connectWalletOpen}
            onCancel={() => setConnectWalletOpen(false)}
            bodyStyle={{padding: 0}}
            footer={null}
            width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
        >
            <ModalContent />

        </Modal>
    );
};

export default ConnectWalletModal;
