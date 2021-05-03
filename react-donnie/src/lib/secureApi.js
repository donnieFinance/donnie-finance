import axios from 'axios'
import properties from "~/properties";
const getCsrf = () => axios(properties.restAPIHost + '/getCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
const setCsrf = () => axios(properties.restAPIHost + '/setCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
export default {
    getCsrf,
    setCsrf
}