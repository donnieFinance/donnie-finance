import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, Img, Right} from "~/styledComponents/shared";
import {Input, Modal} from "antd";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import {loadingState, bridgeWithdrawModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {useTranslation} from "react-i18next";
import ComUtil from "~/util/ComUtil";
import {BsBoxArrowInDown,BsArrowRightShort} from "react-icons/bs";
import iostApi from "~/lib/iostApi";
import swapApi from "~/lib/swapApi";
import styled from 'styled-components'
import properties from "~/properties";
import BigNumber from "bignumber.js";

const StyledInputNumber = styled(Input)`
    & input {
        height: 40px;
    } 
`;

const TestDiv = styled(Div)`
    input[type=number]::-webkit-inner-spin-button {
      // -webkit-appearance: none;
        width: 14px;
        height: 30px;
    }
`;
const BridgeWithdrawContent = () => {

    const [, setLoadingStatus] = useRecoilState(loadingState)


    const {t} = useTranslation()
    const [bridgeWithdrawState, setBridgeWithdrawState] = useRecoilState(bridgeWithdrawModalState)

    const TOKEN = bridgeWithdrawState.tokenName && properties.exchange.bridgeTokenList.find((token)=>token.tokenName === bridgeWithdrawState.tokenName);

    // IOST account
    const {address, hasIWallet, isLogin} = useWallet()

    // 내 잔액
    const [balance, setBalance] = useState(0);

    // 출금금액
    const [withdrawAmount, setWithdrawAmount] = useState("");

    // 주소
    const [accountInfo, setAccountInfo] = useState("");

    // 메모
    const [memo, setMemo] = useState("");

    // 해당 코인 가격 표현
    const [coinFee,setCoinFee] = useState(0)
    const [coinLabel, setCoinLabel] = useState('');
    const [amtLabel, setAmtLabel] = useState('');

    const [realWithdrawAmount, setRealWithdrawAmount] = useState(0)

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const lang = TOKEN && TOKEN.ercTokenName === 'BNB' ? t('withdrawBNB', {returnObjects: true}):t('withdrawIWErc', {returnObjects: true})

    useEffect(() => {
        async function fetch() {
            if(TOKEN){
                //토큰에 해당하는 금액 표시
                setAmtLabel(TOKEN.ercTokenName);
                setCoinLabel(TOKEN.ircTokenName);

                // 해당 풀의 잔액 (iwBNB ...)
                let data = await iostApi.getTokenBalance({address: address, tokenName: TOKEN.tokenName});
                //iw 일 경우 destroy amount
                if (TOKEN.ercTokenName.toUpperCase() === 'BLY') {
                    data = new BigNumber(data).minus(ComUtil.getDestroyBlyAmount(address)).toNumber()
                }
                else if (TOKEN.ercTokenName.toUpperCase() === 'WBTC') {
                    data = new BigNumber(data).minus(ComUtil.getDestroyBtcAmount(address)).toNumber()
                }
                setBalance(data);

                // 해당 iwBNB 풀의 수수료없음: 202206 수수료추가.
                // if(TOKEN.ercTokenName !== 'BNB') {
                    const {data: feeAmt} = await swapApi.getIwWithdrawFee(TOKEN.tokenName);
                    setCoinFee(feeAmt)
                // }
            }
        }
        fetch()
    }, [])

    useEffect(() => {
        const realWithdrawAmount = parseFloat(new BigNumber(withdrawAmount || 0).minus(coinFee).decimalPlaces(8))
        setRealWithdrawAmount(realWithdrawAmount)
    }, [withdrawAmount])

    const onWithDrawNumberChange = ({target}) => {
        const {value} = target
        const val = new BigNumber(value).decimalPlaces(8).toNumber();
        setWithdrawAmount(val);
        setRealWithdrawAmount(parseFloat(new BigNumber(val).minus(coinFee).toNumber().toFixed(8)))
    }

    const onWithDrawNumberBlur = ({target}) => {
        const {value} = target
        const val = new BigNumber(value).decimalPlaces(8).toNumber();
        const valBalance = new BigNumber(balance).decimalPlaces(8).toNumber();
        if (val > valBalance) {
            setWithdrawAmount(valBalance);
            setRealWithdrawAmount(parseFloat(new BigNumber(valBalance).minus(coinFee).toNumber().toFixed(8)))
        }
    }

    // 출금금액 전체 클릭
    const onAllClick = () => {
        //console.log("typeof"+typeof balance, balance)
        setWithdrawAmount(balance)
    }

    const onWithdrawBep = async() => {

        const iwFee = coinFee;
        if (hasIWallet() && isLogin()) {

            if(!withdrawAmount || withdrawAmount <= 0){
                window.$message.error(lang.withdrawAmountConfirmMsg);
                return;
            }
            if(TOKEN.ercTokenName !== 'BNB') {
                if (withdrawAmount <= iwFee) {
                    window.$message.error(t(lang.withdrawAmountLimitConfirmMsg,{x:iwFee+" "+coinLabel}));
                    return;
                }
            }

            if(TOKEN.tokenType === 'BEP20') {

                console.log('--////2--' + withdrawAmount)
                if (withdrawAmount < 0.05) {
                    alert('Minimum withdraw amount is 0.05');
                    return;
                }

                // BNB BEP 주소 체크
                if (!checkSumAccount(accountInfo)) {
                    alert(lang.receptionBepAddressConfirmMsg);
                    return;
                }
            }else{
                if(!checkSumAccount(accountInfo)){
                    alert(lang.receptionErcAddressConfirmMsg);
                    return;
                }
            }

            let gasLimit = 200000;
            // gasLimit, contractID, amountStr, ercAccount
            if(!TOKEN){
                return;
            }

            setLoadingStatus('confirmation')

            // 출금 전송 기능
            const {result, isSuccess} = await iostApi.onIwSwapWithdrawBC(gasLimit, TOKEN.tokenAddress, withdrawAmount, accountInfo, TOKEN.tokenName);
            setLoadingStatus('pending')

            if (!isSuccess) {
                setLoadingStatus('failed')
                let errorMessage = t(lang.failedToSend,{x:coinLabel});
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = t(lang.failedToSend,{x:coinLabel});
                            if(error.message){
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                } else if (typeof result === 'object') {
                    if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else if (result.status_code === 'RUNTIME_ERROR') {
                        errorMessage = `${tMessage.failedToSend}`;
                    } else{
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                alert(errorMessage);
                return
            }

            try{
                if(TOKEN) {
                    if (TOKEN.ercTokenName === 'BNB') {
                        const {data: result} = await swapApi.bnbWithdraw(address);
                        if (result) {
                            setLoadingStatus('success')
                            alert(lang.withdrawRequestMsg);
                            onModalClose();
                        } else {
                            setLoadingStatus('failed')
                            alert(t('delayWithdraw'));
                            onModalClose();
                        }
                    } else {
                        if (TOKEN.isIdo) {
                            //tokenName, ircAccount
                            let {data: result} = await swapApi.idoErcWithdraw(bridgeWithdrawState.tokenName.toLowerCase(),address);
                            if (result) {
                                setLoadingStatus('success')
                                alert(lang.withdrawRequestMsg);
                                onModalClose();
                            } else {
                                setLoadingStatus('failed')
                                alert(t('delayWithdraw'));
                                onModalClose();
                            }
                        }else {
                            const data = {
                                iwTokenName: bridgeWithdrawState.tokenName.toLowerCase(),
                                ircAccount: address
                            }
                            //iwTokenName, ircAccount
                            let {data: result} = await swapApi.withdrawIwErc(data);
                            if (result) {
                                setLoadingStatus('success')
                                alert(lang.withdrawRequestMsg);
                                onModalClose();
                            } else {
                                setLoadingStatus('failed')
                                alert(t('delayWithdraw'));
                                onModalClose();
                            }
                        }
                    }
                }
            }catch (err){
                console.slog(err)
                alert(t('delayWithdraw'));
                setLoadingStatus('failed')
            }
        }
    }

    const onModalClose = () => {
        setBridgeWithdrawState({tokenName:'',isOpen:false})
    }

    const checkSumAccount = (account) => {
        let accountOk = true
        if(account.length === 0) {
            accountOk = false
        }
        try {
            let ethAccount = toChecksumAddress(account);
            if (!isValidAddress(ethAccount)) {
                accountOk = false
            }
        } catch(e) {
            accountOk = false
        }
        return accountOk
    }

    const onAccount = ({target}) => {
        const {value} = target
        setAccountInfo(value);
    }

    const onChangeMemo = ({target}) => {
        const {value} = target
        setMemo(value);
    }

    const onPasteClick = async () => {
        const text = await ComUtil.pasteClipboardText()
        setAccountInfo(text)
    }

    return (
        <Div p={24}>
            <Div p={16} shadow={'md'} bc={'light'}>
                <Div mt={10} mb={5}>
                    <Div><b>IOST</b> Account</Div>
                    <Div textAlign={'center'} fontSize={16}>{address}</Div>
                </Div>
                <Div mt={10} mb={15}>
                    <Div>{lang.availableAmount} ({coinLabel})</Div>
                    <Flex bc={'secondary'} bg={'light'} justifyContent={'center'} height={40}>{balance}</Flex>
                </Div>
                <Div my={15}>
                    <Div>{lang.withdrawAmount} ({coinLabel})</Div>
                    <Flex>
                        <TestDiv flexGrow={1}>
                            <StyledInputNumber type={'number'}
                                               style={{height: 40}}
                                               block
                                               value={withdrawAmount}
                                               onChange={onWithDrawNumberChange}
                                               onBlur={onWithDrawNumberBlur}
                            />
                        </TestDiv>
                        <Div flexBasis={20} flexShrink={0}>
                            <Button bg={'primary'} fg={'white'} px={20} height={40} rounded={0} onClick={onAllClick}>{lang.all}</Button>
                        </Div>
                    </Flex>
                </Div>
            </Div>

            <Flex justifyContent='center' my={20} fontSize={16}>
                <BsBoxArrowInDown fontSize={23}/>
            </Flex>

            <Div p={16} my={20} shadow={'md'} bc={'light'}>
                <Flex>
                    {
                        TOKEN && TOKEN.ercTokenName && <Img mr={2} width={20} src={properties.tokenImages[TOKEN.ercTokenName.toLowerCase()]} />
                    }
                    <h3>
                        {amtLabel}{TOKEN && TOKEN.tokenType ==='BEP20'?'('+TOKEN.tokenType+'-BSC)':"("+TOKEN.tokenType+")"}
                    </h3>
                </Flex>
                <Div mt={10}>
                    <Flex mb={5} alignItems={'flex-end'}>
                        <Div>{lang.address}</Div>
                        <Right>
                            <Button bg={'primary'} fg={'white'} px={8} py={5} rounded={3} onClick={onPasteClick} fontSize={13}>{lang.paste}</Button>
                        </Right>
                    </Flex>
                    <Input style={{fontSize:14.7}} placeholder={TOKEN.ercTokenName === 'BNB' ?lang.receptionBepAddress:t(lang.receptionErcAddress,{x:TOKEN.ercTokenName+"(ERC20)"})} size={'large'} onChange={onAccount} value={accountInfo}/>
                    <Div fg={'danger'} textAlign={'center'} mt={4} fontSize={12}>
                        {
                            TOKEN && TOKEN.ercTokenName === 'BNB' ?
                                lang.confirmMsgTitle
                                :
                                t(lang.confirmMsgTitle,{x:TOKEN.ercTokenName+"(ERC20)"})
                        }
                    </Div>
                </Div>
            </Div>

            <Div bg={'white'} bc={'primary'} fg={'dark'}  >
                <Div p={16}>
                    <Flex dot>
                        <Div>{lang.withdrawAmount}</Div>
                        <Right>{withdrawAmount} {amtLabel}</Right>
                    </Flex>
                    <Flex dot>
                        <Div>{lang.fee}</Div>
                        {
                            // TOKEN.ercTokenName === 'BNB' ?
                            //     <Right>Free {amtLabel}</Right>
                            //     :
                                <Right>- {coinFee} {amtLabel}</Right>
                        }
                    </Flex>
                    <Flex dot fw={500}>
                        <Div>{lang.realWithdrawAmount}</Div>
                        <Right>{realWithdrawAmount <= 0 ? 0 : realWithdrawAmount} {amtLabel}</Right>
                    </Flex>
                </Div>

                <Div
                    px={6} pb={6}
                >
                    <Button bg='primary'
                            fg={'white'}
                            bold
                            py={15}
                            px={6}
                            block
                            onClick={onWithdrawBep}
                    >
                        {lang.withdraw}
                    </Button>
                </Div>

            </Div>

        </Div>

        // </Div>
    )
}

const BridgeWithdrawModal = () => {
    const [loadingStatus, setLoadingStatus] = useRecoilState(loadingState)
    const {t} = useTranslation()
    const [withdrawState, setWithdrawState] = useRecoilState(bridgeWithdrawModalState)
    const TOKEN = withdrawState.tokenName && properties.exchange.bridgeTokenList.find((token)=>token.tokenName === withdrawState.tokenName);

    const getTitle = () => {
        if(TOKEN) {
            return (
                <Flex>
                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                        <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{TOKEN.ircTokenName}(IRC)</Flex>
                    </Div>
                    <Flex mx={10}><BsArrowRightShort /></Flex>
                    <Flex pt={4}>
                        {
                            TOKEN.ercTokenName && <Img width={20} src={properties.tokenImages[TOKEN.ercTokenName.toLowerCase()]} />
                        }
                        {`${TOKEN.ercTokenName}`}{TOKEN.tokenType === 'BEP20'? '('+TOKEN.tokenType+'-BSC)':'('+TOKEN.tokenType+')'}
                    </Flex>
                </Flex>
            )
        }
    }
    const onModalClose = () => {
        setWithdrawState({tokenName:'',isOpen:false})
    }
    return (
        <Modal
            title={getTitle()}
            visible={withdrawState.isOpen}
            footer={null}
            centered={true}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
            onCancel={()=> {
                if (loadingStatus === 'loading') {
                    return
                }
                onModalClose()
            }}
        >
            <BridgeWithdrawContent />
        </Modal>
    );
};

export default BridgeWithdrawModal;
