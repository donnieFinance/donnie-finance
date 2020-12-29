import React from 'react';
import {Button, Div, Flex, Img, Right, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {connectWalletModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useIWallet from "~/hooks/useIWallet";
import iostIcon from '~/assets/MetaMask.png'
import Connected from '~/assets/icon_connect.svg'
import {withTranslation} from "react-i18next";

const ConnectWalletModal = ({t}) => {

    const [connectWalletOpen, setConnectWalletOpen] = useRecoilState(connectWalletModalState)
    const {address, connectIWallet, disconnectIWallet} = useIWallet()


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
            <Div minWidth={300}
                 bg={'background'}
                 px={20}>
                <Flex height={56} bold fg={'grayText'}>{t('connectWallet')}</Flex>
                <Div py={20}>
                    {/* wallet map */}
                    <Flex height={56} bg={'white'} px={15} shadow={'lg'} mb={20}>
                        <Flex>
                            <Img src={iostIcon} width={32} mr={10}/>
                            <Span>Chrome iWallet</Span>
                        </Flex>
                        <Right>
                            {
                                (address && address.length > 0) ?
                                    <Img src={Connected} width={30} /> :
                                    <Button px={10} fg={'white'} bg={'primary'} onClick={connectIWallet}>{t('connect')}</Button>
                            }
                        </Right>
                    </Flex>

                    {
                        address ?
                        <Button
                            block textAlign={'center'} bc={'primary'} fg={'primary'} bg={'background'} py={15}
                            onClick={disconnectIWallet}
                        >{t('disconnected')}</Button> :
                            (
                                <Div textAlign={'center'}>
                                    <a href="https://chrome.google.com/webstore/detail/iwallet/kncchdigobghenbbaddojjnnaogfppfj?hl=ko" target={'_blank'}>
                                        Download & Install iWallet
                                    </a>
                                </Div>
                            )
                    }

                </Div>
            </Div>
        </Modal>
    );
};

export default withTranslation()(ConnectWalletModal);
