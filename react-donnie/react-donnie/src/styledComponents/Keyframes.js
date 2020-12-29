import {keyframes} from "styled-components";

export const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

export const heartBeat = keyframes`
    0% {      
        transform: scale(1);
    }
    5% {
        transform: scale(1.1);
    }
    10% {
        transform: scale(1);
    }
    15% {
        transform: scale(1.2);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1);
    }
`;

export const fadeIn = keyframes`
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;

const aniKey = {
    spin,
    heartBeat,
    fadeIn
}

export default aniKey