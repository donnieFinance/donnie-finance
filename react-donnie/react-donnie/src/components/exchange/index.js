import React from 'react';
import {Div} from "~/styledComponents/shared";
import PageHeading from "~/components/common/layouts/PageHeading";
import {withTranslation} from "react-i18next";
import TargetLaunch from "~/components/common/layouts/TargetLaunch";

export default withTranslation()((props) => {
    const {t} = props;
    const {exchange} = t('menu', {returnObjects: true})
    return (
        <Div>
            <PageHeading
                title={exchange.name}
                description={exchange.desc}
            />
            <TargetLaunch quarter={'2021 Q1'}/>
        </Div>
    );
});