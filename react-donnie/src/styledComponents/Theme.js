import {createGlobalStyle} from "styled-components";
import {color} from "~/styledComponents/Properties";

export const White = createGlobalStyle`
    body {
        background-color: ${color.white};
    }
`
export const Gray = createGlobalStyle`
    body {
        background-color: ${color.background};
    }
`
export default {
    White,
    Gray
}