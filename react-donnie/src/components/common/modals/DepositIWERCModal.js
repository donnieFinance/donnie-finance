import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {InputNumber, Modal, Space} from "antd";
import {depositIWERCModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {withTranslation, useTranslation} from "react-i18next";
import {getIwMinimumDeposit, getIwSwapErcAccount, updateIwLastCheckDayErcAccount} from "~/lib/swapApi";
import { QRCode } from "react-qr-svg";
import ComUtil from "~/util/ComUtil";
import {AiFillCopy} from 'react-icons/ai'
import {BsArrowRightShort, BsBoxArrowInDown} from 'react-icons/bs'
import properties from "~/properties";

const ModalContent = () => {
    const {t} = useTranslation()
    const [depositIWERCState, setDepositIWERCState] = useRecoilState(depositIWERCModalState)
    const {address, hasIWallet, isLogin} = useWallet()
    const [ercAddress, setErcAddress] = useState("");
    const [xMin, setXMin] = useState('');

    // myDonOpen 모달 오픈이 되었을 경우 잔액 가져오기 API 실행
    useEffect(() => {
        getErcAccount();
    }, [])

    const getErcAccount = async() => {

        const {tokenName, ircTokenName, ercTokenName} = properties.contractList[depositIWERCState.uniqueKey];

        let {data:ercAccount} = await getIwSwapErcAccount(address,tokenName);
        console.log('ercAccount : ' + ercAccount);
        setErcAddress(ercAccount);
        updateLastCheckDay(ercAccount);

        let minCoin = ercTokenName;

        // 최소 입금 수량
        let {data:minAmt} = await getIwMinimumDeposit(tokenName);
        setXMin(minAmt+' '+minCoin);
    }

    const updateLastCheckDay = async(ercAddress) => {
        const v_TokenName = depositIWERCState.tokenName.toLowerCase();
        updateIwLastCheckDayErcAccount(address, ercAddress,v_TokenName);
    }

    const copyText = () => {
        const {addressCopyMsg,addressCopyFailMsg} = t('depositIWErc', {returnObjects: true});
        ComUtil.copyTextToClipboard(ercAddress, addressCopyMsg, addressCopyFailMsg);
    }
    const {confirmMsgTitle2,confirmMsgTitle, addressTitle, addressTitle2, loginCheckMsg,addressCopy} = t('depositIWErc', {returnObjects: true});
    const contract = depositIWERCState.uniqueKey && properties.contractList[depositIWERCState.uniqueKey];

    return (
        <Div minWidth={260}>
            <Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>
                {/*{confirmMsgTitle}<br/>*/}
                {t(confirmMsgTitle,{x:contract.ercTokenName})}<br/>
                {t(confirmMsgTitle2,{x:xMin})}
            </Div>
            <Div p={24}>

                <Div p={16} shadow={'md'} bc={'light'}>
                    <h3>
                        {t(addressTitle2,{x: contract.ercTokenName})}
                    </h3>

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

        </Div>
    )

}

const DepositIWERCModal = () => {

    const {t} = useTranslation()
    const [depositIWERCState, setDepositIWERCState] = useRecoilState(depositIWERCModalState)

    const getTitle = () => {
        if(depositIWERCState.uniqueKey) {
            const {tokenName, ircTokenName, ercTokenName} = properties.contractList[depositIWERCState.uniqueKey];
            return(
                <Flex>
                    <Flex pt={4}>{ercTokenName}(ERC)</Flex>
                    <Flex mx={10}><BsArrowRightShort /></Flex>
                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                        <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{`${ircTokenName}(IRC)`}</Flex>
                    </Div>
                </Flex>
            )
            // return ercTokenName+' Swap [ERC to '+ircTokenName+'(IRC)]';
        }
        return 'Swap [ERC to IRC]'
    }

    return (
        <Modal
            title={ getTitle() }
            visible={depositIWERCState.isOpen}
            onCancel={() => setDepositIWERCState({uniqueKey:'',tokenName:'',isOpen:false})}
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

export default DepositIWERCModal;
