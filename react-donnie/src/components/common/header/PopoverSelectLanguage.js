import React from 'react';
import {Button, Div} from "~/styledComponents/shared";
import {withTranslation} from "react-i18next";
import i18next from "~/plugins/i18n";
import {Popover} from "antd";

const Content = ({t}) => {
    const onButtonClick = (lang) => {
        // ko-KR or en-US
        i18next.changeLanguage(lang);
        localStorage.setItem("lang",lang);
    }

    const lang = t('lang')

    return(
        <Div>
            <Button py={10} block bc={'primary'}
                    bg={lang === 'EN' ? 'primary' : 'white'}
                    fg={lang === 'EN' ? 'white' : 'dark'}
                    mb={10} onClick={onButtonClick.bind(this,  'en-US')}>En</Button>
            <Button py={10} block bc={'primary'}
                    bg={lang === 'KO' ? 'primary' : 'white'}
                    fg={lang === 'KO' ? 'white' : 'dark'}
                    onClick={onButtonClick.bind(this,  'ko-KR')}>Ko</Button>
        </Div>
    )
}

const PopoverSelectLanguage = ({t, children}) => {

    return (
        <Popover placement="bottomRight" title={<Div py={10}>{t('selectLanguage')}</Div>} content={<Content t={t}/>} trigger="click">
            {children}
        </Popover>
    );
};

export default withTranslation()(PopoverSelectLanguage);
