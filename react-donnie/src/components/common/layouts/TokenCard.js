import React from 'react';

import properties from "~/properties";
import {Div, Flex, Right, Img} from "~/styledComponents/shared";
import useTokenBalance from "~/hooks/useTokenBalance";
import ComUtil from "~/util/ComUtil";
import styled from "styled-components"
import {color} from "~/styledComponents/Properties";
import {Spin} from "antd";
import useWallet from "~/hooks/useWallet";
import useInterval from "~/hooks/useInterval";

const Item = styled(Div)`
    position: relative;
    cursor: pointer;
    &:hover {
            background-color: ${color.light};
        }
    ${props => props.selected ? `
        // &::after {
        //     content: '';
        //     position: absolute;
        //     top: 0;
        //     left: 0;
        //     right: 0;
        //     bottom: 0;
        //     background-color: rgba(0,0,0, 0.03);    
        // }
        //
        // cursor: unset;
       
    ` : `
    
        &:hover {
            background-color: ${color.light};
        }
        
    `}
    // color: ${color.lightText};
    ${props => props.disabled && `
        color: ${color.lightText};
    `}
`;

const TokenCard = (props) => {
    const {img, tokenName, fullName, tokenAddress, selected, disabled, onClick} = props
    const [tokenBalance, refresh] = useTokenBalance(tokenName)
    const {address} = useWallet()

    //10초에 한번씩 balance 갱신
    useInterval(() => {
        refresh()
    }, 10000)

    const onHandleClick = () => {
        if (disabled) return

        onClick({
            //Prigin props
            img, tokenName, fullName, tokenAddress, selected, disabled,
            //Add balance
            tokenBalance: address ? tokenBalance : 0
        })
    }

    // if (tokenBalance === undefined) return 'loading'

    return (
        <Item selected={selected} disabled={disabled} onClick={onHandleClick}>
            <Flex p={13} px={24}>
                <Flex>
                    <Div><Img width={30} src={img} alt={tokenName} /> </Div>
                    <Div ml={10}>
                        <Div fontSize={18}
                             fg={selected && 'info'}
                        >{ComUtil.getDisplayTokenName(tokenName)}</Div>
                        <Div fg={selected && 'lightInfo'}>{fullName}</Div>
                    </Div>
                </Flex>
                {
                    address && (
                        <Right
                            fg={selected && 'info'}
                        >
                            {tokenBalance === undefined ? <Spin/> : tokenBalance}
                        </Right>
                    )
                }
            </Flex>
        </Item>

    );
};

export default TokenCard;