import React from 'react'
import {Div, Flex, Right, Img, Link} from "~/styledComponents/shared"
import LogoWhite from '~/assets/logo.png'
import loadable from "@loadable/component";
import {scrollPositionState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import useSize from "~/hooks/useSize";
import styled, {css, keyframes} from "styled-components";

const WebHeader = loadable(()=> import('./WebHeader'))
const MobileHeader = loadable(()=> import('./MobileHeader'))

const lignten = keyframes`
    from {
        background-color: rgba(0,0,0, 0.7);
    }
    to {
        background-color: rgba(0,0,0, 0.2);
    }
`;

const darken = keyframes`
    from {
        background-color: rgba(0,0,0, 0.2);
    }
    to {
        background-color: rgba(0,0,0, 0.7);
    }
`;


const FadeIn = styled(Flex)`
    
    z-index: 2;
    transition: 0.3s;
    ${props => props.isLighten ? css`
        animation: ${lignten} 0.3s ease-in forwards;
    ` : css`
        animation: ${darken} 0.3s ease-in forwards;
    `}
`;

export default ({height}) => {
    const {size, sizeValue} = useSize()
    const [scrollPosition] = useRecoilState(scrollPositionState)
    const {pageYOffset} = scrollPosition

    const isLighten = sizeValue(pageYOffset <= 500, null, pageYOffset <= 100)

    return(
        <>
            <FadeIn
                fixed height={height} top={0} left={0} width={'100%'}
                bg={'dark'}
                zIndex={1}
                isLighten={isLighten}
            >
                {
                    size === 'lg' ?
                        <Div ml={20}>
                            <Link to={'/'} display={'block'}>
                                <Img src={LogoWhite} alt="logo" width={130}/>
                            </Link>
                        </Div> :
                        <Div ml={20}>
                            <Link to={'/'} display={'block'}>
                                <Img src={LogoWhite} alt="logo" width={80}/>
                            </Link>
                        </Div>
                }
                <Right>
                    {
                        size === 'lg' ?
                            <WebHeader fg={isLighten ? 'secondary' : 'lightText'}/> :
                            <MobileHeader />
                    }
                </Right>
            </FadeIn>
        </>
    )
};

