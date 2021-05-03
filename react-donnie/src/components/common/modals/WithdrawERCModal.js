import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Input, Modal, Space} from "antd";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import {withdrawERCModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {swapIrcToErc} from "~/lib/swapApi";
import {useTranslation} from "react-i18next";
import ComUtil from "~/util/ComUtil";
import {BsBoxArrowInDown} from "react-icons/bs";
import iostApi from "~/lib/iostApi";
import styled from 'styled-components'
import swapApi from "~/lib/swapApi";

import properties from "~/properties";
import useInterval from "~/hooks/useInterval";
import moment from 'moment-timezone'

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
const WithdrawERCContent = () => {


    const {t} = useTranslation()
    const [isOpen, setIsOpen] = useRecoilState(withdrawERCModalState)

    // IOST account
    const {address, hasIWallet, isLogin} = useWallet()

    // 내 DON
    const [balance, setBalance] = useState(0);

    const [withdrawAmount, setWithdrawAmount] = useState("");

    // 이더리움 주소
    const [ercAccount, setErcAccount] = useState("");

    // 메모
    const [memo, setMemo] = useState("");

    // 출금 passCode 관련
    const [passCode, setPassCode] = useState("");
    const [userPassCode, setUserPassCode] = useState("");
    const [intervalTime, setIntervalTime] = useState(1000);
    const [passCodeTime, setPassCodeTime] = useState(60*5*1000); // 5분
    const [timerUI, setTimerUI] = useState("05:00");

    const tMessage = t('message', {returnObjects: true})

    useEffect(() => {
        async function fetch() {
            const data = await iostApi.getTokenBalance({address: address, tokenName: properties.address.token});
            setBalance(data)
            const {data:passCode} = await swapApi.getNewSwapPassCode(address);
            setPassCode(passCode);
        }
        fetch()
    }, [])

    const onWithDrawNumberChange_bak = (value) => {


        setWithdrawAmount(ComUtil.replaceDecimalNumber(value, 8));
        // setWithdrawAmount(value);
    }

    const onWithDrawNumberChange = ({target}) => {
        const {value} = target
        const res = ComUtil.replaceDecimalNumber(value, 8)
        console.log({res})
        setWithdrawAmount(res);
        // setWithdrawAmount(value);
    }

    const onWithDrawNumberBlur = ({target}) => {
        const {value} = target
        if (value > balance) {
            setWithdrawAmount(balance);
        }
    }

    // 출금금액 전체 클릭
    const onAllClick = () => {
        setWithdrawAmount(balance)
    }

    const onWithdrawErc = async() => {

        const donFee = properties.DON_FEE;
        if (hasIWallet() && isLogin()) {

            if(!withdrawAmount || withdrawAmount <= 0){
                const {withdrawAmountConfirmMsg} = t('withdrawErc', {returnObjects: true});
                window.$message.error(withdrawAmountConfirmMsg);
                return;
            }

            if (withdrawAmount <= donFee) {
                const {withdrawAmountLimitConfirmMsg} = t('withdrawErc', {returnObjects: true});
                window.$message.error(t(withdrawAmountLimitConfirmMsg,{x:donFee}));
                return;
            }

            if(!checkErcAccount(ercAccount)){
                const {receptionErcAddressConfirmMsg} = t('withdrawErc', {returnObjects: true});
                alert(receptionErcAddressConfirmMsg);
                return;
            }


            // await onSendIrcToManager();

            const {data:validPassCode} = await swapApi.isValidSwapPassCode(address, userPassCode);
            if(!validPassCode) {
                alert("출금확인 passCode를 확인해주세요.");
                return;
            }

            const ircResult = await iostApi.onSendIrcDonToManagerBC(address, withdrawAmount, memo);
            if(!ircResult.isSuccess) {
                const {failedToSend} = t('withdrawErc', {returnObjects: true});
                let errorMessage = failedToSend;
                if (typeof ircResult.result === 'string') {
                    if (ircResult.result.indexOf('{') > -1) {
                        const error = JSON.parse(ircResult.result.substring(ircResult.result.indexOf('{'), ircResult.result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = failedToSend;
                            if(error.message){
                                vFailedToSend = vFailedToSend + "/n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                } else if (typeof ircResult.result === 'object') {
                    if (ircResult.result.status_code === 'BALANCE_NOT_ENOUGH') {
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

            // console.log(ircResult.result.tx_hash);
            const data = {
                ircAccount: address,
                swapAccount: ercAccount,
                ircDonAmount: withdrawAmount,
                memo: memo,
                passCode: userPassCode,
                txHash: ircResult.result.tx_hash
            }

            let {data: result} = await swapIrcToErc(data);
            //console.log("swapIrcToErc result ==",result)
            if (result === 200) {
                const {withdrawRequestComplateMsg} = t('withdrawErc', {returnObjects: true});
                alert(withdrawRequestComplateMsg);
                setIsOpen(false)
            } else if(result === 101) {
                alert("이미 출금이 진행중입니다.");
                setIsOpen(false)
            } else if(result === -1) {
                alert("출금확인 passCode 확인 후 다시 요청해주세요.");
                setIsOpen(false)
            }else if(result === -100) {
                alert("잘못된 요청입니다!");
                setIsOpen(false)
            }else if(result === -999) {
                alert("잘못된 요청입니다!");
                setIsOpen(false)
            }
        }
    }

    const checkErcAccount = (account) => {
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

    const onErcAccount = ({target}) => {
        const {name, value} = target
        setErcAccount(value);
    }

    const onChangeMemo = ({target}) => {
        const {value} = target
        setMemo(value);
    }

    const onPasteClick = async () => {
        const text = await ComUtil.pasteClipboardText()
        setErcAccount(text)
    }

    const onChangePassCode = ({target}) => {
        const {value} = target
        setUserPassCode(value);
    }

    useInterval(()=>{

        if(passCodeTime <= 0) {
            setIntervalTime(null);
            setPassCode("passCode 유효시간이 지났습니다.");
            return;
        }

        let result = passCodeTime - 1000;
        // console.log('codeTime : ' + result);
        setPassCodeTime(result);
        const momentTimer = moment.utc(result).format('mm:ss');
        setTimerUI(momentTimer);
    }, intervalTime);

    const lang = t('withdrawErc', {returnObjects: true})

    return (

        <Div minWidth={450}>
            {/*<Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>*/}
            {/*    {t('withdrawErc', {returnObjects: true}).confirmMsgTitle}*/}
            {/*</Div>*/}
            <Div p={24}>
                <Div p={16} shadow={'md'} bc={'light'}>
                    <h3>IOST</h3>
                    <Div mt={15} mb={5}>
                        <Div>Account</Div>
                        <Div textAlign={'center'} fontSize={16}>{address}</Div>
                    </Div>
                    <Div mt={10} mb={15}>
                        <Div>{lang.availableAmount} (DON)</Div>
                        <Flex bc={'secondary'} bg={'light'} justifyContent={'center'} height={40}>{balance}</Flex>
                    </Div>
                    <Div my={15}>
                        <Div>{lang.withdrawAmount} (DON)</Div>
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
                                <Button bg={'primary'} fg={'white'} px={20} height={40} rounded={0} onClick={onAllClick}>{t('withdrawErc', {returnObjects: true}).all}</Button>
                            </Div>
                        </Flex>

                        {/*<Flex justifyContent={'space-between'} fontSize={13} mt={5} fg={'primary'}>*/}
                        {/*    <Div></Div>*/}
                        {/*    <Div>{lang.fee} {properties.DON_FEE} DON</Div>*/}
                        {/*</Flex>*/}
                    </Div>

                    <Flex my={10} >
                        <Div>passCode를 아래에 입력해주세요 [{timerUI}]</Div>
                        <Div fg={'danger'} ml={10}>{passCode}</Div>
                    </Flex>

                    <Div mb={10}>
                        <Div>출금확인 passCode</Div>
                        <Input name={'passCode'} placeholder={'passCode'} size={'large'} onChange={onChangePassCode} value={userPassCode}/>
                    </Div>
                    <Div>
                        <Div>{lang.memo}</Div>
                        <Input name={'memo'} placeholder={lang.memo} size={'large'} onChange={onChangeMemo} value={memo}/>
                    </Div>
                </Div>

                <Flex justifyContent='center' my={20} fontSize={16}>
                    <BsBoxArrowInDown fontSize={23}/>
                </Flex>

                <Div p={16} my={20} shadow={'md'} bc={'light'}>
                    <h3>ETH</h3>

                    <Div mt={10}>
                        <Flex mb={5} alignItems={'flex-end'}>
                            <Div>{lang.address}</Div>
                            <Right>
                                <Button bg={'primary'} fg={'white'} px={8} py={5} rounded={3} onClick={onPasteClick} fontSize={13}>{lang.paste}</Button>
                            </Right>
                        </Flex>
                        <Input name={'erc'} style={{fontSize:14.7}} placeholder={lang.receptionErcAddress} size={'large'} onChange={onErcAccount} value={ercAccount}/>
                        <Div fg={'danger'} textAlign={'center'} mt={4} fontSize={12}>{t('withdrawErc', {returnObjects: true}).confirmMsgTitle}</Div>
                    </Div>
                </Div>

                <Div bg={'white'} bc={'primary'} fg={'dark'}  >
                    <Div p={16}>
                        <Flex dot>
                            <Div>{lang.withdrawAmount}</Div>
                            <Right>{withdrawAmount} DON</Right>
                        </Flex>
                        <Flex dot>
                            <Div>{lang.fee}</Div>
                            <Right>- {properties.DON_FEE} DON</Right>
                        </Flex>
                        <Flex dot fw={500}>
                            <Div>{lang.realWithdrawAmount}</Div>
                            <Right>{ComUtil.minusFee(withdrawAmount || 0, properties.DON_FEE)} DON</Right>
                        </Flex>
                    </Div>

                    <Div
                        px={6} pb={6}
                    >
                        <Button bg='primary'
                                fg={'white'}
                                bold
                            // bc={'info'}
                                py={15}
                                px={6}
                                block
                                onClick={onWithdrawErc}
                        >
                            {lang.withdraw}
                        </Button>
                    </Div>

                </Div>

            </Div>

        </Div>
    )
}

const WithdrawERCModal = () => {
    const {t} = useTranslation()
    const [isOpen, setIsOpen] = useRecoilState(withdrawERCModalState)

    return (
        <Modal
            title={
                // t('MyDONY')
                'Withdrawal (Swap IRC to ERC)'
            }
            visible={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={null}
            // width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
        >
            <WithdrawERCContent />
        </Modal>
    );
};

export default WithdrawERCModal;
