import i18n from '../plugins/i18n'

window.eleMessage = 'ERROR';
setInterval(()=>{
    window.eleMessage = 'ERROR';
},3000);
const handler = (error) => {
    console.log(error)
    let message;
    if (error && error.code) {
        switch (error.code) {
            case 50009: 
                message = i18n.t('message.newWorkError1')
                break;
            case 4001:
                message = i18n.t('message.UserRejected')
                break;
            case -32602:
                message = i18n.t('message.InvalidParam')
                break;
            case -32603:
                message = i18n.t('message.InternalError')
                break;
            default:
                message = error.message || error;
                break;
        }
    }
    if(window.eleMessage != message){
        window.eleMessage = message;
        window.$message.error(message || 'ERROR');
    }
};
export default handler;
