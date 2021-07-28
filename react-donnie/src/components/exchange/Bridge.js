import React from 'react';
import {Span, Div, Flex, Img} from "~/styledComponents/shared";
import properties from "~/properties";
import loadable from "@loadable/component";
import {Tooltip} from "antd";
import {BsQuestionCircle} from "react-icons/bs";
import {withTranslation} from "react-i18next";
const BridgeTokenCard = loadable( () => import("~/components/common/layouts/BridgeTokenCard"));

const Bridge = (props) => {
    const {t}= props;
    return (
        <>
            {
                properties.exchange.bridgeTokenList.map((item) =>
                    <Div mb={20}>
                        <Flex fg={'white'} fw={500} mt={10} mb={10}>
                            <Div width={22} height={22} bc={'white'} rounded={'50%'} bg={'rgba(255,255,255,0.2)'}>
                                {
                                    item.ercTokenName === 'BNB' && <Img width={20} src={properties.tokenImages.bnb} />
                                }
                                {
                                    item.ercTokenName === 'WITCH' && <Img width={20} src={properties.tokenImages.witch} />
                                }
                            </Div>
                            <Div ml={10} fontSize={16} >
                                {item.title}
                                {
                                    item.ercTokenName === 'BNB' &&
                                        <Span ml={5}>
                                            <Tooltip title={t('bep20bscDesc')} placement="topLeft">
                                                <BsQuestionCircle />
                                            </Tooltip>
                                        </Span>
                                }
                            </Div>
                        </Flex>
                        <BridgeTokenCard
                            name={item.tokenName}
                            tokenName={item.tokenName}
                            ircTokenName={item.ircTokenName}
                            ercTokenName={item.ercTokenName}
                        />
                    </Div>
                )
            }
        </>
    );
};

export default withTranslation()(Bridge);
