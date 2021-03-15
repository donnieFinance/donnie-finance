import React from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import styled, {css} from 'styled-components'
import useSize from "~/hooks/useSize";
import {Spin} from 'antd'
import {getValue} from "~/styledComponents/Util";

const box = css`
    position: relative;
    
    &::before {
            content: '';
            position: absolute;
            top:  ${props => props.size === 'sm' ? '8px' : '12px' };
            // top: 50%;
            // transform: translateY(-50%);
            left: -1px;
            width: 1px;
            height: ${props => props.size === 'sm' ? '24px' : '33px' };
            background-color: rgba(0,0,0,0.1); 
        }
`;

const BoxContainer = styled(Flex)`

    // & > div {
    //     min-width: ${getValue(80)};
    // }

    & > div:nth-child(2) {
        ${box};
    }
    & > div:nth-child(3) {
        ${box};
    }
    & > div:nth-child(4) {
        ${box};
    }
    
    
`;

const TimeCountDown = ({leftTime}) => {

    const {sizeValue, size} = useSize()

    return (
        <Div fontSize={sizeValue(42, 30)} fg={'donnie'} bold my={10}>
            {
                !leftTime ? <Spin /> :
                    <BoxContainer textAlign={'center'} size={size}>
                        <Div minWidth={sizeValue(100, 80)}>
                            <Div>{leftTime.day}</Div>
                            <Div fontSize={12}>DAYS</Div>
                        </Div>
                        <Div minWidth={sizeValue(100, 80)}>
                            <Div>{leftTime.hour}</Div>
                            <Div fontSize={12}>HOURS</Div>
                        </Div>
                        <Div minWidth={sizeValue(100, 80)}>
                            <Div>{leftTime.minutes}</Div>
                            <Div fontSize={12}>MINUTES</Div>
                        </Div>
                        <Div minWidth={sizeValue(100, 80)}>
                            <Div>{leftTime.seconds}</Div>
                            <Div fontSize={12}>SECONDS</Div>
                        </Div>
                    </BoxContainer>
            }
        </Div>
    )
}
export default TimeCountDown;