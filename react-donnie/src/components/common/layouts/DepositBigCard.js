import React, {useState} from 'react';
import {Button, Div, Flex, Img, RoundedCard, SymbolIcon} from "~/styledComponents/shared";
import {HexEdge} from '~/styledComponents/shared/Shapes'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import aniKey from "~/styledComponents/Keyframes";

import { Skeleton } from 'antd';
import {color} from "~/styledComponents/Properties";
import {BsChevronDown, BsChevronUp} from 'react-icons/bs'
import ImgHexEdgeLine from '~/assets/hex_edge.svg'

import properties from "~/properties";
import {SymbolGroup} from "~/components/exchange/Components";
const Content = styled(Flex)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
    justify-content: center;
`;

const Circle = ({bg}) => <Div bg={bg} width={10} height={10} rounded={'50%'} mr={10}></Div>

const DepositBigCard = ({
                            tokenName,
                            status, startTime, endTime, duration,
                            name, img, tokenType, mining, explain, total, usd, rate, buttonText, loading,
                            myStaked = true,
                            totalDon,
                            period,
                            onDepositClick = () => null
                        }) => {

    const [showDetail, setShowDetail] = useState(false)

    const onDetailClick = () => {
        setShowDetail(!showDetail)
    }

    const Symbol = () => {
        if (tokenType === 'iw') {
            return(
                <HexEdge>
                    <Img src={img} width={30} height={30} alt={ComUtil.coinName(name)}/>
                </HexEdge>
            )
        }else if (tokenType === 'lp') {
            const lpTokenNames = ComUtil.getLpTokenNames(tokenName)
            return <SymbolGroup symbol1={lpTokenNames[0]} symbol2={lpTokenNames[1]} size={40} />
        }else {
            return <Img src={img} width={40} height={40} alt={ComUtil.coinName(name)}/>
        }
    }

    return (
        <Div relative width={220} m={16}>

            <RoundedCard relative shadow={'lg'}>

                <Div bg={[2].includes(status)?'lightgray':'light'}>
                    <Flex
                        pl={15}
                        fledDirection={'column'}
                        alignItems={'flex-start'}
                        pt={12}
                        height={54}
                        // bg={'info'} fg={'white'} rounded={3} top={0} left={0} zIndex={1} width={120} textAlign={'center'}
                    >
                        {
                            (status === null || status === undefined) ? null : (
                                <>
                                    {
                                        [-1].includes(status) && (
                                            <Div>
                                                <Flex><Circle bg={'secondary'} />Preparing</Flex>
                                            </Div>
                                        )
                                    }
                                    {
                                        [0].includes(status) && (
                                            <Div>
                                                <Flex><Circle bg={'warning'} />Coming soon</Flex>
                                                <Div ml={18}>{ComUtil.countdown(ComUtil.leftTime(duration))}</Div>
                                            </Div>
                                        )
                                    }
                                    {
                                        [1].includes(status) && (
                                            <Div>
                                                <Flex><Circle bg={'#11BD75'} />Running</Flex>
                                                <Div ml={18}>{ComUtil.countdown(ComUtil.leftTime(duration))}</Div>
                                            </Div>
                                        )
                                    }
                                    {
                                        [2].includes(status) && (
                                            <Flex>
                                                <Circle bg={'danger'} />Finished
                                            </Flex>
                                        )
                                    }
                                </>
                            )
                        }
                    </Flex>
                    <Flex flexDirection={'column'} justifyContent={'center'} height={130}>
                        <Symbol />
                        <Div fontSize={20} mt={5} bold>{
                            ComUtil.coinName(name)
                        }</Div>
                    </Flex>
                </Div>

                <Div bg={[2].includes(status)?'light':'white'}>
                    <Flex p={15} minHeight={186} flexDirection={'column'}>
                        {
                            loading ? <Skeleton active /> :
                                <>
                                    <Flex flexDirection={'column'} flexGrow={1} mb={15}>
                                        {
                                            <Content fontSize={14} textAlign={'center'}>{mining}</Content>
                                        }
                                        {/* 예치하여 유동성을 공급함으로써 DON을 획득합니다. */}
                                        {
                                            ([-1,0,3].includes(status) && explain) && <Content fontSize={14} textAlign={'center'} flexGrow={1}>{explain}</Content>
                                        }
                                        {
                                            ([1,2].includes(status) && total) && <Content fontSize={30} fg={[2].includes(status)?'gray':'black'} textAlign={'center'} bold>{total}</Content>
                                        }
                                        {
                                            ([1].includes(status) && usd) && <Content fontSize={14} textAlign={'center'}>{usd}</Content>
                                        }
                                        {
                                            ([1].includes(status) && rate) && <Content fontSize={14} textAlign={'center'}>{rate}</Content>
                                        }
                                    </Flex>
                                    <Div mt={'auto'}>

                                        {
                                            status !== null && (
                                                <Content>
                                                    <Button bg={myStaked ? 'donnie' : 'primary'} fg={'white'} block
                                                        // disabled={[0,3].includes(status)}
                                                            onClick={onDepositClick} px={10}>{buttonText}</Button>
                                                </Content>
                                            )
                                        }
                                    </Div>
                                </>
                        }
                        {/*<Div width={'100%'} style={{borderTop: `1px solid ${color.background}`}}></Div>*/}
                    </Flex>
                    <Div>
                        <Div mx={20} style={{borderTop: `1px solid ${color.light}`}}></Div>
                        <Flex justifyContent={'center'} px={10} py={8} bold>
                            <Flex cursor={1} onClick={onDetailClick}>
                                <Div mr={5}>{showDetail ? 'Hide' : 'Details'} {showDetail ? <BsChevronUp /> : <BsChevronDown />} </Div>
                            </Flex>
                        </Flex>
                        {
                            showDetail && (
                                <Div px={20} pb={20} textAlign={'center'}>
                                    { period ?
                                        `${ComUtil.addCommas(totalDon)} DON / ${period}` :
                                        `${ComUtil.addCommas(totalDon)} DON / 4 Week`
                                    }
                                </Div>
                            )
                        }

                    </Div>
                </Div>
            </RoundedCard>
        </Div>
    )
};

export default DepositBigCard;
