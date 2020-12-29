import React from 'react';
import {Button, Div, Flex, Right, Img, Span} from "~/styledComponents/shared";

const DepositSmallCard = ({

                              number, //순위
                              img = '',
                              name = '',
                              explain,
                              mining,
                              rate,
                              total,
                              usd,
                              buttonText,
                              loading,

                              onClick = () => null
                          }) => {
    return (
        <Flex relative rounded={8} bg={'white'} py={17} px={26} shadow={'lg'}>
            {
                number <= 3 && (
                    <Flex
                        absolute width={35} height={27}
                        top={-5}
                        right={-5}
                        bg={number === 1 ? 'info' : 'secondary'}
                        fg={'white'}
                        justifyContent={'center'}
                        // rounded={10}
                        fontSize={16}
                        shadow={'sm'}
                        bold
                        rounded={3}
                    >
                        {number}
                    </Flex>
                )
            }
            <Div>
                <Flex lineHeight={29}>
                    <Div width={28}><Img src={img} alt={name} /></Div>
                    <Div ml={8} fontSize={16} bold>IOST</Div>
                    <Div fontSize={12} ml={10} fg={'info'}>{mining}</Div>
                </Flex>
                {
                    explain &&
                    <Div mt={5}>
                        {explain}
                    </Div>
                }
                {
                    (total || usd) &&
                    <Div fg={'info'} mt={5}>
                        <Span fontSize={20} fw={600}>{total}</Span>
                        <Span fontSize={13} ml={8}>{usd}</Span>
                    </Div>
                }
                <Div fontSize={13}>{rate}</Div>
            </Div>
            <Right>
                <Button height={38} px={13} bg={'primary'} fg={'white'} onClick={onClick}>Deposit</Button>
            </Right>
        </Flex>
    );
};

export default DepositSmallCard;
