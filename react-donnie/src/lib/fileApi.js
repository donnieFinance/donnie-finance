import axiosSecure from './axiosSecure'
import properties from "~/properties";

const kycImgFile = (formData) => axiosSecure(properties.restAPIHost + '/kycImgFile',
    {
        method: 'post',
        data:formData,
        withCredentials: true,
        credentials: 'same-origin'
    });

export default {
    kycImgFile
}