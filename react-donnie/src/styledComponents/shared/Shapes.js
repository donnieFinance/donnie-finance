import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div} from './Layouts'
import {getValue, hasValue} from '../Util'
import * as core from '../CoreStyles'
import ImgHexEdgeLine from '~/assets/hex_edge.svg'

export const TriangleUp = styled.div`        
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    ${props =>  `border-bottom: 7px solid ${color[props.bg] || color.green}`};
    ${core.padding};
    ${core.margin};
    
`;
export const TriangleDown = styled.div`
    display: inline-block;        
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    ${props =>  `border-top: 7px solid ${color[props.bg] || color.green}`};
    ${core.padding};
    ${core.margin};
    
`;

export const HexEdge = styled.div`
    display: flex;        
    align-items: center;
    justify-content: center;
    width: ${props => hasValue(props.width) ? getValue(props.width) : getValue(60)};
    height: ${props => hasValue(props.height) ? getValue(props.height) : getValue(60)};
    background: url(${ImgHexEdgeLine}) no-repeat;
    background-position: center;
    ${core.padding};
    ${core.margin};
`;