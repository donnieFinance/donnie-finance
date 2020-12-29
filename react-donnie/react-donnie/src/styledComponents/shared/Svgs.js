import React from 'react';
import styled from 'styled-components';

export const Svg = ({svg, ...props}) => {
    const Container = styled(svg)`
        & path {
            fill: ${props => props.color && props.color};
            // stroke: ${props => props.color && props.color};
        }
    `;
    return <Container {...props} />
}