import React from 'react';
import {Div, Fixed, Img} from "~/styledComponents/shared";
import {Spin} from "antd";
import {withTranslation} from "react-i18next";
import ImgIconSecurity from "~/assets/icon_security.svg"
import ImgDonnieLogoB from "~/assets/donnie_logo_b.png"


export default (props) => {
    return (
        <Fixed center flexGrow={1} noResponsive width={'100%'} p={20}>
            <Div textAlign={'center'} >
                <Div mt={10} mb={10}>
                    <img src={ImgIconSecurity} style={{width: 150}}/>
                </Div>
                <Spin/>
                <Div mb={10}>
                    ::IM_UNDER_ATTACK_BOX::
                </Div>
                <Div fg={'darkMid'}>
                    <Div mb={10}>
                        <span>Checking your browser before accessing</span> <b>donnie.finance</b>
                    </Div>
                    <Div mb={10}>
                        This process is automatic. Your browser will redirect to your requested content shortly.
                    </Div>
                    <Div mb={10}>
                        <span>DDoS protection by Donnie finance</span>
                        <br/>
                        Ray ID: <span>::RAY_ID::</span>
                    </Div>
                </Div>
                <Div mt={20}>
                    <img width={100} src={ImgDonnieLogoB}/>
                </Div>
            </Div>
        </Fixed>

    );
};