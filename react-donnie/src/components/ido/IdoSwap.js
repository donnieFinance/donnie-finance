import React, {useEffect, useState} from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import { Button } from 'antd';
import {useTranslation} from "react-i18next";
import useSize from "~/hooks/useSize";
import useWallet from "~/hooks/useWallet";
import {buyIdoToken} from '~/lib/idoApi'
import {TokenBox} from "~/components/ido/Components";
import {RiArrowDownLine} from "react-icons/ri";
import iostApi from "~/lib/iostApi";
import ImgIost from "~/assets/coin_iost.png";
import ImgHusd from "~/assets/coin_husd.png";
import BigNumber from "bignumber.js";
const IdoSwap = (props) => {
    const {idoContract, onClose} = props;
    const {t} = useTranslation()
    const {sizeValue} = useSize()
    const {address} = useWallet()
    const [errMsg, setErrMsg] = useState("");

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const tIdoMessage = t('idoMessage', {returnObjects: true})

    //from token
    const [tokenFrom, setTokenFrom] = useState({
        tokenBalance: 0,    //total balance
        tokenName: idoContract.payingToken,
        img: idoContract.payingToken.startsWith('iost')? ImgIost : ImgHusd,
        balance: ''
    })
    //to token
    const [tokenTo, setTokenTo] = useState({
        tokenBalance: 0,    //total balance
        tokenName: idoContract.tokenName,
        img: idoContract.img,
        balance: ''
    })
    const [buyIdoLoading, setBuyIdoLoading] = useState(false);

    // 지갑 irc 연결시 상태 랜더링
    useEffect(() => {
        getPayingTokenBalance();
    }, [address])

    const getPayingTokenBalance = async () => {
        let payingTokenBalance = 0;
        if(address) {
            payingTokenBalance = await iostApi.getTokenBalance({
                address: address,
                tokenName: idoContract.payingToken
            });
        }
        //balance 초기화
        setTokenFrom({
            ...tokenFrom,
            tokenBalance: payingTokenBalance
        })
    }

    //balance change
    const onBalanceChange = async (which, e) => {

        const minPay = parseInt(idoContract.minPay.replace('K', '000'));
        const maxPay = parseInt(idoContract.maxPay.replace('K', '000'));

        let {value} = e.target

        //console.log(tokenFrom);
        if(value > parseFloat(tokenFrom.tokenBalance)) {
            alert ("token is not enough")
            return;
        }

        if (which === 'from') {
            //balance 업데이트
            // 소수점 8째자리까지만 입력받기
            // const temp = value * 100000000
            // const temp2 = Math.floor(temp)
            // value = temp2 / 100000000
            const val = new BigNumber(value).decimalPlaces(8).toNumber();
            //const val = num.round(8, bigDecimal.RoundingModes.DOWN); // "123.6"
            //const val = new BigNumber(value).decimalPlaces(8).toFixed(8,1);
            setTokenFrom({
                ...tokenFrom,
                balance: val
            })
            updateEstimatedBalance('to', val)

            if(minPay > val || maxPay < val){
                setErrMsg("min : " + minPay + ", max : " + maxPay);
            }else{
                setErrMsg("");
            }
        }
    }

    const updateEstimatedBalance = (estimated, value) => {
        //console.log({estimated})
        const balance = parseFloat(value)
        if (estimated === 'to') {
            //0.0001 보다 작으면 안되도록 함
            if (!balance || balance <= 0.0001) {
                //balance 초기화
                setTokenTo({
                    ...tokenTo,
                    balance: ''
                })
                return
            }

            const amount = getCalculatedIdoAmount(balance)
            setTokenTo({
                ...tokenTo,
                balance: amount
            })
        }
    }

    const getCalculatedIdoAmount = (value) => {
        if (!value) {
            return 0
        }
        const balance = new BigNumber(value);
        return balance.div(idoContract.idoPrice).toFixed(4);
    }

    const onMaxClick = () => {
        const minPay = parseInt(idoContract.minPay.replace('K', '000'));
        const maxPay = parseInt(idoContract.maxPay.replace('K', '000'));

        let fromBalance = tokenFrom.tokenBalance;
        if( fromBalance > maxPay) {
            fromBalance = maxPay;
        }

        setTokenFrom({
            ...tokenFrom,
            balance: fromBalance
        });


        if(minPay > fromBalance || maxPay < fromBalance){
            setErrMsg("min : " + minPay + ", max : " + maxPay);
        }else{
            setErrMsg("");
        }

        //To 값 구하기
        const toAmount = getCalculatedIdoAmount(fromBalance);
        setTokenTo({
            ...tokenTo,
            balance: toAmount
        });
    }


    const onBuyIdoToken = async() => {
        setBuyIdoLoading(true);
        const {result, isSuccess} = await buyIdoToken(idoContract.buyIdoContract, idoContract.payingToken, idoContract.tokenName, tokenFrom.balance);

        if (isSuccess) {
            setBuyIdoLoading(false);
            //setLoadingState('success')
            window.$message.success('Successfully Requested.');
            onClose(true);
        }else{
            setBuyIdoLoading(false);
            window.$message.error('failed');
            let errorMessage = "";

            if (typeof result === 'string') {
                if (result.indexOf('{') > -1) {
                    const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))

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
            } else if (typeof result === 'object') {
                if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                    errorMessage = `${tMessage.lackOfIram}`;
                }else if (result.status_code === 'RUNTIME_ERROR') {

                    //20210621 추가.iwallet에러메시지 파싱. (Error: ~ \n 까지 파싱)
                    if (result.message && result.message.indexOf('Error:') > 0) {
                        let errMsgEnd = result.message.indexOf('\n', result.message.indexOf('Error:'));
                        errorMessage = result.message.substring(result.message.indexOf('Error:')+6, errMsgEnd);
                    }else {
                        errorMessage = `${tMessage.failedToSend}`;
                    }
                } else{
                    errorMessage = `${tIdoMessage.jetstreamIdoFail}`;
                }
            }
            if(errorMessage) {
                alert(errorMessage);
            }
        }
    }

    //Swap 버튼의 상태값 리턴
    const getSwapButtonErrorText = () => {  //참고 Swap.js
        const buttonState = {
            text: 'Purchase Request',// to IDO Token',
            errMsg: '',
            disabled: true
        }

        if(!address){
            buttonState.disabled = false
        }

        // 버튼 활성화  (20K ~ 100K 사이에만 활성화)
        const minPay = idoContract.minPay.replace('K', '000');
        const maxPay = idoContract.maxPay.replace('K', '000');
        if(parseInt(minPay) <= tokenFrom.balance && tokenFrom.balance <= parseInt(maxPay)) {
            buttonState.disabled = false
        }
        return buttonState;
    }

    const buttonState = getSwapButtonErrorText();

    return (
        <Div>
            <TokenBox
                title={'From'}
                totalBalance={tokenFrom.tokenBalance}
                img={tokenFrom.img}
                tokenName={tokenFrom.tokenName}
                balance={tokenFrom.balance}
                onInputChange={onBalanceChange.bind(this, 'from')}
                showMax={true}
                onMaxClick={onMaxClick}
            />

            <Flex justifyContent={'center'} py={13}>
                <RiArrowDownLine size={20}/>
            </Flex>

            <TokenBox
                title={'To'}
                totalBalance={tokenTo.tokenBalance}
                img={tokenTo.img}
                tokenName={tokenTo.tokenName}
                balance={tokenTo.balance}
                onInputChange={onBalanceChange.bind(this, 'to')}
                showMax={false}
                readOnly={true}
            />

            {
                errMsg && <Div pt={20} fg={'red'}>{errMsg}</Div>
            }

            {/* Swap Button */}
            <Div pt={20}>
                <Button bg={'primary'} fg={'white'}
                        block rounded={5} bold
                        fontSize={15} height={48}
                        onClick={onBuyIdoToken}
                        loading={buyIdoLoading}
                        disabled={buttonState.disabled}>
                    {
                        buttonState.text
                    }
                </Button>
            </Div>
        </Div>
    );
};
export default IdoSwap;