import React from 'react';
import {Div} from "~/styledComponents/shared";
import styled from 'styled-components'
import useSize from "~/hooks/useSize";
import {Spin} from 'antd'
const TimeCountDown = ({leftTime}) => {

    const {sizeValue} = useSize()

    return (
        <Div fontSize={sizeValue(42, 30)} fg={'donnie'} bold my={10}>
            {
                !leftTime ? <Spin /> : `${leftTime.day} : ${leftTime.hour} : ${leftTime.minutes} : ${leftTime.seconds}`
            }
        </Div>
    )
}
export default TimeCountDown;