import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {getValue, hasValue} from '../Util'
import {margin, padding, sticky, fixed, noti, notiNew, pseudo} from '../CoreStyles'


const BasicButton = styled.button`
    box-sizing: border-box;
    padding: 6px 6px;
    // height: 40px;

    display: ${props => props.display || 'inline-block'};   
    color: ${props => color[props.fg] || 'inherit'};
    background-color: ${props => props.bg ? `${color[props.bg]}` : `inherit`};  
    border: ${props => props.bc ? `1px solid ${color[props.bc]}` : '0'};
    font-size: ${props => props.fontSize ? `${getValue(props.fontSize)}` : `inherit`};
    text-decoration: ${props => props.textDecoration || 'none'};
    cursor: ${props => props.cursor || 'pointer'};   

    ${margin};
    ${padding};
    width: ${props => getValue(props.width)};
    ${props => props.height && css`height: ${getValue(props.height)};`}
    ${props => props.bold && css`font-weight: bold;`}
    border-radius: ${props => getValue(hasValue(props.rounded) ? props.rounded : 2)};
    ${props => props.block && css`width: 100%;`}
    ${props => props.shadow && css`box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.1);`};

    ${props => props.noti && noti};
    ${props => props.notiNew && notiNew};
    
    ${props => hasValue(props.minWidth) && `min-width: ${getValue(props.minWidth)}`};
    ${props => hasValue(props.minHeight) && `min-height: ${getValue(props.minHeight)}`};
    
    ${pseudo.hover};
    ${pseudo.active};
`;


//override
export const Button = styled(BasicButton)`    

    ${props => props.disabled && css`
        pointer-events: none;
        background-color: ${color.secondary}!important;
        color: ${color.white}!important;        
        border: 0;
    `};
    &:focus{
        outline: none;
    };
`;