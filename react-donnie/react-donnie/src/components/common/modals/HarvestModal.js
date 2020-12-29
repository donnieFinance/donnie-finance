import React, {useState} from 'react';
import {Button, Space, InputNumber} from 'antd';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Modal} from "antd";
import {withTranslation} from "react-i18next";

const HarvestModal = ({
    isOpen, onClose, onClick,
    balance,
    receiveDonyAmt,
    isLoading, t
}) => {

    const [errorMsg, setErrorMsg] = useState('')

    const onSend = () => {
        if (receiveDonyAmt && receiveDonyAmt !== 0) {
            onClick();
        }
    }

    return (
        <Modal
            title={t('HarvestDONY')}
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
                {/*<Flex height={56} bold fg={'grayText'} textAlign={'center'}>{t('HarvestDONY')}</Flex>*/}
                <Div fontSize={20} mb={10} bold textAlign={'center'}>{balance}</Div>
                <Div height={56} textAlign={'center'}>
                    <InputNumber
                        style={{width:'100%'}}
                        min={0}
                        disabled={true}
                        value={receiveDonyAmt}
                        autocomplete="off" />
                </Div>
                <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
                <Flex height={56} justifyContent={'center'}>
                    <Space>
                        <Button px={10} onClick={onClose}>{t('cancel')}</Button>
                        <Button type="primary" loading={isLoading} onClick={onSend}>{t('get')}</Button>
                    </Space>
                </Flex>
            </Div>
        </Modal>
    );
};

export default withTranslation()(HarvestModal);
