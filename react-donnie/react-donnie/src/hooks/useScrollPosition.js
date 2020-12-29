import React, {useState, useEffect} from 'react';
import {scrollPositionState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";

const useScrollPosition = (props) => {

    const [scrollPosition, setScrollPosition] = useRecoilState(scrollPositionState)

    // const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {

        listenToScroll()

        window.addEventListener('scroll', listenToScroll)

        return () => {
            window.removeEventListener('scroll', listenToScroll);
        }
    }, [])

    const listenToScroll = () => {
        const pageYOffset = window.pageYOffset;
        console.log({pageYOffset})
        setScrollPosition({pageYOffset});
    }
};

export default useScrollPosition;
