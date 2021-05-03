import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Input, Modal, Space} from "antd";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import {loadingState, withdrawBNBModalState} from '~/hooks/atomState'
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
import moment from 'moment-timezone'
import {BsArrowRightShort} from 'react-icons/bs'
import Loading from "~/components/common/loading";
import BigNumber from "bignumber.js";
import ImgBnb from "~/assets/coin_bnb_wine.svg";

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
const WithdrawBNBContent = () => {

    const [, setLoadingStatus] = useRecoilState(loadingState)


    const {t} = useTranslation()
    const [withdrawBNBState, setWithdrawBNBState] = useRecoilState(withdrawBNBModalState)

    // IOST account
    const {address, hasIWallet, isLogin} = useWallet()

    // 내 잔액
    const [balance, setBalance] = useState(0);

    // 출금금액
    const [withdrawAmount, setWithdrawAmount] = useState("");

    // BNB BEP 주소
    const [bepAccount, setBepAccount] = useState("");

    // 메모
    const [memo, setMemo] = useState("");

    // 해당 코인 가격 표현
    const [coinFee,setCoinFee] = useState(0)
    const [coinLabel, setCoinLabel] = useState("iwBNB");
    const [amtLabel, setAmtLabel] = useState("BNB");

    const [realWithdrawAmount, setRealWithdrawAmount] = useState(0)

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const lang = t('withdrawBNB', {returnObjects: true})

    useEffect(() => {

        // console.log(new BigNumber(300.8 - 150.01).toString())

        async function fetch() {
            //토큰에 해당하는 금액 표시

            const v_UniqueKey = withdrawBNBState.uniqueKey;
            const {tokenName, ircTokenName, ercTokenName} = properties.contractList[v_UniqueKey];
            setAmtLabel(ercTokenName);
            setCoinLabel(ircTokenName);

            // 해당 풀의 잔액 (iwBNB ...)
            const data = await iostApi.getTokenBalance({address: address, tokenName: tokenName});
            setBalance(data);

            // 해당 iwBNB 풀의 수수료없음
            // const {data:feeAmt} = await swapApi.getIwWithdrawFee(tokenName);
            // setCoinFee(feeAmt)
        }
        fetch()
    }, [])

    useEffect(() => {
        const realWithdrawAmount = parseFloat(new BigNumber(withdrawAmount || 0).minus(coinFee).decimalPlaces(8))
        setRealWithdrawAmount(realWithdrawAmount)
    }, [withdrawAmount])

    const onWithDrawNumberChange_bak = (value) => {
        setWithdrawAmount(ComUtil.replaceDecimalNumber(value, 8));
    }

    const onWithDrawNumberChange = ({target}) => {
        const {value} = target
        const res = ComUtil.replaceDecimalNumber(value, 8)
        setWithdrawAmount(res);

        setRealWithdrawAmount(parseFloat(new BigNumber(res).minus(coinFee).toNumber().toFixed(8)))
    }

    const onWithDrawNumberBlur = ({target}) => {
        const {value} = target
        if (value > balance) {
            setWithdrawAmount(balance);
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

            // if (withdrawAmount <= iwFee) {
            //     window.$message.error(t(lang.withdrawAmountLimitConfirmMsg,{x:iwFee+" "+coinLabel}));
            //     return;
            // }

            // BNB BEP 주소 체크
            if(!checkBepAccount(bepAccount)){
                alert(lang.receptionBepAddressConfirmMsg);
                return;
            }

            let gasLimit = 200000;
            // gasLimit, contractID, amountStr, ercAccount
            let v_UniqueKey = withdrawBNBState.uniqueKey;
            const contract = properties.contractList[v_UniqueKey]

            setLoadingStatus('confirmation')

            // BNB 출금 전송 기능
            const {result, isSuccess} = await iostApi.onIwSwapWithdrawBC(gasLimit, contract.tokenAddress, withdrawAmount, bepAccount, contract.tokenName);
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
                let {data: result} = await swapApi.bnbWithdraw(address);
                if (result) {
                    setLoadingStatus('success')
                    alert(lang.withdrawRequestMsg);
                    setWithdrawBNBState({uniqueKey:'',tokenName:'',isOpen:false})
                }else {
                    setLoadingStatus('failed')
                    alert(t('contactUs'));
                    setWithdrawBNBState({uniqueKey:'',tokenName:'',isOpen:false})
                }
            }catch (err){
                console.slog(err)
                alert(t('contactUs'));
                setLoadingStatus('failed')
            }
        }
    }

    const checkBepAccount = (account) => {
        let accountOk = true
        if(account.length === 0) {
            accountOk = false
        }
        try {
            // bep 주소 체크 로직 (erc랑 비슷)
            let ethAccount = toChecksumAddress(account);
            if (!isValidAddress(ethAccount)) {
                accountOk = false
            }
        } catch(e) {
            accountOk = false
        }
        return accountOk
    }

    const onBepAccount = ({target}) => {
        const {name, value} = target
        setBepAccount(value);
    }

    const onChangeMemo = ({target}) => {
        const {value} = target
        setMemo(value);
    }

    const onPasteClick = async () => {
        const text = await ComUtil.pasteClipboardText()
        setBepAccount(text)
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
                    <Img mr={2} width={20} src={ImgBnb} />
                    <h3>BNB(BEP20-BSC)</h3>
                </Flex>
                <Div mt={10}>
                    <Flex mb={5} alignItems={'flex-end'}>
                        <Div>{lang.address}</Div>
                        <Right>
                            <Button bg={'primary'} fg={'white'} px={8} py={5} rounded={3} onClick={onPasteClick} fontSize={13}>{lang.paste}</Button>
                        </Right>
                    </Flex>
                    <Input name={'bep20'} style={{fontSize:14.7}} placeholder={lang.receptionBepAddress} size={'large'} onChange={onBepAccount} value={bepAccount}/>
                    <Div fg={'danger'} textAlign={'center'} mt={4} fontSize={12}>{lang.confirmMsgTitle}</Div>
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
                        <Right>Free {amtLabel}</Right>
                        {/*<Right>- {coinFee} {amtLabel}</Right>*/}
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
                        // bc={'info'}
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

const WithdrawBNBModal = () => {
    const [loadingStatus, setLoadingStatus] = useRecoilState(loadingState)
    const {t} = useTranslation()
    const [withdrawBNBState, setWithdrawBNBState] = useRecoilState(withdrawBNBModalState)
    const getTitle = () => {
        if(withdrawBNBState.uniqueKey) {
            const v_UniqueKey = withdrawBNBState.uniqueKey;
            const {tokenName, ircTokenName, ercTokenName} = properties.contractList[v_UniqueKey];
            return (
                <Flex>
                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                        <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{ircTokenName}(IRC)</Flex>
                    </Div>
                    <Flex mx={10}><BsArrowRightShort /></Flex>
                    <Flex pt={4}><Img width={20} src={ImgBnb} />{`${ercTokenName}(BEP20-BSC)`}</Flex>
                </Flex>
            )
            // return 'Swap ' + ircTokenName + '(IRC) to ' + ercTokenName + '(ERC)';
        }
        return 'Swap [IRC to BEP]'
    }
    return (
        <Modal
            title={getTitle()}
            visible={withdrawBNBState.isOpen}
            // onCancel={() => setWithdrawIWERCState({uniqueKey:'',tokenName:'',isOpen:false})}
            footer={null}
            // width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            // focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
            destroyOnClose={true}
            bodyStyle={{padding:0}}
            onCancel={()=> {
                if (loadingStatus === 'loading') {
                    return
                }
                setWithdrawBNBState({uniqueKey:'',tokenName:'',isOpen:false})
            }}
        >
            <WithdrawBNBContent />
        </Modal>
    );
};

export default WithdrawBNBModal;
