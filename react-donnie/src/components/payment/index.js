import React from 'react';
import {Div} from "~/styledComponents/shared";
import PageHeading from "~/components/common/layouts/PageHeading";
import {withTranslation} from "react-i18next";
import TargetLaunch from "~/components/common/layouts/TargetLaunch";

export default withTranslation()((props) => {
    const {t} = props;
    const {payment} = t('menu', {returnObjects: true})
    return (
        <Div>
            <PageHeading
                title={payment.name}
                description={payment.desc}
            />
            <TargetLaunch quarter={'2022 H1'}/>
        </Div>
    );
});