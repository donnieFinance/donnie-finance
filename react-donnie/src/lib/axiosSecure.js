import axios from 'axios'
import properties from "~/properties";
const getCsrf = () => axios(properties.restAPIHost + '/getCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
const instance = axios.create({
    xsrfHeaderName:"x-csrf-token",
    withCredentials: true,
    credentials: 'same-origin'
});
instance.interceptors.request.use(
    async (config) => {
        const {data:csrfData} = await getCsrf();
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