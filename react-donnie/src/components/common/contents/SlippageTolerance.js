import React, {useState} from 'react';
import {Div, Flex, Button} from "~/styledComponents/shared";
import {Space} from "antd";
import {useTranslation} from "react-i18next";

const Rate = ({children, selected, onClick}) =>
    <Button px={8} py={5} rounded={10} minWidth={60} height={40}
            bold
            bg={selected? 'info' : 'light'} fg={selected ? 'white' : 'info'}
            onClick={onClick}
    >
        {children}
    </Button>

const RateStore = [0.1, 0.5, 1, 5, 10]

const SlippageTolerance = ({defaultRate, onChange}) => {

    const {t} = useTranslation()
    const [rate, setRate] = useState(defaultRate || 1)
    const onRateClick = (value) => {
        setRate(value)
        onChange(value)
    }
    return (
        <Div>
            <Div fg={'info'} bold>{t('slippageTolerance')}</Div>
            <Div my={8}>
                <Space>
                    {
                        RateStore.map((r, index) =>
                            <Rate key={`rate${index}`} selected={rate === r} onClick={onRateClick.bind(this,  r)}>{r}%</Rate>
                        )
                    }
                </Space>
            </Div>
            {
                // 일단제거, 향후에 router통해서 2중 swap하는 경우에 적용 필요할듯.
                // rate === 0.1 && (
                //     <Div fg={'danger'}>
                //         Your transaction may fail
                //     </Div>
                // )
            }
        </Div>
    );
};

export default SlippageTolerance;
