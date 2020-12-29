import React from 'react';
import {Button, Div, Flex, Img, RoundedCard} from "~/styledComponents/shared";
import aniKey from "~/styledComponents/Keyframes";

import useSize from "~/hooks/useSize";
import SpinnerWrap from '~/components/common/spinnerWrap'
import styled, {css} from "styled-components";
import {Spin} from 'antd'
import {getValue} from "~/styledComponents/Util";
import {CgShapeHalfCircle} from 'react-icons/cg'
import Ani from '~/styledComponents/shared/AnimationLayouts'
const Content = styled(Flex)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
    justify-content: center;
`;
// const StyledCircle = styled(CgShapeHalfCircle)`
//      animation: ${aniKey.spin} 0.5s linear infinite;
// `

const DepositBigCard = ({

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

    /*
    decimals: 8
    img: "/static/media/coin_iost.b40152fb.png"
    isOpen: "true"
    name: "iost"
    precision: 8
    rate: 0
    status: 1
    total: 3488.805
    totalBalance: 20.743147994604954
    usd: 0.00594563123895


     */


    return (
        <Div relative width={200} m={16} >
            {
                number <= 3 && (
                    <Flex
                        absolute width={45} height={35}
                        top={-5}
                        right={-5}
                        bg={number === 1 ? 'info' : 'secondary'}
                        fg={'white'}
                        justifyContent={'center'}
                        // rounded={10}
                        fontSize={20}
                        shadow={'sm'}
                        bold
                        rounded={3}
                        zIndex={1}
                    >
                        {number}
                    </Flex>
                )
            }
            <RoundedCard relative shadow={'lg'}>

                <Flex bg={'light'} flexDirection={'column'} justifyContent={'center'} height={110}>
                    <Div width={50}>
                        <Img src={img} alt={name}/>
                    </Div>
                    <Div fontSize={20} bold>{name}</Div>
                </Flex>
                <Flex p={15} bg={'white'} minHeight={186} flexDirection={'column'} justifyContent={'center'}>
                    {
                        loading ? <Spin /> : (
                            <>
                                <Div mb={15}>
                                    {
                                        mining && <Content fontSize={14} textAlign={'center'}>{mining}<Ani.HalfCircleSpin duration={0.6} /></Content>
                                    }
                                    {
                                        explain && <Content fontSize={14} textAlign={'center'}>{explain}</Content>
                                    }
                                    {
                                        total && <Content fontSize={30} textAlign={'center'} bold>{total}</Content>
                                    }
                                    {
                                        usd && <Content fontSize={14} textAlign={'center'}>{usd}</Content>
                                    }
                                    {
                                        rate && <Content fontSize={14} textAlign={'center'}>{rate}</Content>
                                    }


                                </Div>
                                <Content>
                                    <Button bg={'primary'} fg={'white'} block onClick={onClick} px={10}>{buttonText}</Button>
                                </Content>

                            </>

                        )
                    }

                </Flex>
            </RoundedCard>
        </Div>

    );
};

export default DepositBigCard;
