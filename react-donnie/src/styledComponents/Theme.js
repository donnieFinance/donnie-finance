import {createGlobalStyle} from "styled-components";
import {color} from "~/styledComponents/Properties";

export const White = createGlobalStyle`
    body {
        background-color: ${color.white};
    }
`
export const Gray = createGlobalStyle`
    body {
        // background: ${color.secondary};
        background: #899A9C;
    }
`
export default {
    White,
    Gray
}