import React, {useState, useEffect} from 'react'
import { Div, Flex, Span } from '~/styledComponents/shared'
import {color} from '~/styledComponents/Properties'
import styled, {css}from 'styled-components'
import { GoCheck } from "react-icons/go";

const HiddenCheckboxElement = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`

const StyledCheckbox = styled(Div)`
    display: flex;
    align-items: center;
    justify-content: center;
    
    ${props => !props.checked && `
        background-color: white;
        border-width: 2px;
    `}
    
    
    ${props => props.checked && `
        background-color: ${props.bg || color.primary};
        color: white;
        border-width: 0px;    
    `}
    
    
    
    
    ${props => props.checked && `box-shadow: 1px 1px 4px rgba(0,0,0, 0.2);`}
    
    ${props => props.disabled && css`
        background-color: #eaeaea;
        color: ${color.secondary};
        border-width: 0px;
    `}

    ${props => props.size === 'sm' && `
        width: 20px;
        height: 20px;
        font-size: 14px;
    `}
    
    ${props => props.size === 'md' && `
        width: 25px;
        height: 25px;
        font-size: 18px;
    `}
    ${props => props.size === 'lg' && `
        width: 30px;
        height: 30px;
        font-size: 20px;
    `}

`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0;
`;
const CheckboxContainer = styled(Flex)`
    ${props => props.className && props.className}

`;

const Checkbox = (props) => {
    const {id, name, icon = GoCheck, value, checked, margin = 0, labelMargin = 5, onChange, disabled, children, className, size = 'sm', bg = 'dark'} = props
    const [isChecked, setIsChecked] = useState(checked)
    function onHandleChange(e) {
        if(!disabled){
            setIsChecked(e.target.checked)
            onChange(e)
        }
    }

    useEffect(() => {
        //내 값과 부모의 값이 다를경우만 렌더링 하도록
        if(isChecked !== checked){
            setIsChecked(checked)
        }
    }, [checked])


    return (
        <CheckboxContainer className={className}>
            <CheckboxLabel>
                <HiddenCheckboxElement
                    id={id || null}
                    name={name || null}
                    checked={isChecked}
                    value={value}
                    // onChange={!disabled ? onChange : null}
                    onChange={onHandleChange}
                />
                <StyledCheckbox checked={isChecked} size={size} bg={bg} disabled={disabled} rounded={3} bc={'dark'} >
                    {isChecked ? icon() : ''}
                </StyledCheckbox>
                {
                    children && <Span ml={labelMargin} mr={labelMargin - margin} style={{lineHeight: '1.2rem'}}>{children}</Span>
                }
            </CheckboxLabel>
        </CheckboxContainer>
    )
}


export default Checkbox