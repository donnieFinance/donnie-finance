import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Img, Right, Span} from "~/styledComponents/shared";
import {Input, Modal, Space} from "antd";
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import {loadingState, withdrawIWERCModalState} from '~/hooks/atomState'
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
// import {FaChevronRight} from 'react-icons/fa'
import {BsArrowRightShort} from 'react-icons/bs'
import Loading from "~/components/common/loading";
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
const WithdrawIWERCContent = () => {

    const [, setLoadingStatus] = useRecoilState(loadingState)


    const {t} = useTranslation()
    const [withdrawIWERCState, setWithdrawIWERCState] = useRecoilState(withdrawIWERCModalState)

    // IOST account
    const {address, hasIWallet, isLogin} = useWallet()

    // 내 잔액
    const [balance, setBalance] = useState(0);

    // 출금금액
    const [withdrawAmount, setWithdrawAmount] = useState("");

    // 이더리움 주소
    const [ercAccount, setErcAccount] = useState("");

    // 메모
    const [memo, setMemo] = useState("");

    // 해당 코인 가격 표현
    const [coinFee,setCoinFee] = useState(properties.BLY_FEE)
    const [coinLabel, setCoinLabel] = useState("iwBly");
    const [amtLabel, setAmtLabel] = useState("BLY");

    const [realWithdrawAmount, setRealWithdrawAmount] = useState(0)

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const lang = t('withdrawIWErc', {returnObjects: true})

    useEffect(() => {

        // console.log(new BigNumber(300.8 - 150.01).toString())

        async function fetch() {
            //토큰에 해당하는 금액 표시

            const v_UniqueKey = withdrawIWERCState.uniqueKey;
            const {tokenName, ircTokenName, ercTokenName, tokenType} = properties.contractList[v_UniqueKey];
            setAmtLabel(ercTokenName);
            setCoinLabel(ircTokenName);

            // 해당 풀의 잔액 (iwBly ...)
            let data = await iostApi.getTokenBalance({address: address, tokenName: tokenName});


            //iw 일 경우 destroy amount
            if (tokenType === 'iw') {
                if (tokenName === 'iwbly') {
                    data = new BigNumber(data).minus(ComUtil.getDestroyBlyAmount(address)).toNumber()
                }
                else if (tokenName === 'iwbtc') {
                    data = new BigNumber(data).minus(ComUtil.getDestroyBtcAmount(address)).toNumber()
                }
            }

            setBalance(data);

            const {data:feeAmt} = await swapApi.getIwWithdrawFee(tokenName);
            setCoinFee(feeAmt)
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

    const onWithdrawErc = async() => {


        const iwFee = coinFee;
        if (hasIWallet() && isLogin()) {

            if(!withdrawAmount || withdrawAmount <= 0){
                window.$message.error(lang.withdrawAmountConfirmMsg);
                return;
            }

            if (withdrawAmount <= iwFee) {
                window.$message.error(t(lang.withdrawAmountLimitConfirmMsg,{x:iwFee+" "+coinLabel}));
                return;
            }

            if(!checkErcAccount(ercAccount)){
                alert(lang.receptionErcAddressConfirmMsg);
                return;
            }

            let gasLimit = 200000;
            // gasLimit, contractID, amountStr, ercAccount
            let v_UniqueKey = withdrawIWERCState.uniqueKey;
            const contract = properties.contractList[v_UniqueKey]

            setLoadingStatus('confirmation')

            const {result, isSuccess} = await iostApi.onIwSwapWithdrawBC(gasLimit, contract.tokenAddress, withdrawAmount, ercAccount, contract.tokenName);

            setLoadingStatus('pending')


            //res.result res.isSuccess 로 데이터 결과값 사용가능
            if(!isSuccess) {
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
                const data = {
                    iwTokenName: withdrawIWERCState.tokenName.toLowerCase(),
                    ircAccount: address
                }
                //iwTokenName, ircAccount
                let {data: result} = await swapApi.withdrawIwErc(data);
                if (result) {
                    setLoadingStatus('success')
                    alert(lang.withdrawRequestMsg);
                    setWithdrawIWERCState({uniqueKey:'',tokenName:'',isOpen:false})
                }else {
                    setLoadingStatus('failed')
                    alert(t('contactUs'));
                    setWithdrawIWERCState({uniqueKey:'',tokenName:'',isOpen:false})
                }
            }catch (err){
                console.slog(err)
                setLoadingStatus('failed')
                alert(t('contactUs'));
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

    return (

        // <Div
        //minWidth={400}
        // >
        <Div p={24}>
            {/*<button onClick={() => {*/}
            {/*    setLoadingStatus('loading')*/}
            {/*    setTimeout(() => {*/}
            {/*        setLoadingStatus('success')*/}
            {/*    }, 2000)*/}

            {/*}}>출금</button>*/}

            <Div p={16} shadow={'md'} bc={'light'}>
                {/*<h3>IOST</h3>*/}
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

                    {/*<Flex justifyContent={'space-between'} fontSize={13} mt={5} fg={'primary'}>*/}
                    {/*    <Div></Div>*/}
                    {/*    <Div>{lang.fee} {properties.DON_FEE} DON</Div>*/}
                    {/*</Flex>*/}
                </Div>
            </Div>

            <Flex justifyContent='center' my={20} fontSize={16}>
                <BsBoxArrowInDown fontSize={23}/>
            </Flex>

            <Div p={16} my={20} shadow={'md'} bc={'light'}>
                <h3>{amtLabel}(ERC)</h3>

                <Div mt={10}>
                    <Flex mb={5} alignItems={'flex-end'}>
                        <Div>{lang.address}</Div>
                        <Right>
                            <Button bg={'primary'} fg={'white'} px={8} py={5} rounded={3} onClick={onPasteClick} fontSize={13}>{lang.paste}</Button>
                        </Right>
                    </Flex>
                    <Input name={'erc'} style={{fontSize:14.7}} placeholder={t(lang.receptionErcAddress,{x:amtLabel+'(ERC)'})} size={'large'} onChange={onErcAccount} value={ercAccount}/>
                    <Div fg={'danger'} textAlign={'center'} mt={4} fontSize={12}>{t(lang.confirmMsgTitle,{x:amtLabel+'(ERC)'})}</Div>
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
                        <Right>- {coinFee} {amtLabel}</Right>
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
                            onClick={onWithdrawErc}
                    >
                        {lang.withdraw}
                    </Button>
                </Div>

            </Div>

        </Div>

        // </Div>
    )
}

const WithdrawIWERCModal = () => {
    const [loadingStatus, setLoadingStatus] = useRecoilState(loadingState)
    const {t} = useTranslation()
    const [withdrawIWERCState, setWithdrawIWERCState] = useRecoilState(withdrawIWERCModalState)
    const getTitle = () => {
        if(withdrawIWERCState.uniqueKey) {
            const v_UniqueKey = withdrawIWERCState.uniqueKey;
            const {tokenName, ircTokenName, ercTokenName} = properties.contractList[v_UniqueKey];
            return (
                <Flex>
                    <Div p={2} rounded={4} bc={'black'} style={{borderStyle: 'dashed', borderWidth: 2}} >
                        <Flex bg={'info'} fg={'white'} rounded={4} px={8} pt={4}>{ircTokenName}(IRC)</Flex>
                    </Div>
                    <Flex mx={10}><BsArrowRightShort /></Flex>
                    <Flex pt={4}>{`${ercTokenName}(ERC)`}</Flex>
                </Flex>
            )
            // return 'Swap ' + ircTokenName + '(IRC) to ' + ercTokenName + '(ERC)';
        }
        return 'Swap [IRC to ERC]'
    }
    return (
        <Modal
            title={getTitle()}
            visible={withdrawIWERCState.isOpen}
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
                setWithdrawIWERCState({uniqueKey:'',tokenName:'',isOpen:false})
            }}
        >
            <WithdrawIWERCContent />
        </Modal>
    );
};

export default WithdrawIWERCModal;
