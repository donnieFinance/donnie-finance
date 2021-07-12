import React from 'react';
import styled, {css} from 'styled-components';
import {color, responsive} from '../Properties'
import {getValue, hasValue} from '../Util'
import {border, margin, padding, sticky, fixed, noti, notiNew, hoverFg} from '../CoreStyles'
import media from '~/styledComponents/Media'
import {Modal as AntdModal} from 'antd'

const defaultStyle = css`
    width: ${props => props.width && getValue(props.width)};
    height: ${props => props.height && getValue(props.height)};
    font-size: ${props => getValue(props.fontSize) || 'inherit'};
    line-height: ${props => getValue(props.lineHeight)};
    font-weight: inherit;
    
    ${props => props.fw && `font-weight: ${props.fw};`};
    
    ${props => props.bold && `font-weight: bold;`}
    ${props => props.lighter && `font-weight: lighter;`}
    
    text-align: ${props => props.textAlign};
    color: ${props => props.fg ? color[props.fg] || props.fg : 'inherit'};
    
    ${props => props.bg && `
        background-color: ${color[props.bg] || props.bg};
    `};
        
    ${border};
    ${margin}; 
    ${padding};
    
    
    ${props => props.relative && 'position: relative;'};
    ${props => props.absolute && 'position: absolute;'};
    ${props => props.fixed && 'position: fixed;'};
    ${props => props.sticky && 'position: sticky;'};
    
    display: ${props => props.display};    
    
    flex-grow: ${props => props.flexGrow};
    flex-basis: ${props => props.flexBasis};
    flex-shrink: ${props => props.flexShrink && props.flexShrink};
    cursor: ${props => props.cursor && 'pointer'};
    z-index: ${props => props.zIndex};
    max-width: ${props => getValue(props.maxWidth)};
    min-width: ${props => getValue(props.minWidth)};
    max-height: ${props => getValue(props.maxHeight)};
    min-height: ${props => getValue(props.minHeight)};
    border-radius: ${props => getValue(props.rounded)};
    top: ${props => getValue(props.top)};
    bottom: ${props => getValue(props.bottom)};
    left: ${props => getValue(props.left)};
    right: ${props => getValue(props.right)};
    
    overflow: ${props => props.overflow};

    ${props => props.noti && noti};
    ${props => props.notiNew && notiNew};
    
    ${props => props.shadow === 'sm' && 'box-shadow: 1px 1px 5px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'md' && 'box-shadow: 1px 1px 10px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'lg' && 'box-shadow: 0px 12px 29px -10px rgba(0, 0, 0, 0.25);'};
    
    ${props => props.xCenter && `left: 50%; transform: translateX(-50%);`};
    ${props => props.yCenter && `top: 50%; transform: translateY(-50%);`};
    ${props => props.center && `top: 50%; left:50%; transform: translate(-50%, -50%);`};
    
    ${props => props.opacity && `opacity: ${props.opacity};`};    
    
    ${props => (props.bgFrom || props.bgTo) && `background: linear-gradient(${props.deg || 145}deg, ${color[props.bgFrom] || color.white }, ${color[props.bgTo] || color.white});`};
    
    ${props => hasValue(props.hoverFg) && hoverFg };
    
    ${props => props.dot && `
        &::before {
            content: '·';
            display: block;
            margin-right: 8px;
        }
    `}
    
    ${props => props.custom && props.custom};
    
`;

export const Div = styled.div`
    ${defaultStyle};
`;
export const Span = styled.span`
    ${defaultStyle};
`;
export const Img = styled.img`
    width: ${props => getValue(props.width) || '100%'};
    height: ${props => getValue(props.height) || 'initial'};
    object-fit: ${props => props.cover && 'cover'};
    display: block;
    ${defaultStyle};
`;

export const Flex = styled(Div)`
    display: flex;
    align-items: ${props => props.alignItems || 'center'};
    justify-content: ${props => props.justifyContent};
    flex-direction: ${props => props.flexDirection};    //test 후 삭제(아래 props 로 대체함)
    flex-wrap: ${props => props.flexWrap};
    flex-direction: ${props => props.column && 'column'};
    margin-left: ${props => props.right && 'auto'};
`;

