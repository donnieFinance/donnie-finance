import React, {useState} from 'react';
import {Button, Space, InputNumber} from 'antd';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {withTranslation} from "react-i18next";

const WithDrawModal = ({
                           xCoin,

    isOpen, onClose, onClick, onChange,
    balance,
    withDrawFormNumber,
    isLoading, t
}) => {

    const [errorMsg, setErrorMsg] = useState('')

    const withDrawRatio = (e) => {
        const v_balance = balance * e;
        const vv_balance = v_balance.toFixed(8);
        onChange(vv_balance)
    }

    const onWithDrawNumber = (value) => {
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
        const isValidateChk = validateNumber(withDrawFormNumber);
        if(isValidateChk){
            onClick(withDrawFormNumber)
        }
    }

    return (
        <Modal
            title={t('withdraw')+' '+xCoin.toUpperCase()}
            visible={isOpen}
            onCancel={onClose}
            // bodyStyle={{padding: 0}}
            footer={null}
            width={'auto'}
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
                        onChange={onWithDrawNumber}
                        value={withDrawFormNumber}
                        autocomplete="off" />
                </Div>
                <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.25)}>25%</Button>
                        <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.5)}>50%</Button>
                        <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,0.75)}>75%</Button>
                        <Button type="primary" shape="round" onClick={withDrawRatio.bind(this,1)}>100%</Button>
                    </Space>
                </Flex>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button onClick={onClose}>{t('cancel')}</Button>
                        <Button type="primary" onClick={onSend}>{t('withdraw')}</Button>
                    </Space>
                </Flex>
            </Div>
        </Modal>
    );
};

export default withTranslation()(WithDrawModal);
