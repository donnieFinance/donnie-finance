import React from 'react';
import {Link as link, NavLink as navLink} from 'react-router-dom'
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {getValue, hasValue} from '../Util'
import * as core from '../CoreStyles'


const defaultStyle = css`
    text-decoration: ${props => props.textDecoration || 'none'}!important;
    ${props => props.height && `height: ${getValue(props.height)};`};
    ${props => hasValue(props.fontSize) && `font-size: ${getValue(props.fontSize)};`};    
`;

export const A = styled.a`
    ${defaultStyle};
    ${core.margin};
    ${core.padding};    
    display: ${props => props.display || 'inline-block'}; 
    color: ${props => color[props.fg] || color.black};   
    ${core.pseudo.hover};
    ${core.pseudo.active};
    ${props => props.noti && core.noti};
    ${props => props.notiNew && core.notiNew};
`;

export const Link = styled(link)`
    ${defaultStyle};
    ${core.border};
    ${core.margin};
    ${core.padding};    
    display: ${props => props.display || 'inline-block'};
    
    ${core.display};
    
    color: ${props => hasValue(props.fg) ? (color[props.fg] || props.fg) + '!important' : 'inherit'};
    background-color: ${props => color[props.bg]};
    ${core.pseudo.hover};
    ${core.pseudo.active};
    ${props => props.noti && core.noti};
    ${props => props.notiNew && core.notiNew};
`;

export const NavLink = styled(navLink)`
    ${defaultStyle};
    ${core.border};
    ${core.margin};
    ${core.padding};    
    display: ${props => props.display || 'inline-block'};
    
    ${core.display};
    
    color: ${props => hasValue(props.fg) ? (color[props.fg] || props.fg)  : 'inherit'};
    background-color: ${props => color[props.bg]};
    ${core.pseudo.hover};
    ${core.pseudo.active};
    ${props => props.noti && core.noti};
    ${props => props.notiNew && core.notiNew};
`;