import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div} from '../shared/Layouts'
import {getValue}  from '../Util'

export const Alert = styled(Div)`
    padding: ${getValue(10)};
    color: ${color.white};
    background-color: ${props => color[props.bg] || color.danger};
`;