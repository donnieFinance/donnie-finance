import React from 'react';
import properties from "~/properties";
import {Div} from "~/styledComponents/shared";

const Properties = (props) => {
    return (
        <Div bg={'white'} p={10}>
            <pre>
                {JSON.stringify(properties, null, 1)}
            </pre>
        </Div>
    );
};

export default Properties;
