
//html 최상단의 font-size 가져오기, 만약 지정되지 않았다면 15로 지정하였음
const basePixel = parseFloat((window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize).replace('px', '') || 15)

export const toRem = (num) => {
    return num / basePixel
}

export const getValue = (value) => {
    if(!isNaN(value) && value == 0) return value + 'px'
    if(!value) return null
    if(isNaN(value)) return value
    return toRem(value) + "rem"
}

export const hasValue = (value) => {
    if (value === null || value === undefined) {
        return false
    }
    return true
}