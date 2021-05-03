import React, {useState, useEffect} from 'react';
import BigNumber from "bignumber.js";
import iostApi from "~/lib/iostApi";
import useWallet from '~/hooks/useWallet'
import {Div, Flex, Span} from "~/styledComponents/shared";
import properties from "~/properties";
import ComUtil from "~/util/ComUtil";
import {InputNumber, Space, Button} from 'antd'
import {useTranslation} from "react-i18next";

const {contractList} = properties;

const Deposit = ({
                    uniqueKey,
                    status,
                    onClose,
                 }) => {

    const contract = contractList[uniqueKey]
    const {t} = useTranslation()

    const tMessage = t('message', {returnObjects: true})
    const {address} = useWallet()
    const [errorMsg, setErrorMsg] = useState('')
    const [depositFormNumber,setDepositFormNumber] = useState('');
    const [loading, setLoading] = useState(false)
    const [coinBalance, setCoinBalance] = useState('...')

    useEffect(() => {
        getTokenBalance()
    }, [])

    const getTokenBalance = async () => {
        if(address !== null) {
            if(address !== '') {

                let data = await iostApi.getTokenBalance({address:address, tokenName: contract.tokenName});

                //iw 일 경우 destroy amount
                if (contract.tokenType === 'iw') {
                    if (contract.tokenName === 'iwbly') {
                        data = new BigNumber(data).minus(ComUtil.getDestroyBlyAmount(address)).toNumber()
                    }
                    else if (contract.tokenName === 'iwbtc') {
                        data = new BigNumber(data).minus(ComUtil.getDestroyBtcAmount(address)).toNumber()
                    }
                }
                setCoinBalance(data);
            }
        }
    }

    const onDepositChange = (numberVal) => {
        console.log("onDepositChange==",numberVal)
        setDepositFormNumber(numberVal);
    }
    const onDepositBlur = () => {
        if (depositFormNumber > coinBalance) {
            setDepositFormNumber('')
        }
    }

    const onDepositSend  = async() => {
        try {

            // if(contract.isIwFlag){
            //     alert("Temporarily Stoped Deposit.")
            //     return;
            // }

            const isValidateChk = validateNumber(depositFormNumber);
            if(!isValidateChk){
                return
            }

            let amountVal = ComUtil.numToString(new BigNumber(depositFormNumber));

            // console.log("!!! depositAuth : ", type, amount)
            // let contractID = contractList[name].pool;
            setLoading(true);
            // console.log('stake amount:' + amountVal)
            // console.log(contractID);
            const gasLimit = 120000;
            const {result, isSuccess} = await iostApi.onDepositSendBC(gasLimit, contract.pool, amountVal, contract.tokenName);
            console.log({isSuccess: isSuccess, result:result});
            if (isSuccess) {
                window.$message.success('Success');
                onClose()
            } else {
                window.$message.error('fail');
                let errorMessage = `${tMessage.failedToSend}`;
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        let error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = `${tMessage.lackOfIgas} ${gasLimit} \n${tMessage.chargeIgasTime}`;
                            if (error.message) {
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                }else if(typeof result === 'object') {
                    if(result.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else{
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                alert(errorMessage)
            }
            setLoading(false);
            // setDepositModal(false);
            onClose()
        } catch(err) {
            setLoading(false);
            console.error(err.message);
        }
    }

    const depositRatio = (radio) => {
        const v_balance = coinBalance * radio;
        const vv_balance = v_balance.toFixed(8);
        // onChange(vv_balance)

        setDepositFormNumber(vv_balance);
    }

    // const onDepositNumber = (value) => {
    //     onChange(value)
    // }

    const validateNumber = (value) => {
        setErrorMsg("");
        let numReg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,8})?$/;
        if (!value) {
            setErrorMsg(t('CannotEmpty'))
            return false;
        }
        if ((value + '').split('.').length > 2) {
            setErrorMsg(t('ErrorBalance'))
            return false;
        }
        if ((value + '').indexOf('.') > -1 && (value + '').split('.')[1] === '') {
            setErrorMsg(t('ErrorBalance'))
            return false;
        }
        if (value == 0) {
            setErrorMsg(t('insufficientBalance'))
            return false;
        }
        if (!numReg.test(value)) {
            setErrorMsg(t('ErrorBalance'))
            return false;
        }
        // if (value > coinBalance) {
        //     setDepositFormNumber('')
        //     setErrorMsg(t('ErrorBalance'))
        //     return false;
        // }

        return true;
    };

    // const onSend = () => {
    //     const isValidateChk = validateNumber(depositFormNumber);
    //     if(isValidateChk){
    //         onClick(depositFormNumber);
    //     }
    // }

    return (
        <Div minWidth={300}
            // bg={'background'}
            // px={20}
        >
            {/*<Flex height={56} bold fg={'grayText'} textAlign={'center'}>{title}</Flex>*/}
            <Div fontSize={20} bold textAlign={'center'} mb={10}>{`${coinBalance} ${ComUtil.coinName(contract.tokenName.toUpperCase())}`}</Div>
            <Div height={56} textAlign={'center'}>
                <InputNumber
                    style={{width:'100%'}}
                    disabled={loading}
                    min={0}
                    onChange={onDepositChange}
                    onBlur={onDepositBlur}
                    value={depositFormNumber}
                    autocomplete="off" />
            </Div>
            <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.25)} disabled={loading}>25%</Button>
                    <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.5)} disabled={loading}>50%</Button>
                    <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.75)} disabled={loading}>75%</Button>
                    <Button type="primary" shape="round" onClick={depositRatio.bind(this,1)} disabled={loading}>100%</Button>
                </Space>
            </Flex>
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button px={10} fg={'white'} bg={'primary'}  onClick={onClose}>{t('cancel')}</Button>
                    <Button type="primary" onClick={onDepositSend} disabled={status !== 1} loading={loading}>{t('Deposit2')}</Button>
                </Space>
            </Flex>
        </Div>
    );
};

export default Deposit;
