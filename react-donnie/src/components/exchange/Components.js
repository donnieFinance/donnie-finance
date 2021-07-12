import {Button, Div, Flex, Img, Right, Input, Span, SymbolIcon} from "~/styledComponents/shared";
import React from "react";
import properties from "~/properties";
import {FaChevronDown} from "react-icons/fa";
import useWallet from "~/hooks/useWallet";
import {Input as AntdInput, Modal, Tooltip} from "antd";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import ComUtil from "~/util/ComUtil";

const StyledInput = styled(AntdInput)`
    background-color: ${color.light};
    color: ${color.info};
    border: 0;
    height: ${getValue(34)};
    font-size: ${getValue(16)};
    padding: 0;
    &:hover {
        border: 0;
    }
`;

const Heading = ({title, desc}) =>
    <Div px={24} py={20}>
        <Div fontSize={18} bold>
            {title}
        </Div>
        <Div fg={'darkMid'}>
            {desc}
        </Div>
    </Div>

const TokenBox = ({title, totalBalance, balance, img, tokenName = 'Select a currency', estimated, readOnly = false, onInputChange = () => null, onTokenClick = () => null, showMax, onMaxClick = () => null}) => {
    const {address} = useWallet()
    return(
        <Div rounded={5} bg={'light'} p={13}
             // bc={title.toUpperCase() === 'FROM' && 'info'}
        >
            <Flex fontSize={14} fw={500}>
                <Div>{title}
                {estimated && <Span ml={2}>(estimated)</Span>}</Div>
                <Right>Balance: {totalBalance}</Right>
            </Flex>
            <Flex fontSize={16} mt={10}>
                <Div flexGrow={1}>
                    <Input
                        type={'number'}
                        inputMode="numeric" pattern="[0-9]*"
                        step="0.1"
                        block
                        bold
                        placeholder={0.0}
                        bc={'light'}
                        bg={'light'}
                        fg={'info'}
                        height={'100%'}
                        p={0}
                        height={34}
                        style={{fontSize:16, cursor: readOnly ? 'not-allowed' : null}}
                        readOnly={readOnly}
                        value={balance}
                        onChange={onInputChange}
                    />
                </Div>
                <Right flexShrink={0} fontSize={14}>
                    <Flex>
                        {
                            (address && showMax && tokenName) && (
                                <Button bold fg={'info'} bg={'light'} mr={8} mt={2} height={34} px={8} rounded={5} onClick={onMaxClick}>
                                    <Flex>
                                        MAX
                                    </Flex>
                                </Button>
                            )
                        }
                        <Button bg={'light'} p={0} onClick={onTokenClick} rounded={5} px={8} height={34}>
                            <Flex alignItems={'center'} justifyContent={'space-between'}  >
                                {
                                    img && <Img src={img} width={20} height={20} mt={-2}/>
                                }
                                <Span lineHeight={1.2} mx={8}>{tokenName ? ComUtil.getDisplayTokenName(tokenName) : 'Select a token'}</Span>
                                <FaChevronDown />
                            </Flex>
                        </Button>
                    </Flex>
                </Right>
            </Flex>
        </Div>
    )
}


const SymbolGroup = ({symbol1, symbol2, size = 30}) =>
    <Tooltip placement="topLeft" title={<Span bold>{symbol1.toUpperCase()}/{symbol2.toUpperCase()}</Span>}>
        {/*<img src={ComUtil.getLpTokenIcon(data.symbol1,data.symbol2)} width={50}/>*/}
        <Flex cursor={1}>
            <SymbolIcon shadow={'sm'} src={properties.tokenImages[symbol1]} alt={symbol1} width={size} zIndex={1}/>
            <SymbolIcon shadow={'sm'} src={properties.tokenImages[symbol2]} alt={symbol2} width={size} ml={-7}/>
        </Flex>
    </Tooltip>

export {
    Heading,
    TokenBox,
    SymbolGroup
}