import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {Div, Flex, Hr, Span} from "~/styledComponents/shared";
import {Button, InputNumber, Space} from "antd";
import ComUtil from "~/util/ComUtil";
import BigNumber from "bignumber.js";
import IostApi from "~/lib/iostApi";
import {SymbolGroup} from "~/components/exchange/Components";
import properties from "~/properties";

const LiquidityWithdraw = ({swapPairKey, data, onClose}) => {
    const {t} = useTranslation()

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const tExchange = t('exchange', {returnObjects: true})

    const [withDrawFormNumber,setWithDrawFormNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [balance,setBalance] = useState(data ? data.lpTokenBalance:0)

    const [token1Balance,setToken1Balance] = useState(0)
    const [token2Balance,setToken2Balance] = useState(0)

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
        if (value === 0) {
            setErrorMsg(t('insufficientBalance'))
            return false;
        }
        if (!numReg.test(value)) {
            setErrorMsg(t('ErrorBalance'))
            return false;
        }
        if (value < 0.000001) {
            setErrorMsg(t('minimumAmount', {x: '0.000001'}))
            return false;
        }
        if (value > balance) {
            onWithDrawChange(balance)
            return false;
        }


        return true;
    };

    const onWithDrawChange = (numberVal) => {
        const v_lpTokenBalance = data.lpTokenBalance;
        if(numberVal <= v_lpTokenBalance) {
            setWithDrawFormNumber(numberVal);
        }else{
            setWithDrawFormNumber(0);
        }

        if(numberVal <= v_lpTokenBalance) {

            const v_lpToken1Balance = data.symbol1Balance;
            const v_lpToken2Balance = data.symbol2Balance;

            const a = (numberVal / v_lpTokenBalance) * v_lpToken1Balance
            const b = (numberVal / v_lpTokenBalance) * v_lpToken2Balance

            setToken1Balance(a.toFixed(8));
            setToken2Balance(b.toFixed(8));
        }else{
            setToken1Balance(0);
            setToken2Balance(0);
        }
    }

    const onWithDrawSendClick  = async() => {
        try {

            const isValidateChk = validateNumber(withDrawFormNumber);

            if(isValidateChk){
                let amountVal = ComUtil.numToString(new BigNumber(withDrawFormNumber));
                setLoading(true);
                console.log({amountVal})

                //swapPairKey, amount
                const {result, isSuccess} = await IostApi.exchangeWithdrawLiquidityWithLp(swapPairKey, amountVal);
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
                                let vFailedToSend = tMessage.failedToSend;
                                if(error.message){
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
                        }else if (result.status_code === 'RUNTIME_ERROR') {
                            errorMessage = `${tMessage.failedToSend}`;
                        }else{
                            errorMessage = `${tMessage.jetstreamFail}`;
                        }
                    }
                    alert(errorMessage)
                }
                setLoading(false);
            }
        } catch(err) {
            setLoading(false);
            console.error(err.message);
        }
    }
    return (
        <Div minWidth={300}>
            {/*<Flex fontSize={20} bold mb={10} height={30}>*/}
            {/*    <SymbolGroup*/}
            {/*        symbol1={data.symbol1}*/}
            {/*        symbol2={data.symbol2}*/}
            {/*        size={30}*/}
            {/*    />*/}
            {/*    <Span mt={5} ml={10}>{`${data.dpLpTokenName}`}</Span>*/}
            {/*</Flex>*/}


            <Div fontSize={20} bold textAlign={'center'} mb={10}>{`Balance : ${data.lpTokenBalance}`}</Div>
            <Div textAlign={'center'} mb={10}>
                {`${data.symbol1.toUpperCase()} : ${data.symbol1Balance}`} <br/>
                {`${data.symbol2.toUpperCase()} : ${data.symbol2Balance}`} <br/>
            </Div>
            <Div height={56} textAlign={'center'}>
                <InputNumber
                    style={{width:'100%'}}
                    min={0}
                    onChange={onWithDrawChange}
                    value={withDrawFormNumber}
                    disabled={loading}
                    autocomplete="off"
                    placeholder={'Balance'}
                />
            </Div>
            <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
            <Flex justifyContent={'center'}>
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
                    <Button type="primary" loading={loading} onClick={onWithDrawSendClick}>{tExchange.removeLiquidity}</Button>
                </Space>
            </Flex>

            <Hr my={20}/>

            {/* 아래 */}
            <Flex mt={10} bold flexDirection={'column'} justifyContent={'center'} py={10} textAlign={'center'} bg={'white'}
                  // bc={"secondary"}
                  lineHeight={30}
                  // bgFrom={'white'} bgTo={'light'}
            >
                <Flex>
                    <img src={properties.tokenImages[data.symbol1]} width={20} alt=""/>
                    <Div ml={10}>{`${data.symbol1.toUpperCase()} : ${token1Balance}`}</Div>
                </Flex>
                <Flex>
                    <img src={properties.tokenImages[data.symbol2]} width={20} alt=""/>
                    <Div ml={10}>{`${data.symbol2.toUpperCase()} : ${token2Balance}`}</Div>
                </Flex>
            </Flex>
        </Div>
    );
};

export default LiquidityWithdraw;
