import React from 'react';
 
import styled, {css} from 'styled-components';
import {color} from '../Properties'
import {getValue, hasValue} from '../Util'
import {padding, margin} from '../CoreStyles'
import {Input as AntdInput} from 'antd'

const BasicInput = styled.input`
    ${props => props.width && css`width: ${getValue(props.width)};`}
    height: ${props => props.height ? getValue(props.height) : '40px;'};
    box-sizing: border-box;
    color: ${color.black};
    font-size: 14px;
    
    border-radius: ${props => getValue(hasValue(props.rounded) ? props.rounded : 2)};
    
    padding: 0 5px;
    border: solid 1px #e1e1e1;
    
    ${props => props.bg && `background-color: ${color[props.bg] || props.bg}`};
    
    ${props => props.bold && `
        font-weight: bold;
    `}

    &::placeholder {
        color: #b9b9b9;        
    }
    &:focus {
        outline: none;
    }

    color: ${props => props.fg ? color[props.fg] || props.fg : 'inherit'};

    ${padding}
    ${margin}
    
`;


//override
export const Input = styled(BasicInput)`    
    border-width: 1px;
    border-style: solid;
    border-color: ${color.secondaryLight};
    
    ${props => props.bc && `border-color: ${color[props.bc]}`};
    
    ${props => props.underLine && `
        border-radius: 0;
        border-top: 0;
        border-right: 0;
        border-left: 0;
    `}    
    ${props => props.readOnly && `
        // background-color: #f8f8f8;
    `}

    ${props => props.block && `
        width: 100%;
    `}

`;

//밑줄만 있는 인풋
export const AntdUnderlineInput = styled(AntdInput)`
    border-top: 0;
    border-left: 0;
    border-right: 0;
    border-radius: 0;
`;

export const UserDarkInput = styled(Input)`
    background-color: #2F2F2F;
    padding: ${getValue(30)} ${getValue(20)};
    color: ${color.darkLight};    
    border: 0;
    border-radius: ${getValue(5)};
    font-size: ${getValue(16)};
    ${props => `margin-bottom: ${getValue(hasValue(props.mb) ? props.mb : 10)}`};
    width: 100%;
`;
