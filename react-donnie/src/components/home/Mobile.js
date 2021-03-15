import React from 'react'
import {Div, Flex, Span, Link, Img} from '~/styledComponents/shared'

import Logo from '~/assets/donnie_logo_b.png'
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";

const CardMobile = ({pathname, fg, img, alt, title, desc}) =>
    <Link to={pathname} display={'block'}>
        <Flex p={20}
              // alignItems={'flex-start'}
              cursor={1}>
            <Div maxWidth={80} flexShrink={0} mr={20}>
                <Img src={img} alt={alt}/>
            </Div>
            {/*<Flex*/}
            {/*    height={'100%'}*/}
            {/*    justifyContent={'center'} width={100} mr={20}*/}
            {/*>*/}
            {/*    <Img src={img} alt={alt}/>*/}
            {/*</Flex>*/}
            <Div>
                <Div fg={fg} fw={700}>
                    {title}
                </Div>
                <Div fg={'secondary'} style={{whiteSpace:'pre-wrap', breakWord: 'word-break'}}>
                    {desc}
                </Div>
            </Div>
        </Flex>
    </Link>



const MobileBox = styled(Div)`
    & > a {
        border-bottom: 1px solid ${color.background};
    }
    
    & > a:last-child {
        border: 0;
    }
`;


export default ({store}) =>
    <>
        <Link to={'/about'}>
            <Div px={20} pt={20} pb={8}>
                <img src={Logo} alt="donnie logo" style={{display: 'block', width: 130}}/>
            </Div>
        </Link>
        <Div>
            <Div px={20}>
                <MobileBox bg={'white'} style={{borderRadius: 30}}>
                    {
                        store.map((item, index) =>
                            <CardMobile
                                key={`item${index}`}
                                pathname={item.pathname}
                                img={item.img}
                                alt={item.alt}
                                title={item.title}
                                desc={item.desc}
                                fg={item.fg}
                            />
                        )
                    }
                </MobileBox>
            </Div>
        </Div>
        <Div textAlign={'center'} fontSize={14} fw={500} py={20}>
            ⓒ DONNIE FINANCE. ALL RIGHTS RESERVED.<br/>
            <Span>powered by IOST & EZFARM</Span>
        </Div>
    </>