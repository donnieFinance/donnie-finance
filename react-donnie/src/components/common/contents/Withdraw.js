import React, {useState} from 'react';
import {useTranslation, withTranslation} from "react-i18next";
import properties from "~/properties";
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Button, InputNumber, Space} from "antd";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";
import IostApi from "~/lib/iostApi";

const {contractList} = properties;

const Withdraw = ({
                      uniqueKey,
                      status,
                      onClose,
                      balance,
                  }) => {
    const contract = contractList[uniqueKey]
    console.log({contract})
    const {t} = useTranslation()
    const tMessage = t('message', {returnObjects: true})
    const [withDrawFormNumber,setWithDrawFormNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const withDrawRatio = (e) => {
        const v_balance = balance * e;
        const vv_balance = v_balance.toFixed(8);
        onWithDrawChange(vv_balance)
    }

    const validateNumber = (value) => {
        setErrorMsg("");
        let numReg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,8})?$/;
        if (value === '') {
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
        if (value > balance) {
            onWithDrawChange(balance)
            return false;
        }

        return true;
    };

    // const onSend = () => {
    //     const isValidateChk = validateNumber(withDrawFormNumber);
    //     if(isValidateChk){
    //         onWithDrawSend(withDrawFormNumber)
    //     }
    // }

    const onWithDrawChange = (numberVal) => {
        setWithDrawFormNumber(numberVal);
    }


    const onWithDrawSendClick  = async() => {
        try {

            const isValidateChk = validateNumber(withDrawFormNumber);

            if(isValidateChk){
                let amountVal = ComUtil.numToString(new BigNumber(withDrawFormNumber));
                let contractID = contract.pool;
                setLoading(true);

                const gasLimit = 300000; // 기존 120000 -> 토큰포켓에 가스 비용 300000 사용됨
                const {result, isSuccess} = await IostApi.onWithDrawSendBC(gasLimit, contractID, amountVal);
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
                // setWithDrawModal(false);
            }
        } catch(err) {
            setLoading(false);
            console.error(err.message);
        }
    }
    return (
        <Div minWidth={300}
            // bg={'background'}
            // px={20}
        >
            {/*<Flex height={56} bold fg={'grayText'} textAlign={'center'}>{title}</Flex>*/}
            <Div fontSize={20} bold textAlign={'center'} mb={10}>{`${balance} ${contract.tokenName.toUpperCase()}`}</Div>
            <Div height={56} textAlign={'center'}>
                <InputNumber
                    style={{width:'100%'}}
                    min={0}
                    onChange={onWithDrawChange}
                    value={withDrawFormNumber}
                    disabled={loading}
                    autocomplete="off" />
            </Div>
            <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.25)} disabled={loading}>25%</Button>
                    <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.5)} disabled={loading}>50%</Button>
                    <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.75)} disabled={loading}>75%</Button>
                    <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,1)} disabled={loading}>100%</Button>
                </Space>
            </Flex>
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button onClick={onClose}>{t('cancel')}</Button>
                    <Button type="primary" loading={loading} onClick={onWithDrawSendClick}>{t('withdraw')}</Button>
                </Space>
            </Flex>
        </Div>
    );
};

export default Withdraw;
