import React, {useEffect} from 'react';
import useCoinInfo from "~/hooks/useCoinInfo";
import {Div, Hr} from "~/styledComponents/shared";
import styled from "styled-components";
import useSize from "~/hooks/useSize";
import ComUtil from "~/util/ComUtil";
import moment from "moment-timezone";

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

const TotalHarvestedDon = (props) => {
    const {size, sizeValue} = useSize()

    const {coinInfo, refresh, loading} = useCoinInfo({delay:10000})
    const {totalUsd, totalHarvestedDonBalance, list: coins} = coinInfo
    
    return (

        <Box fg={'white'} py={25}
            // px={sizeValue(70, null,  30)}
            // minWidth={380}
             width={sizeValue('unset', null, '90%')}
             minWidth={sizeValue(400, null, 'unset')}
             px={20}
        >
            <Div>
                <Div fontSize={sizeValue(20, null,  17)} fw={500}>Total Value Locked (TVL)</Div>
                <Div fontSize={sizeValue(40, null,  30)} fw={700}>
                    {
                        loading ? '...' : `$ ${ComUtil.addCommas(totalUsd.toFixed(2))}`
                    }
                </Div>
            </Div>
            <Hr my={20}/>
            <Div>
                <Div fontSize={sizeValue(20, null,  17)} fw={500}>Total DON Distributed</Div>
                <Div fontSize={sizeValue(40, null,  30)} fw={700}>
                    {
                        loading ? '...' : `${ComUtil.addCommas(totalHarvestedDonBalance.toFixed(2))} DON`
                    }

                </Div>
                <Div fontSize={sizeValue(17, null, 16)} lighter>+ 2,000,000 DON (airdrop + swap)</Div>
            </Div>

        </Box>
    );
};

export default TotalHarvestedDon;
