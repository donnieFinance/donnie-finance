import React from 'react';
import styled, {css} from 'styled-components';
import {color, responsive} from '../Properties'
import {getValue, hasValue} from '../Util'
import {position, margin, padding, sticky, fixed, noti, notiNew, spin, animation} from '../CoreStyles'
import aniKey from "~/styledComponents/Keyframes";
import {Div} from "~/styledComponents/shared/Layouts";
import {CgShapeHalfCircle} from "react-icons/cg";

export const HeartBeat = styled(Div)`
    animation: ${props => props.play && aniKey.heartBeat} ${props => props.duration + 's' || '2s'} infinite;    
    animation-play-state: ${props => props.playState || 'running'};
    ${props => hasValue(props.delay) && 'animation-delay:'+props.delay + 's'}
`;

export const HalfCircleSpin = styled(CgShapeHalfCircle)`
    animation: ${aniKey.spin} ${props => hasValue(props.duration) ? props.duration + 's' : '0.3s'} linear infinite;
    ${animation}
    
    color: ${color.secondary};
`

const AnimationLayouts = {
    HeartBeat,
    HalfCircleSpin
}

export default AnimationLayouts