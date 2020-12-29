import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div, Link} from '../shared'
import {getValue}  from '../Util'

export const LinkCard = styled(Link)`
    padding: ${getValue(25)};
    box-shadow: 2px 2px 25px rgba(0,0,0, 0.2);
    border-radius: ${getValue(5)};
    text-align: center;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    
`;