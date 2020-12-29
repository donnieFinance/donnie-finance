import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    "en-US": {
        translation: require('../locale/en').default,
    },
    "ko-KR": {
        translation: require('../locale/ko').default
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem("lang")||"en-US",
        fallbackLng: localStorage.getItem("lang")||'en-US',
        debug: true,
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
