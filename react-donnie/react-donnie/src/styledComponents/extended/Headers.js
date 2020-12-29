import React from 'react'; 
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Flex} from '../shared/Layouts'
import {getValue}  from '../Util'

const ModalHeader = styled.div`        
    font-size: 1rem;
    padding: 1rem;
    // background-color: ${color.light};
    border-bottom: 1px solid ${color.light};
`;

export default {ModalHeader}