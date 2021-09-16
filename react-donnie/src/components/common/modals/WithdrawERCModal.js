import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Input, Modal, Space} from "antd";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import {loadingState, withdrawERCModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import useWallet from "~/hooks/useWallet";
import {ercDonWithdraw} from "~/lib/swapApi";
import {useTranslation} from "react-i18next";
import ComUtil from "~/util/ComUtil";
import {BsBoxArrowInDown} from "react-icons/bs";
import iostApi from "~/lib/iostApi";
import styled from 'styled-components'
import swapApi from "~/lib/swapApi";
import BigNumber from "bignumber.js";
import properties from "~/properties";

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

    const [, setLoadingStatus] = useRecoilState(loadingState)

    const {t} = useTranslation()
    const [isOpen, setIsOpen] = useRecoilState(withdrawERCModalState)

    // IOST account
    const {address, hasIWallet, isLogin} = useWallet()

    // 내 DON
    const [balance, setBalance] = useState(0);

    const [withdrawAmount, setWithdrawAmount] = useState("");

    // 이더리움 주소
    const [ercAccount, setErcAccount] = useState("");

    const [donFee,setDonFee] = useState(properties.DON_FEE)

    // 메모
    // const [memo, setMemo] = useState("");
    // 출금 passCode 관련
    // const [passCode, setPassCode] = useState("");
    // const [userPassCode, setUserPassCode] = useState("");
    // const [intervalTime, setIntervalTime] = useState(1000);
    // const [passCodeTime, setPassCodeTime] = useState(60*5*1000); // 5분
    // const [timerUI, setTimerUI] = useState("05:00");

    const tMessage = t('message', {returnObjects: true})

    useEffect(() => {
        async function fetch() {
            const data = await iostApi.getTokenBalance({address: address, tokenName: properties.address.token});
            setBalance(data)

            //don_fee 가져오기.
            const {data:feeAmt} = await swapApi.getErcDonWithdrawFee();
            setDonFee(feeAmt)

            // const {data:passCode} = await swapApi.getNewSwapPassCode(address);
            // setPassCode(passCode);
        }
        fetch()
    }, [])

    const onWithDrawNumberChange = ({target}) => {
        const {value} = target
        const val = new BigNumber(value).decimalPlaces(8).toNumber();
        setWithdrawAmount(val);
    }

    const onWithDrawNumberBlur = ({target}) => {
        const {value} = target
        const val = new BigNumber(value).decimalPlaces(8).toNumber();
        const valBalance = new BigNumber(balance).decimalPlaces(8).toNumber();
        if (val > valBalance) {
            setWithdrawAmount(valBalance);
        }
    }

    // 출금금액 전체 클릭
    const onAllClick = () => {
        setWithdrawAmount(balance)
    }

    const onWithdrawErc = async() => {

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
            // const {data:validPassCode} = await swapApi.isValidSwapPassCode(address, userPassCode);
            // if(!validPassCode) {
            //     alert("출금확인 passCode를 확인해주세요.");
            //     return;
            // }

            let gasLimit = 200000;
            const contract = properties.ERC_DON_WITHDRAW_CONTRACT_ID;

            setLoadingStatus('confirmation')
            const {result, isSuccess} = await iostApi.onErcDonWithdrawBC(gasLimit, contract, withdrawAmount, ercAccount);
            setLoadingStatus('pending')

            //res.result res.isSuccess 로 데이터 결과값 사용가능
            if(!isSuccess) {
                setLoadingStatus('failed')
                let errorMessage = t(lang.failedToSend);
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = t(lang.failedToSend);
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
                let {data: result} = await ercDonWithdraw(address);
                if (result) {
                    setLoadingStatus('success')
                    const {withdrawRequestComplateMsg} = t('withdrawErc', {returnObjects: true});
                    alert(withdrawRequestComplateMsg);
                    setIsOpen(false);
                }else {
                    setLoadingStatus('failed')
                    alert(t('delayWithdraw'));
                    setIsOpen(false);
                }
            }catch (err){
                console.slog(err)
                setLoadingStatus('failed')
                alert(t('delayWithdraw'));
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

    // const onChangeMemo = ({target}) => {
    //     const {value} = target
    //     setMemo(value);
    // }

    const onPasteClick = async () => {
        const text = await ComUtil.pasteClipboardText()
        setErcAccount(text)
    }

    // const onChangePassCode = ({target}) => {
    //     const {value} = target
    //     setUserPassCode(value);
    // }
    //
    // useInterval(()=>{
    //
    //     if(passCodeTime <= 0) {
    //         setIntervalTime(null);
    //         setPassCode("passCode 유효시간이 지났습니다.");
    //         return;
    //     }
    //
    //     let result = passCodeTime - 1000;
    //     // console.log('codeTime : ' + result);
    //     setPassCodeTime(result);
    //     const momentTimer = moment.utc(result).format('mm:ss');
    //     setTimerUI(momentTimer);
    // }, intervalTime);

    const lang = t('withdrawErc', {returnObjects: true})

    return (

        <Div>
            {/*<Div p={10} bg={'danger'} fg={'white'} textAlign={'center'}>*/}
            {/*    {t('withdrawErc', {returnObjects: true}).confirmMsgTitle}*/}
            {/*</Div>*/}
            <Div p={24}>
                <Div p={16} shadow={'md'} bc={'light'}>
                    <h3>IOST Account</h3>
                    <Div mt={15} mb={5}>
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

                    {/*<Flex my={10} >*/}
                    {/*    <Div>passCode를 아래에 입력해주세요 [{timerUI}]</Div>*/}
                    {/*    <Div fg={'danger'} ml={10}>{passCode}</Div>*/}
                    {/*</Flex>*/}

                    {/*<Div mb={10}>*/}
                    {/*    <Div>출금확인 passCode</Div>*/}
                    {/*    <Input name={'passCode'} placeholder={'passCode'} size={'large'} onChange={onChangePassCode} value={userPassCode}/>*/}
                    {/*</Div>*/}
                    {/*<Div>*/}
                    {/*    <Div>{lang.memo}</Div>*/}
                    {/*    <Input name={'memo'} placeholder={lang.memo} size={'large'} onChange={onChangeMemo} value={memo}/>*/}
                    {/*</Div>*/}
                </Div>

                <Flex justifyContent='center' my={20} fontSize={16}>
                    <BsBoxArrowInDown fontSize={23}/>
                </Flex>

                <Div p={16} my={20} shadow={'md'} bc={'light'}>
                    <h3>ERC DON ADDRESS</h3>

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
                            <Right>- {donFee} DON</Right>
                        </Flex>
                        <Flex dot fw={500}>
                            <Div>{lang.realWithdrawAmount}</Div>
                            <Right>{ComUtil.minusFee(withdrawAmount || 0, donFee)} DON</Right>
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
                <Flex>
                    <Img width={20} src={properties.tokenImages.don} />
                    <Div pt={3} ml={5}>
                        <Flex>Swap (IRC to ERC)</Flex>
                    </Div>
                </Flex>
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