export const Right = styled(Div)`
    margin-left: auto;
`;

export const Hr = styled.hr`
    margin: 0;
    ${margin};
    ${padding};    
    border: 1px solid ${color.light};
    border-color: ${props => color[props.bc]};
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    ${props => props.bw && `border-width: ${getValue(props.bw)};`};
    ${props => props.custom && props.custom};
`;

export const Sticky = styled(Div)`
    ${sticky};
`;

export const Fixed = styled(Div)`
    ${fixed};

    max-width: ${responsive.maxWidth};            //디폴트 값으로 768 이상일 경우는 더이상 클수 없도록 제어
    ${props => props.noResponsive && `max-width: none;`};   //max-width 해제
    max-width: ${props => getValue(props.maxWidth)};
`;

// export const Mask = styled.div`
//     ${fixed};
//     top: ${props => props.underNav ? '56px' : '0'};
//     width: 100%;
//     bottom: 0;
//     background-color: rgba(0,0,0, 0.7);
//     z-index: 50;
// `;

export const Mask = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0, 0.5);
    z-index: 9999999;
    
    // display: flex;
    // align-items: center;
    // justify-content: center;
`;


export const BackgroundContainer = styled(Div)`
    background-color: ${color.light};
`;

export const Layer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: ${props => props.zIndex || '1'};
    
    &::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: blue;
    }
         
`;

export const GridColumns = styled(Div)`
    display: grid;
    grid-template-columns: ${props => hasValue(props.repeat) ? `repeat(${props.repeat}, 1fr)` : props.tempColumns };
    grid-column-gap: ${props => hasValue(props.colGap) ? getValue(props.colGap) : getValue(34)};
    grid-row-gap: ${props => hasValue(props.rowGap) ? getValue(props.rowGap) : getValue(34)};
`;

// export const GridProducts = styled(GridColumns)`
//     ${media.small`
//         grid-template-columns: 1fr;
//     `};
//     ${media.medium`
//         grid-template-columns: 1fr 1fr;
//     `};
// `;

//애니메이션 되며 열리는 박스(스크롤)
export const AccordionScrollView = styled(Div)`

    white-space: pre-wrap;
    word-break: break-word;
    overflow: hidden;
    
    ${props => props.open ? `
        max-height: ${getValue(props.maxHeight) || '300px'};
        transition: max-height 0.25s ease-in;
        overflow: auto;
    ` : `
        max-height: 0;
        transition: max-height 0.15s ease-out;
    `}
    
    
    
`;

//애니메이션 되며 열리는 박스(no 스크롤, 100% 세로로 열림 )
export const AccordionNoScrollView = styled(AccordionScrollView)`
  max-height: ${props => props.open ? "100%" : "0"};
  overflow: hidden;
`;

export const ShadowBox = styled(Div)`
    background-color: ${color.white};
    box-shadow: 1px 1px 6px rgba(0,0,0, 0.2);
    position: relative;
    border-radius: ${getValue(3)};
    padding: ${getValue(16)};
`;

//antd 의 모달 아이콘 색상 적용
export const Modal = styled(AntdModal)`
    .ant-modal-close-icon {
        svg {
            color: ${props => color[props.fg || 'white']};
            // font-size: 30px;
        }
    }
`;


export const RoundedCard = styled(Div)`
    transition: 0.4s;
    &:hover {
        box-shadow: 0px 0px 20px rgba(0,0,0, 0.3);
    }
    
    & > div:first-child {
        border-top-left-radius: 3px;
        border-top-right-radius: 3px; 
    }
    & > div:last-child {
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px; 
    }
`;

export const XCenter = styled(Div)`
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
`;

export const SymbolIcon = styled(Img)`
    background-color: ${color.white};
    border: 1px solid ${color.secondary};
    // ${props => props.shadow && `
    //     box-shadow: 2px 2px 3px rgba(0,0,0,0.2);
    // `}
    border-radius: 50%;
    padding: ${props => props.p ? getValue(props.p) : '3px'};
    object-fit: fill;
    &:hover {
        transform: scale(1.4);
        z-index:1;
    }
// marginLeft: -6;
`;