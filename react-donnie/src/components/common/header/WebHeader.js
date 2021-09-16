import React, {useEffect} from 'react';
import {Button, Div, Flex, NavLink} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Tooltip, Badge} from "antd";
import {
    myAddressSelector,
    walletLoadingState,
    connectWalletModalState
} from '~/hooks/atomState'

import {useRecoilState} from "recoil";
import {withTranslation} from "react-i18next";
import SpinnerWrap from '~/components/common/spinnerWrap'
import PopoverSelectLanguage from "~/components/common/header/PopoverSelectLanguage";
import useScrollPosition from "~/hooks/useScrollPosition";
import { useLocation, useRouteMatch } from 'react-router-dom';
import properties from "~/properties";

const CustomNavLink = ({to, fg, children, pathName, isActive}) =>
    <NavLink to={to} fg={fg} activeStyle={{color: color.white}} isActive={isActive}>
        {children}
    </NavLink>

const WebHeader = (props) => {
    const {t, fg} = props;

    const [loading,] = useRecoilState(walletLoadingState)
    const [address,] = useRecoilState(myAddressSelector)
    const [, setConnectWalletOpen] = useRecoilState(connectWalletModalState)

    const {about, checking, ido, exchange, credit, payment, portfolio} = t('menu', {returnObjects: true})

    // extract pathname from location
    const { pathname } = useLocation();

    //exchange 라우터에 포함되는 경우
    const match = useRouteMatch('/exchange')

    return (
        <Flex
            // ml={'auto'}
            fg={'white'}
            fontSize={16}
            justifyContent={'space-between'} px={20}
            minWidth={1000}
        >
            <Div>
                <CustomNavLink to={'/about'} placement="bottom" fg={fg}>
                    <Tooltip title={about.desc} >{about.name}</Tooltip>
                </CustomNavLink>
            </Div>
            <Div>
                <CustomNavLink to={'/checking'} fg={fg}>
                    <Tooltip title={checking.desc} placement="bottom">
                        {checking.name}
                    </Tooltip>
                </CustomNavLink>
            </Div>
            <Div>
                <CustomNavLink to={'/exchange/swap'} fg={fg} pathName={pathname}
                    isActive={() =>{
                        return match ? true : false
                    }}
                >
                    <Tooltip title={exchange.desc} placement="bottom">
                        {exchange.name}
                    </Tooltip>
                </CustomNavLink>
            </Div>
            { (properties.isNewIdoExist) ? //new IDO 존재할때만 new출력.
                <Div relative custom={`
                        &::after {
                            content: "NEW";
                            position: absolute;
                            left: 80%;
                            top: -16px;
                            background: ${color.love};
                            color: ${color.white};
                            font-weight: 500;
                            font-size: 10px;
                            border-radius: 4px;
                            padding: 0 5px;
                            line-height: 16px;
                            height: 15px;                
                    `}>

                    <CustomNavLink to={'/iostarter'} fg={fg}>
                        <Tooltip title={ido.desc} placement="bottom">
                            {ido.name}
                        </Tooltip>
                    </CustomNavLink>
                </Div>
                :
                <Div>
                    <CustomNavLink to={'/iostarter'} fg={fg}>
                        <Tooltip title={ido.desc} placement="bottom">
                             {ido.name}
                        </Tooltip>
                    </CustomNavLink>
                </Div>
            }

            <Div>
                <CustomNavLink to={'/credit'} fg={fg}>
                    <Tooltip title={credit.desc} placement="bottom">
                        {credit.name}
                    </Tooltip>
                </CustomNavLink>
            </Div>
            <Div>
                <CustomNavLink to={'/payment'} fg={fg}>
                    <Tooltip title={payment.desc} placement="bottom">
                        {payment.name}
                    </Tooltip>
                </CustomNavLink>
            </Div>
            <Div>
                <CustomNavLink to={'/portfolio'} fg={fg}>
                    <Tooltip title={portfolio.desc} placement="bottom">
                        {portfolio.name}
                    </Tooltip>
                </CustomNavLink>
            </Div>
            <Flex>
                <Div>
                    <Button bg={'white'} fg={'primary'} px={20} height={46}
                            onClick={() => setConnectWalletOpen(true)}
                    >
                        <SpinnerWrap
                            checkValue={loading}
                            trueValue={address}
                            falseValue={t('connectWallet')}
                        />
                    </Button>
                </Div>
                {/*<Div ml={5}>*/}
                {/*    <PopoverSelectLanguage>*/}
                {/*        <Button bc={'background'} fg={'background'} height={46} px={20}>{t('lang')}</Button>*/}
                {/*    </PopoverSelectLanguage>*/}
                {/*</Div>*/}
            </Flex>
        </Flex>
    );
};

export default withTranslation()(WebHeader);
