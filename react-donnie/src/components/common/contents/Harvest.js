import React, {useState} from 'react';
import {Div, Flex, Span} from "~/styledComponents/shared";
import {Button, InputNumber, Space} from "antd";
import {useTranslation} from "react-i18next";
import useModal from "~/hooks/useModal";
import IostApi from "~/lib/iostApi";
import properties from "~/properties";

const {contractList} = properties;

const Harvest = ({
                    uniqueKey,
                     onClose,
                     donyBalance,
                 }) => {

    const {t} = useTranslation()
    const tMessage = t('message', {returnObjects: true})

    const [loading, setLoading] = useState(false)

    const contract = contractList[uniqueKey]

    const [errorMsg, setErrorMsg] = useState('')

    const onHarvestSendClick = async() => {
        try {

            if (donyBalance && donyBalance !== 0) {
                setLoading(true);
                let contractID = contract.pool;
                let gasLimit = 200000;  // gasLimit를 늘려줌

                const {result, isSuccess} = await IostApi.onHarvestSendBC(gasLimit, contractID);
                console.log({isSuccess: isSuccess, result:result});
                if (isSuccess) {
                    window.$message.success('Success');
                    onClose();
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
                                errorMessage = vFailedToSend;
                            } else {
                                errorMessage = result;
                            }
                        }
                    } else if(typeof result === 'object') {
                        if(result.status_code === 'BALANCE_NOT_ENOUGH') {
                            errorMessage = `${tMessage.lackOfIram}`;
                        } else{
                            errorMessage = `${tMessage.jetstreamFail}`;
                        }
                    }
                    alert(errorMessage)
                }
                setLoading(false);
                // onClose(false);
            }
        }catch(err){
            setLoading(false);
            console.error(err.message);
        }
    }

    return (
        <Div minWidth={300}
            // bg={'background'}
            // px={20}
        >
            {/*<Flex height={56} bold fg={'grayText'} textAlign={'center'}>{t('HarvestDONY')}</Flex>*/}
            <Div fontSize={20} mb={10} bold textAlign={'center'}>{`${donyBalance} ${window.$tokenName.toUpperCase()}`}</Div>
            <Div>{errorMsg && <Span fg={'danger'}>{errorMsg}</Span>}</Div>
            <Flex height={56} justifyContent={'center'}>
                <Space>
                    <Button px={10} onClick={onClose}>{t('cancel')}</Button>
                    <Button type="primary" loading={loading} onClick={onHarvestSendClick}>{t('get')}</Button>
                </Space>
            </Flex>
        </Div>
    );
};

export default Harvest;
