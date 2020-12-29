import React, {useState} from 'react';
import {Button, Space, InputNumber} from 'antd';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {withTranslation} from "react-i18next";

const HarvestWithDrawModal = ({
    isOpen, onClose, onClick, isLoading,
    stakeBalance, donyBalance, xCoin, tokenName,
    t
}) => {

    const [errorMsg, setErrorMsg] = useState('')

    const onSend = () => {
        onClick()
    }

    return (
        <Modal
            title={`${t('HarvestWithdraw')}${xCoin.toUpperCase()}`}
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
                <Div fontSize={20}>
                    <Div bold textAlign={'center'}>{stakeBalance} {xCoin.toUpperCase()}</Div>
                    <Div bold textAlign={'center'}>{donyBalance} {tokenName.toUpperCase()}</Div>
                </Div>

                <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button onClick={onClose}>{t('cancel')}</Button>
                        <Button type="primary" loading={isLoading} onClick={onSend}>{t('HarvestWithdraw')}</Button>
                    </Space>
                </Flex>
            </Div>
        </Modal>
    );
};

export default withTranslation()(HarvestWithDrawModal);
