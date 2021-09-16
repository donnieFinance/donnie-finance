import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {connectWalletModalState, depositERCModalState, withdrawERCModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import iostIWalletIcon from '~/assets/wallet_IWallet.png'
import iostJetStreamIcon from '~/assets/wallet_Jetstream.jpg'
import walletTokenPocket from '~/assets/wallet_TokenPocket.png'
import iostWalletTokenPocket from '~/assets/icon_TokenPocket.png'
import Connected from '~/assets/icon_connect.svg'
import {useTranslation} from "react-i18next";
import WalletUtil from "~/util/WalletUtil";
import ComUtil from "~/util/ComUtil";
import tp from "tp-js-sdk";
import iostApi from "~/lib/iostApi";
import properties from "~/properties";
import coin_don from "~/assets/coin_don.png";

const ModalContent = () => {
    const {t} = useTranslation()
    const {address, hasIWallet, isLogin, connectIWallet, disconnectIWallet} = useWallet()
    const [balance, setBalance] = useState(0);
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const [, setDepositERCOpen] = useRecoilState(depositERCModalState)
    const [, setWithdrawERCOpen] = useRecoilState(withdrawERCModalState)

    useEffect(() => {
        loadBalance()
    }, [])

    const onConnect = (type) => {
        connectIWallet(type);
    }

    const loadBalance = async () => {
        if (hasIWallet() && isLogin()){
            const data = await iostApi.getTokenBalance({address:address, tokenName:properties.address.token});
            setBalance(data);
        }
    }

    const onDepositERCClick = () => {
        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setConnectWalletOpen(false)
        setDepositERCOpen(true)
    }

    const onWithdrawERCClick = () => {
        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setConnectWalletOpen(false)
        setWithdrawERCOpen(true)
    }

    const wallet = WalletUtil.getMyWallet()

    return (
        <Div minWidth={300}
             bg={'background'}
             px={20}>
            <Flex height={56} bold fg={'grayText'}>{t('connectWallet')}</Flex>
            <Div py={20}>
                {/* wallet map */}
                {
                    !tp.isConnected() && <>
                        {
                            ComUtil.isMobileDevices() ?
                                <>
                                    <Flex height={56} bg={'white'} px={15} shadow={'lg'} mb={20}>
                                        <Flex>
                                            <a href="https://www.tokenpocket.pro/" rel="external" target={'_blank'}>
                                                <Img src={walletTokenPocket} width={200} />
                                            </a>
                                        </Flex>
                                    </Flex>
                                </>
                                :
                                <>
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
                                </>
                        }
                    </>
                }

                {
                    (tp.isConnected() || properties.isTestMode) &&
                    <>
                        <Flex height={56} bg={'white'} px={15} shadow={'lg'} mb={20}>
                            <Flex>
                                <Img src={iostWalletTokenPocket} width={32} mr={10}/>
                                <Span>Token Pocket</Span>
                            </Flex>
                            <Right>
                                {
                                    (address && address.length > 0) && wallet.address && wallet.walletType == 'IWallet' ?
                                        <Img src={Connected} width={30} /> :
                                        <Button px={10} fg={'white'} bg={'primary'} onClick={onConnect.bind(this,'IWallet')}>{t('connect')}</Button>
                                }
                            </Right>
                        </Flex>
                        {
                            (address && address.length > 0) && wallet.address && wallet.walletType == 'IWallet' &&
                            <Div minWidth={260}>
                                <Div p={10} mb={10} textAlign={'center'} shadow={'md'}>
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
                                {/*<Div textAlign={'center'} mb={5}>*/}
                                {/*    <a href={"https://www.iostabc.com/account/" + address} rel="external" target={"_blank"}>{t('ViewonEtherscan')}</a>*/}
                                {/*</Div>*/}

                                    <Button
                                        bc={'primary'}
                                        block
                                        py={10}
                                        mb={10}
                                        fontSize={14}
                                        onClick={onDepositERCClick}
                                    >
                                        DON Swap from Coinone
                                    </Button>
                                    {/*<Button*/}
                                    {/*    bc={'primary'}*/}
                                    {/*    block*/}
                                    {/*    py={10}*/}
                                    {/*    fontSize={14}*/}
                                    {/*    onClick={onWithdrawERCClick}*/}
                                    {/*>*/}
                                    {/*    DON Swap to Coinone*/}
                                    {/*</Button>*/}

                            </Div>
                        }
                    </>
                }

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

