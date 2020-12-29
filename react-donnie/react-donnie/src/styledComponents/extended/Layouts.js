import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {getValue}  from '../Util'
import {Div} from "../shared/Layouts";

const CenteredDiv = styled(Div)`
    width: ${getValue(1240)};
    margin: 0 auto;
`;

//home 섹션 타이틀
const HomeSectionTitle = styled(Div)`
    font-weight: 500;
    font-size: ${getValue(24)};
    color: ${color.white};
`;

export default {
    CenteredDiv,
    HomeSectionTitle
}