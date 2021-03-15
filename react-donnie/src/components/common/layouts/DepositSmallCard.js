import React from 'react';
import {Button, Div, Flex, Right, Img, Span} from "~/styledComponents/shared";
import {Spin} from "antd";
import ComUtil from "~/util/ComUtil";
import {HexEdge} from "~/styledComponents/shared/Shapes";
const Circle = ({bg}) => <Div bg={bg} width={10} height={10} rounded={'50%'} mr={10}></Div>

const DepositSmallCard = ({
                              isIwFlag,
                              status, startTime, endTime, duration,
                              name, img, mining, explain, total, usd, rate, buttonText, loading,
                              myStaked = true,
                              totalDon,
                              onDepositClick = () => null
                          }) => {
    return (
        <div>
            <Div height={21}>
                <Flex bg={'light'} fg={'dark'}
                      maxWidth={230}
                      minHeight={21}
                      px={10} style={{borderTopLeftRadius:5, borderTopRightRadius:5}}>
                    {
                        (status === null || status === undefined) ? null : (
                            <>
                                <Circle bg={status === 0 ? 'warning' : status === 1 ? '#11BD75' : 'danger'} />


                                {
                                    [-1].includes(status) && (
                                        <>
                                            Preparing
                                        </>
                                    )
                                }
                                {
                                    [0].includes(status) && (
                                        <>
                                            Coming soon
                                            <Right><Div>{ComUtil.countdown(ComUtil.leftTime(duration))}</Div></Right>
                                        </>
                                    )
                                }
                                {
                                    [1].includes(status) && (
                                        <>
                                            Running
                                            <Right>{ComUtil.countdown(ComUtil.leftTime(duration))}</Right>
                                        </>
                                    )
                                }
                                {
                                    [2].includes(status) && (
                                        <>
                                            Finished
                                        </>
                                    )
                                }

                            </>
                        )
                    }


                </Flex>
            </Div>
            <Flex relative
                //rounded={8}
                  style={{borderBottomLeftRadius: 5, borderTopRightRadius:5, borderBottomRightRadius: 5}}
                  bg={'white'} py={17} px={26} shadow={'lg'}>
                <Div flexGrow={1}>
                    <Flex lineHeight={29}>
                        {
                            isIwFlag ? (
                                <HexEdge width={40}>
                                    <Img src={img} width={25} height={25} alt={ComUtil.coinName(name)} />
                                </HexEdge>
                            ) : (
                                <Img src={img} width={40} alt={ComUtil.coinName(name)} />
                            )
                        }

                        {/*<Div width={28}>*/}
                        {/*    */}
                        {/*</Div>*/}
                        <Div ml={8} fontSize={16} bold>{ComUtil.coinName(name)}</Div>
                        {
                            loading && <Div fontSize={12} ml={10} fg={'info'}>{mining}</Div>
                        }

                    </Flex>
                    <Div pr={10}>
                        {
                            loading ? <Div pt={5}><Spin/></Div> : (
                                <>
                                    {
                                        ([0,3].includes(status) && explain) &&
                                        <Div mt={5}>
                                            {explain}
                                        </Div>
                                    }
                                    {
                                        ([1,2].includes(status) && total) &&
                                        <Div fg={'info'} mt={5}>
                                            <Span fontSize={20} fw={600}>{total}</Span>
                                            <Span fontSize={13} ml={8}>{usd}</Span>
                                        </Div>
                                    }
                                    {
                                        ([1,2].includes(status) && rate) &&
                                        <Div fontSize={13}>{rate}</Div>
                                    }

                                </>
                            )
                        }
                    </Div>

                </Div>
                <Right>
                    <Button height={38} px={13} bg={myStaked ? 'donnie' : 'primary'} fg={'white'}
                        //disabled={[0,2,3].includes(status)} //항상 클릭 되도록 변경
                            onClick={onDepositClick}>Deposit</Button>
                </Right>
            </Flex>
        </div>
    );
};

export default DepositSmallCard;
