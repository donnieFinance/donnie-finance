import React from 'react';
import {Div} from "~/styledComponents/shared";
import {HeartBeat} from '~/styledComponents/shared/AnimationLayouts'
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import useSize from "~/hooks/useSize";

const Box = styled(Div)`
    
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 50px;
    font-weight: 400;
    border: 1px solid white;
    position: relative;
    left: 50%;
    // width: 300px;
    // max-width: 90%;
    transform: translateX(-50%);
    text-align: center;
    padding: 50px 20px;
    border-radius: 10px;
    
    box-shadow: 2px 2px 8px rgba(0,0,0, 0.4);
    
    // animation: timeInfoAni 5s ease-in-out infinite;
    
    margin-bottom: 90px;
`

const TargetLaunch = ({quarter}) => {
    const {sizeValue} = useSize()
    return (
        <Box width={sizeValue(400, null, '90%')}>
            <Div fontSize={20} fg={'light'}>Target Launch</Div>
            <Div fontSize={50} fg={'white'}><HeartBeat play duration={2} delay={1}>{quarter}</HeartBeat></Div>
        </Box>
    );
};

export default TargetLaunch;
