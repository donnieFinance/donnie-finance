import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {InputNumber, Modal, Space} from "antd";
import {bridgeDepositModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {useTranslation} from "react-i18next";
import {
    getBnbMinimumDeposit,
    allocateBnbSwapAccount,
    updateLastCheckDayBnbAccount,
    updateLastCheckDayErcAccount,
    getIwMinimumDeposit,
    getIwSwapErcAccount
} from "~/lib/swapApi";
import { QRCode } from "react-qr-svg";
import ComUtil from "~/util/ComUtil";
import {AiFillCopy} from 'react-icons/ai'
import {BsArrowRightShort, BsBoxArrowInDown} from 'react-icons/bs'
import ImgBnb from "~/assets/coin_bnb_wine.svg";
import ImgWbtc from "~/assets/coin_wbtc.png";
import properties from "~/properties";

const DepositModalContent = () => {
    const {t} = useTranslation()
    const [bridgeDepositState, setBridgeDepositState] = useRecoilState(bridgeDepositModalState)
    const {address, hasIWallet, isLogin} = useWallet()

    const TOKEN = bridgeDepositState.tokenName && properties.exchange.bridgeTokenList.find((token)=>token.tokenName === bridgeDepositState.tokenName);

    const tErcLang = t('depositIWErc', {returnObjects: true});
    const tBepLang = t('depositBNB', {returnObjects: true});
    const tDepositLang = TOKEN.ercTokenName === 'BNB' ? tBepLang:tErcLang;

    const [addressInfo, setAddressInfo] = useState("");
    const [addressConfirm, setAddressConfirm] = useState(false);

    const [xMin, setXMin] = useState('');

    // myDonOpen 모달 오픈이 되었을 경우 잔액 가져오기 API 실행
    useEffect(() => {
        getAccount();
    }, [])

    const getAccount = async() => {
        if(TOKEN){

            const minCoin = TOKEN.ercTokenName;

            if(TOKEN.ercTokenName === 'BNB') {
                // BNB BEP20-BSC 입금주소 QR
                const {data: bep20Account} = await allocateBnbSwapAccount(address);
                setAddressInfo(bep20Account);
                updateLastCheckDayBnbAccount(address, bep20Account);

                // 최소 입금 수량
                const {data:minAmt} = await getBnbMinimumDeposit();
                setXMin(minAmt+' '+minCoin);
            }else{
                const {data:ercAccount} = await getIwSwapErcAccount(address,TOKEN.tokenName);
                setAddressInfo(ercAccount);
                updateLastCheckDayErcAccount(address, ercAccount);

                // 최소 입금 수량
                const {data:minAmt} = await getIwMinimumDeposit(TOKEN.tokenName);
                setXMin(minAmt+' '+minCoin);
            }
        }
    }

    const onModalClose = () => {
        setBridgeDepositState({tokenName:'',isOpen:false})
    }

    const copyText = () => {
        ComUtil.copyTextToClipboard(addressInfo, tDepositLang.addressCopyMsg, tDepositLang.addressCopyFailMsg);
    }

    if(
        (TOKEN.ercTokenName && TOKEN.ercTokenName.toUpperCase() === 'BNB' && !addressConfirm) ||
        (TOKEN.ercTokenName && TOKEN.ercTokenName.toUpperCase() === 'WBTC' && !addressConfirm)
    ){
        return (
            <Div minWidth={260}>
                <Div p={24}>
                    <Div p={16} shadow={'md'} bc={'light'}>
                        <Flex justifyContent={'center'} mb={10}>
                            {
                                TOKEN.ercTokenName.toUpperCase() === 'BNB' && <Img width={60} src={ImgBnb}/>
                            }
                            {
                                TOKEN.ercTokenName.toUpperCase() === 'WBTC' && <Img width={60} src={ImgWbtc}/>
                            }
                        </Flex>
                        <Div textAlign={'center'} fg={'danger'}>
                            {TOKEN.ercTokenName.toUpperCase() === 'BNB' && tDepositLang.confirmMsgTitle3}
                            {TOKEN.ercTokenName.toUpperCase() === 'WBTC' && t(tDepositLang.confirmMsgTitle3, {x:TOKEN.ercTokenName+'(ERC)'})}
                        </Div>
                        {
                            TOKEN.ercTokenName.toUpperCase() === 'WBTC' &&
                            <Div textAlign={'center'} fg={'danger'} bold>
                                WBTC = Wrapped Bitcoin
                            </Div>
                        }
                        <Flex justifyContent='center' my={20} fontSize={16}>
                            <Button mr={10} bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => onModalClose()}>
                                No
                            </Button>
                            <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={() => setAddressConfirm(true)}>
                                Yes
                            </Button>
                        </Flex>
                    </Div>
                </Div>
            </Div>
        )
    }

    if(!bridgeDepositState.tokenName) return null;

    return (
        <Div minWidth={260}>
            <Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>
            {t(tDepositLang.confirmMsgTitle,{x:TOKEN.ercTokenName + (TOKEN.ercTokenName.toUpperCase() === 'BNB' ?'(BEP20-BSC)':'')})}<br/>
            {t(tDepositLang.confirmMsgTitle2,{x:xMin})}
            </Div>
            <Div p={24}>
                <Div p={16} shadow={'md'} bc={'light'}>
                    <h3>
                    {t(tDepositLang.addressTitle2,{x: TOKEN.ercTokenName + (TOKEN.ercTokenName.toUpperCase() === 'BNB' ?'(BEP20-BSC)':'')})}
                    </h3>

                    <Div textAlign={'center'}>
                        <Div my={16}>
                            {addressInfo?
                                <QRCode
                                    bgColor="#FFFFFF"
                                    fgColor="#000000"
                                    level="Q"
                                    style={{ width: 150 }}
                                    value={addressInfo}
                                />
                                : tDepositLang.loginCheckMsg}
                        </Div>

                        <Div textAlign={'right'} mb={10}>
                            <Button bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={copyText}>
                                <Flex>
                                    <AiFillCopy />
                                    <Div>{tDepositLang.addressCopy}</Div>
                                </Flex>
                            </Button>
                        </Div>
                        <Div>
                            {addressInfo}
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

const BridgeDepositModal = () => {

    const {t} = useTranslation()
    const [depositState, setDepositState] = useRecoilState(bridgeDepositModalState)
    const TOKEN = depositState.tokenName && properties.exchange.bridgeTokenList.find((token)=>token.tokenName === depositState.tokenName);

    const onModalClose = () => {
        setDepositState({tokenName:'',isOpen:false})
    }

    const getTitle = () => {
        return(
            <Flex>
                {
                    TOKEN && TOKEN.ercTokenName.toUpperCase() === 'BNB' && <Img width={20} src={ImgBnb} />
                }
                <Flex pt={4}>
                    {TOKEN.ercTokenName}{TOKEN.ercTokenName.toUpperCase() === 'BNB' ? '(BEP20-BSC)':'(ERC20)'}
                </Flex>
                <Flex mx={2}><BsArrowRightShort /></Flex>
                <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                    <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{`${TOKEN.ircTokenName}(IRC)`}</Flex>
                </Div>
            </Flex>
        )
    }
    if(!depositState.tokenName) return null;
    return (
        <Modal
            title={ getTitle() }
            visible={depositState.isOpen}
            onCancel={() => onModalClose()}
            footer={null}
            width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
        >
            <DepositModalContent />
        </Modal>
    );
};

export default BridgeDepositModal;
