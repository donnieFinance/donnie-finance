import React, {useState} from 'react';
import {Flex} from "~/styledComponents/shared";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import { useHistory } from "react-router-dom";
const StyledButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer; 
    color: ${color.darkMid};
    
    min-width: 100px;
    min-height: 40px;
    font-weight: 500;
    
    font-size: 16px;
    ${props => props.active ? `
        // border: 10px solid ${color.info};
        background-color:  ${color.info};
        color: white;
        box-shadow: 1px 1px 2px black;
        border-radius: 20px;
        transform: scale(1.1);
    ` : `
        &:hover {
            // background-color: ${color.lightInfo};
            color: ${color.info};
            // box-shadow: 2px 2px 2px rgba(0,0,0, 0.3);
        }
            
    `}
`;

const SwitchButton = ({data}) => {
    const history = useHistory()

    return (
        <Flex bg={'light'} rounded={20} relative>
            {
                data.map((item, index) =>
                    <StyledButton key={`switchButton${index}`} active={history.location.pathname.includes(item.pathname)} onClick={() => history.push(item.pathname)}>{item.name}</StyledButton>
                )
            }
        </Flex>
    );
};

SwitchButton.propTypes = {};
SwitchButton.defaultProps = {};

export default SwitchButton;
