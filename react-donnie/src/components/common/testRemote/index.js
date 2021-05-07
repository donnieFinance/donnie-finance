import React from 'react';
import properties from "~/properties";
import {Div, Button, Fixed} from "~/styledComponents/shared";

const TestRemote = (props) => {

    const onCookieClearClick = () => {
        localStorage.removeItem("coinStatus")
        localStorage.removeItem("coinInfo")
        localStorage.removeItem("coin")
        localStorage.removeItem("updateTime")
    }

    if (!properties.isDev)
        return null
    return (
        <Fixed top={100} left={20} zIndex={999} p={10} bc={'dark'} bg={'rgba(255, 255, 255, 0.5)'} rounded={5}>
            <Div>
                Test Mode
            </Div>
            <Div>
                <Button bg={'info'} fg={'white'} rounded={5} onClick={onCookieClearClick}>쿠키제거</Button>
            </Div>
        </Fixed>
    )
};

export default TestRemote;
