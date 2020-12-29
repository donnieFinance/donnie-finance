import React from 'react';
import {useRecoilState} from "recoil";
import {windowSizeState} from "~/hooks/atomState";
import {hasValue} from "~/styledComponents/Util";

const useSize = (props) => {
    const [size] = useRecoilState(windowSizeState)

    const sizeValue = (lgValue, mdValue, smValue) => {
        if (size === 'lg') {
            return lgValue
        }else if (size === 'md') {
            return hasValue(mdValue)  ? mdValue : lgValue
        }else {
            return hasValue(smValue) ? smValue : hasValue(mdValue) ? mdValue : lgValue
        }
    }

    return {size, sizeValue}
};

export default useSize;
