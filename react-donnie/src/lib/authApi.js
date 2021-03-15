import axios from 'axios'
import properties from "~/properties";

const adminLogin = ({email, valword}) => axios(properties.restAPIHost + '/adminLogin', {method: "post", data:{userType:'admin',email,valword}, withCredentials: true, credentials: 'same-origin'})
const getAdmin = () => axios(properties.restAPIHost + '/adminLoginInfo', { method: "post", data: {}, withCredentials: true, credentials: 'same-origin' })
const adminLogout = () => axios(properties.restAPIHost + '/adminLogout', { method: "delete", withCredentials: true, credentials: 'same-origin' })

export default {
    adminLogin,
    adminLogout,
    getAdmin
}