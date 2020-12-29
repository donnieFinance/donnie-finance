import React from 'react'; 
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Hr} from '../shared/Layouts'
import {getValue}  from '../Util'

export const HrThin = styled(Hr)`
    border-width: 1px;
`;

export const HrHeavy = styled(Hr)`
    border-width: 4px;
`;

export const HrHeavyX2 = styled(Hr)`
    border-width: 10px;
`;