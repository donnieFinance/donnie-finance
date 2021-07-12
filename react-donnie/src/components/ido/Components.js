import {Button, Div, Flex, Img, Right, Input, Span} from "~/styledComponents/shared";
import React from "react";
import useWallet from "~/hooks/useWallet";
import ComUtil from "~/util/ComUtil";

const TokenBox = ({title, totalBalance, balance, img, tokenName = 'Select a currency', readOnly = false, onInputChange = () => null, showMax, onMaxClick = () => null}) => {
    const {address} = useWallet()
    return(
        <Div rounded={5} bg={'light'} p={13}>
            <Flex fontSize={14} fw={500}>
                <Div>{title}</Div>
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
                        <Div mt={20} bg={'light'} p={0} rounded={5} px={8} height={34}>
                            <Flex alignItems={'center'} justifyContent={'space-between'}  >
                                {
                                    img && <Img src={img} width={20} height={20} mt={-2}/>
                                }
                                <Span lineHeight={1.2} mx={8}>{tokenName ? ComUtil.getDisplayTokenName(tokenName) : 'Select a token'}</Span>
                            </Flex>
                        </Div>
                    </Flex>
                </Right>
            </Flex>
        </Div>
    )
}
export {
    TokenBox
}