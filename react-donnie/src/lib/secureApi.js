import axios from 'axios'
import properties from "~/properties";
const setCsrf = () => axios(properties.restAPIHost + '/setCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
export default {
    setCsrf
}