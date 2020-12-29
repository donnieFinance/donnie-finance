import { useState, useEffect } from 'react';
import {windowSizeState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}


export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {

            const winSize = getWindowDimensions()
            const {width} = winSize

            setWindowDimensions(winSize);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions
}