import axios from 'axios'
import SecureApi from "~/lib/secureApi";
const instance = axios.create({
    xsrfHeaderName:"x-csrf-token",
    withCredentials: true,
    credentials: 'same-origin'
});
instance.interceptors.request.use(
    async (config) => {
        const csrfData = localStorage.getItem('xToken');
        if (csrfData) {
            config.headers['x-csrf-token'] = csrfData;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);
export default instance;