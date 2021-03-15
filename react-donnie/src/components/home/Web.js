import React from 'react'
import {Div, Flex, Span, Link} from '~/styledComponents/shared'

import Logo from '~/assets/donnie_logo_b.png'
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";

import {useHistory} from 'react-router-dom'

const Grid = styled(Div)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background-color: ${color.background};
    
    & > div:nth-child(1) {
        border-top-left-radius: ${getValue(30)};
    }
    & > div:nth-child(3) {
        border-top-right-radius: ${getValue(30)};
    }
    & > div:nth-child(4) {
        border-bottom-left-radius: ${getValue(30)};
    }
    & > div:nth-child(6) {
        border-bottom-right-radius: ${getValue(30)};
    }
`

const Item = styled(Flex)`
        transition: 0.17s ease-in;
        color: ${props => props.themeColor};
        background-color: ${color.white};
    
        //icon box
        & > div:nth-child(1) {
        
            width: ${getValue(112)};
            height: ${getValue(112)};
            
            & > img:nth-child(1) {
                display: block;    
            }
            & > img:nth-child(2) {
                display: none;    
            }
        }
    
        //desc
        & > div:nth-child(3) {
            display: none;
        }
    
        &:hover {
            transform: scale(1.1);
            color: white;
            background-color: ${props => props.themeColor};
           
            border-radius: ${getValue(30)};
            
            //image box
            & > div:nth-child(1) {
                
                width: ${getValue(160)};
                height: ${getValue(160)};
            
                & img:nth-child(1) {
                    display: none;
                }
                & img:nth-child(2) {
                    display: block;
                }
            }
            
            //title box
            & > div:nth-child(2) {
                font-size: ${getValue(30)};
                font-weight: 700;
            }
            
            & > div:nth-child(3) {
                display: block;
            }
            
            
        }
    `


const CardPc = ({pathname, img, hoverImg, alt, title, desc, fg}) => {

    const history = useHistory()

    return(
            <Item minHeight={350} flexGrow={1} flexDirection={'column'}
                  themeColor={fg}
                  justifyContent={'center'} cursor
                  onClick={()=> history.push(pathname)}
            >
                <Div>
                    <img src={img} alt={alt} style={{width: '100%', height: '100%'}}/>
                    <img src={hoverImg} alt={alt} style={{width: '100%', height: '100%'}}/>
                </Div>
                <Div fontSize={25} textAlign={'center'}>
                    {title}
                </Div>
                <Div textAlign={'center'} fontSize={12.8} mt={10} px={30}>
                    {desc}
                </Div>
            </Item>
    )

}


export default ({store}) =>
    <>
        <Div px={50} pt={50}>
            <Link to={'/about'}>
                <img src={Logo} alt="donnie logo" style={{display: 'block', width: 190}}/>
            </Link>
        </Div>

        <Div>
            <Grid px={50}>
                {
                    store.map((item, index) =>
                        <CardPc
                            key={`item${index}`}
                            pathname={item.pathname}
                            img={item.img}
                            hoverImg={item.hoverImg}
                            alt={item.alt}
                            title={item.title}
                            desc={item.desc}
                            fg={item.fg}
                        />
                    )
                }
            </Grid>
        </Div>

        <Div textAlign={'center'} fontSize={16} fw={700} py={20}>
            ⓒ DONNIE FINANCE. ALL RIGHTS RESERVED.<br/>
            <Span>powered by IOST & EZFARM</Span>
        </Div>
    </>
