import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {InputNumber, Modal, Space} from "antd";
import {depositAVAXModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {withTranslation, useTranslation} from "react-i18next";
import {getAvaxMinimumDeposit, allocateAvaxSwapAccount, updateLastCheckDayAvaxAccount} from "~/lib/swapApi";
import { QRCode } from "react-qr-svg";
import ComUtil from "~/util/ComUtil";
import {AiFillCopy} from 'react-icons/ai'
import {BsArrowRightShort, BsBoxArrowInDown} from 'react-icons/bs'
import properties from "~/properties";
import ImgAvax from "~/assets/coin_avax.png";

const DepositAVAXModalContent = () => {
    const {t} = useTranslation()
    const [depositAVAXState, setDepositAVAXState] = useRecoilState(depositAVAXModalState)
    const {address, hasIWallet, isLogin} = useWallet()
    const [bepAddress, setBepAddress] = useState("");
    const [bep20AddressConfirm, setBep20AddressConfirm] = useState(false);
    const [xMin, setXMin] = useState('');

    // myDonOpen 모달 오픈이 되었을 경우 잔액 가져오기 API 실행
    useEffect(() => {
        getBepAccount();
    }, [])

    const getBepAccount = async() => {

        const {tokenName, ircTokenName, ercTokenName} = properties.contractList[depositAVAXState.uniqueKey];

        // BNB BEP20 입금주소 QR
        let {data:bep20Account} = await allocateAvaxSwapAccount(address);
        console.log('bep20Account : ' + bep20Account);
        setBepAddress(bep20Account);
        updateLastCheckDay(bep20Account);

        let minCoin = ercTokenName;

        // 최소 입금 수량
        let {data:minAmt} = await getAvaxMinimumDeposit();
        setXMin(minAmt+' '+minCoin);
    }

    const updateLastCheckDay = async(bep20Address) => {
        updateLastCheckDayAvaxAccount(address, bep20Address);
    }

    const copyText = () => {
        const {addressCopyMsg,addressCopyFailMsg} = t('depositBNB', {returnObjects: true});
        ComUtil.copyTextToClipboard(bepAddress, addressCopyMsg, addressCopyFailMsg);
    }
    const {confirmMsgTitle2,confirmMsgTitle, addressTitle2, loginCheckMsg, addressCopy} = t('depositBNB', {returnObjects: true});
        // confirmMsgTitle:'{{x}} address can be changed, please check before deposit!',
        // confirmMsgTitle2:'Minimum deposit {{x}}, takes 30 minutes',
        // addressTitle2:'{{x}} address for deposit',
    const contract = depositAVAXState.uniqueKey && properties.contractList[depositAVAXState.uniqueKey];

    return (
        <Div minWidth={260}>
            {
                !bep20AddressConfirm ?
                    <Div p={24}>
                        <Div p={16} shadow={'md'} bc={'light'}>
                            <Flex justifyContent={'center'} mb={10}>
                                <Img width={60} src={ImgAvax} />
                            </Flex>
                            <Div textAlign={'center'} fg={'danger'}>
                                Are you sending AVAX(C-CHAIN) token?
                            </Div>
                            <Flex justifyContent='center' my={20} fontSize={16}>
                                <Button mr={10} bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => setDepositAVAXState({uniqueKey:'',tokenName:'',isOpen:false})}>
                                No
                                </Button>
                                <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => setBep20AddressConfirm(true)}>
                                Yes
                                </Button>
                            </Flex>
                        </Div>
                    </Div>
                    :
                    <>
                        <Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>
                            {t(confirmMsgTitle,{x:contract.ercTokenName + '(C-CHAIN)'})}<br/>
                            {t(confirmMsgTitle2,{x:xMin})}
                        </Div>
                        <Div p={24}>

                            <Div p={16} shadow={'md'} bc={'light'}>
                                <h3>
                                    {t(addressTitle2,{x: contract.ercTokenName + '(C-CHAIN)'})}
                                </h3>

                                <Div textAlign={'center'}>
                                    <Div my={16}>
                                        {bepAddress?
                                            <QRCode
                                                bgColor="#FFFFFF"
                                                fgColor="#000000"
                                                level="Q"
                                                style={{ width: 150 }}
                                                value={bepAddress}
                                            />
                                            : loginCheckMsg}
                                    </Div>

                                    <Div textAlign={'right'} mb={10}>
                                        <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={copyText}>
                                            <Flex>
                                                <AiFillCopy />
                                                <Div>{addressCopy}</Div>
                                            </Flex>
                                        </Button>
                                    </Div>
                                    <Div>
                                        {bepAddress}
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

const DepositAVAXModal = () => {

    const {t} = useTranslation()
    const [depositAVAXState, setDepositAVAXState] = useRecoilState(depositAVAXModalState)

    const getTitle = () => {
        if(depositAVAXState.uniqueKey) {
            const {tokenName, ircTokenName, ercTokenName} = properties.contractList[depositAVAXState.uniqueKey];
            return(
                <Flex>
                    <Img width={20} src={ImgAvax} />
                    <Flex pt={4}>{ercTokenName}(C-CHAIN)</Flex>
                    <Flex mx={2}><BsArrowRightShort /></Flex>
                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                        <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{`${ircTokenName}(IRC)`}</Flex>
                    </Div>
                </Flex>
            )
        }
        return 'Swap [BEP20 to IRC]'
    }

    return (
        <Modal
            title={ getTitle() }
            visible={depositAVAXState.isOpen}
            onCancel={() => setDepositAVAXState({uniqueKey:'',tokenName:'',isOpen:false})}
            footer={null}
            width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
        >
            <DepositAVAXModalContent />
        </Modal>
    );
};

export default DepositAVAXModal;
