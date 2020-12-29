import {Notification, Message} from 'antd';
window.$notify = Notification;
window.$message = Message;
window.$notify.config({
    placement: 'topRight',
    top: 85
});