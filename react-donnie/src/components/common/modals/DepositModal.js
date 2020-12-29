import React, {useState} from 'react';
import {Button, Space, InputNumber} from 'antd';
import { Input, Div, Flex, Img, Right, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {withTranslation} from "react-i18next";

const DepositModal = ({
                          xCoin,
    // title,
    isOpen, onClose, onClick, onChange,
    balance, stakeStatus,
    depositFormNumber,
    isLoading,
    t
}) => {

    const [errorMsg, setErrorMsg] = useState('')

    const depositRatio = (e) => {
        const v_balance = balance * e;
        const vv_balance = v_balance.toFixed(8);
        onChange(vv_balance)
    }

    const onDepositNumber = (value) => {
        onChange(value)
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
            onChange(balance)
            return false;
        }

        return true;
    };

    const onSend = () => {
        const isValidateChk = validateNumber(depositFormNumber);
        if(isValidateChk){
            onClick(depositFormNumber);
        }
    }

    return (
        <Modal
            title={t('Deposit2')+' '+xCoin.toUpperCase()}
            visible={isOpen}
            onCancel={onClose}
            // bodyStyle={{padding: 0}}
            footer={null}
            width={'auto'} //UserLogin.js 의 width 값과 같이 맞춰야 합니다
            centered={true}
            focusTriggerAfterClose={false}
            getContainer={false}
            maskClosable={false}
        >
            <Div minWidth={300}
                 // bg={'background'}
                 // px={20}
            >
                {/*<Flex height={56} bold fg={'grayText'} textAlign={'center'}>{title}</Flex>*/}
                <Div fontSize={20} bold textAlign={'center'} mb={10}>{`${balance} ${xCoin.toUpperCase()}`}</Div>
                <Div height={56} textAlign={'center'}>
                    <InputNumber
                        style={{width:'100%'}}
                        min={0}
                        onChange={onDepositNumber}
                        value={depositFormNumber}
                        autocomplete="off" />
                </Div>
                <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.25)}>25%</Button>
                        <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.5)}>50%</Button>
                        <Button type="primary" shape="round" onClick={depositRatio.bind(this,0.75)}>75%</Button>
                        <Button type="primary" shape="round" onClick={depositRatio.bind(this,1)}>100%</Button>
                    </Space>
                </Flex>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button px={10} fg={'white'} bg={'primary'}  onClick={onClose}>{t('cancel')}</Button>
                    {
                        stakeStatus === 1 &&
                        <Button type="primary" onClick={onSend} loading={isLoading}>{t('Deposit2')}</Button>
                    }
                    </Space>
                </Flex>
            </Div>
        </Modal>
    );
};

export default withTranslation()(DepositModal);
