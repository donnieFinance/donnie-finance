import React from 'react';
import {Div} from "~/styledComponents/shared";

import useSize from "~/hooks/useSize";

import styled from 'styled-components'

import aniKey from "~/styledComponents/Keyframes";

const Title = styled(Div)`
    opacity: 0;
    animation: ${aniKey.fadeIn} 0.2s ease-in forwards;
`;

const Description = styled(Div)`
    opacity: 0;
    animation: ${aniKey.fadeIn} 0.2s ease-in forwards;
    animation-delay: 0.1s;
`;

const PageHeading = ({title, description}) => {

    const {sizeValue} = useSize()

    return (
        <Div
            style={{wordSpacing: 'break-word', whiteSpace: 'pre-wrap'}}
            my={sizeValue(150, null,50)}
            px={sizeValue( 100, null,30)}

            fg={'white'}
        >
            <Title fontSize={sizeValue(60, 50,30)} bold textAlign={'center'}>{title}</Title>
            <Description fontSize={sizeValue( 25, 20,17)} lighter textAlign={'center'}>{description}</Description>
        </Div>
    )
}


export default PageHeading;
