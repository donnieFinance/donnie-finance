import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {InputNumber, Modal, Space} from "antd";
import {depositERCModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {withTranslation, useTranslation} from "react-i18next";
import {getSwapErcAccount, updateLastCheckDayErcAccount} from "~/lib/swapApi";
import { QRCode } from "react-qr-svg";
import ComUtil from "~/util/ComUtil";
import {AiFillCopy} from 'react-icons/ai'
import {BsBoxArrowInDown} from 'react-icons/bs'
import properties from '~/properties'

const ModalContent = () => {
    const {t} = useTranslation()
    const {address, hasIWallet, isLogin} = useWallet()
    const [ercAddress, setErcAddress] = useState("");
    const [ercAddressConfirm, setErcAddressConfirm] = useState(false);
    const [isOpen, setIsOpen] = useRecoilState(depositERCModalState)

    // myDonOpen 모달 오픈이 되었을 경우 잔액 가져오기 API 실행
    useEffect(() => {
        getErcAccount();
    }, [])

    const getErcAccount = async() => {
        let {data:ercAccount} = await getSwapErcAccount(address);
        console.log('ercAccount : ' + ercAccount);
        setErcAddress(ercAccount);
        updateLastCheckDay(ercAccount);
    }

    const updateLastCheckDay = async(ercAddress) => {
        updateLastCheckDayErcAccount(address, ercAddress);
    }

    const copyText = () => {
        const {addressCopyMsg,addressCopyFailMsg} = t('depositErc', {returnObjects: true});
        ComUtil.copyTextToClipboard(ercAddress, addressCopyMsg, addressCopyFailMsg);
    }

    return (
        <Div minWidth={260}>
            {
                !ercAddressConfirm ?
                    <Div p={24}>
                        <Div p={16} shadow={'md'} bc={'light'}>
                            <Flex justifyContent={'center'} mb={10}>
                                <Img width={60} src={properties.tokenImages.don} />
                            </Flex>
                            <Div textAlign={'center'} fg={'danger'}>
                                {t('depositErc', {returnObjects: true}).confirmMsgTitle3}
                            </Div>
                            <Flex justifyContent='center' my={20} fontSize={16}>
                                <Button mr={10} bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => setIsOpen(false)}>
                                    No
                                </Button>
                                <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => setErcAddressConfirm(true)}>
                                    Yes
                                </Button>
                            </Flex>
                        </Div>
                    </Div>
                    :
                    <>
                    <Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>
                        {t('depositErc', {returnObjects: true}).confirmMsgTitle}<br/>
                        {t('depositErc', {returnObjects: true}).confirmMsgTitle2}<br/>
                    </Div>
                    <Div p={24}>

                        <Div p={16} shadow={'md'} bc={'light'}>
                            <h3>{t('depositErc', {returnObjects: true}).addressTitle}</h3>

                            <Div textAlign={'center'}>
                                <Div my={16}>
                                    {ercAddress?
                                        <QRCode
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                            level="Q"
                                            style={{ width: 150 }}
                                            value={ercAddress}
                                        />
                                        : t('depositErc', {returnObjects: true}).loginCheckMsg}
                                </Div>

                                <Div textAlign={'right'} mb={10}>
                                    <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={copyText}>
                                        <Flex>
                                            <AiFillCopy />
                                            <Div>{t('depositErc', {returnObjects: true}).addressCopy}</Div>
                                        </Flex>
                                    </Button>
                                </Div>
                                <Div>
                                    {ercAddress}
                                </Div>
                            </Div>

                        </Div>

                        <Flex justifyContent='center' my={20} fontSize={16}>
                            <BsBoxArrowInDown fontSize={23}/>
                        </Flex>

                        <Div p={16} shadow={'md'} bc={'light'}>
                            <h3>IOST account</h3>
                            <Div textAlign={'center'}>
                                <h2>{address}</h2>
                            </Div>
                        </Div>
                    </Div>
                    </>
            }
        </Div>
    )

}

const DepositERCModal = () => {

    const {t} = useTranslation()
    const [isOpen, setIsOpen] = useRecoilState(depositERCModalState)

    return (
        <Modal
            title={
                <Flex>
                    <Img width={20} src={properties.tokenImages.don} />
                    <Div pt={3} ml={5}>
                        <Flex>Swap (ERC to IRC)</Flex>
                    </Div>
                </Flex>
            }
            visible={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={null}
            width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
        >
            <ModalContent />
        </Modal>
    );
};

export default DepositERCModal;
