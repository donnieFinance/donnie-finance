import React from 'react';
import {Div, Hr} from "~/styledComponents/shared";
import styled from "styled-components";
import useSize from "~/hooks/useSize";
import ComUtil from "~/util/ComUtil";
import {useRecoilState} from "recoil";
import {liquidityInfo} from "~/hooks/atomState";
const Box = styled(Div)`
    
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 50px;
    font-weight: 400;
    border: 1px solid white;
    position: relative;
    // left: 50%;
    // width: 300px;
    // max-width: 90%;
    // transform: translateX(-50%);
    text-align: center;
    // padding: 25px 20px;
    border-radius: 10px;
    
    box-shadow: 2px 2px 8px rgba(0,0,0, 0.4);
    
    animation: timeInfoAni 5s ease-in-out infinite;
    
    // margin-bottom: 90px;
`


const TotalLiquidity = (props) => {

    const [lpInfo] = useRecoilState(liquidityInfo)
    const {size, sizeValue} = useSize()

    const {totalCurrentSupply, totalCurrentPrice, timesOfCall, loading, list} = lpInfo

    return (

        <Box fg={'white'} py={25}
            // px={sizeValue(70, null,  30)}
            // minWidth={380}
             width={sizeValue('unset', null, '90%')}
             minWidth={sizeValue(400, null, 'unset')}
             px={20}
        >
            <Div>
                <Div fontSize={sizeValue(20, null,  17)} fw={500}>Total Liquidity</Div>
                <Div fontSize={sizeValue(40, null,  30)} fw={700}>
                    {
                        loading ? '...' : `$ ${totalCurrentPrice ? ComUtil.addCommas(totalCurrentPrice.toFixed(2)):0}`
                    }
                </Div>
            </Div>
            <Hr my={20}/>
            <Div>
                <Div fontSize={sizeValue(20, null,  17)} fw={500}>Total Transaction</Div>
                <Div fontSize={sizeValue(40, null,  30)} fw={700}>
                    {
                        loading ? '...' : `${ComUtil.addCommas(timesOfCall)}`
                    }
                </Div>
            </Div>
        </Box>
    );
};

export default TotalLiquidity;
