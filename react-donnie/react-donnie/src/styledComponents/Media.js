import { css } from 'styled-components'
const sizes = {
    huge: 1440,
    large: 1170,
    medium: 768,
    small: 450,
}
export default Object.keys(sizes).reduce((acc, label) => {
    acc[label] = (...args) => css`
      @media (max-width: ${sizes[label]}px) {
         ${css(...args)};
      }
   `
    return acc
}, {})