import React from 'react';
import {Button, Div, Flex, NavLink} from "~/styledComponents/shared";
import {Drawer} from "antd";
import {menuModalState} from '~/hooks/atomState'
import {useRecoilState} from "recoil";
import {withTranslation} from "react-i18next";
import {GrClose} from 'react-icons/gr'
import {color} from "~/styledComponents/Properties";
import useWallet from "~/hooks/useWallet";
import {useRouteMatch} from "react-router-dom";
import properties from "~/properties";

const themeColor = color.donnie

const CustomNavLink = ({to, isActive, onClose, children}) =>
    <NavLink to={to} isActive={isActive} fg={'dark'} fontSize={15} activeStyle={{color: themeColor}} onClick={()=>setTimeout(() => onClose(), 150)}>
        {children}
    </NavLink>

const MenuModal = ({t}) => {
    const {address} = useWallet()
    const [menuOpen, setMenuOpen] = useRecoilState(menuModalState)
    const {about, checking, ido, exchange, credit, payment, portfolio} = t('menu', {returnObjects: true})
    //exchange 라우터에 포함되는 경우
    const match = useRouteMatch('/exchange')

    const onClose = () => {
        setMenuOpen(false)
    }

    return (
        <Drawer
            title={null}
            bodyStyle={{padding:0}}
            placement={'right'}
            closable={false}
            onClose={onClose}
            visible={menuOpen}
        >
            <Div>

                <Div height={45} bold>
                    <Div height={10} width={'100%'} bg={themeColor}></Div>
                </Div>

                <Div absolute top={10} right={0}>
                    <Button
                        bg={'white'}
                        rounded={0}
                        noHover width={45} height={45} onClick={onClose}><Flex justifyContent={'center'}><GrClose size={16}/></Flex></Button>
                </Div>
                <Div p={16} lineHeight={25}>
                    <Div mb={12}>
                        <CustomNavLink to={'/about'} onClose={onClose} >{about.name}</CustomNavLink>
                    </Div>
                    <Div mb={12}>
                        <CustomNavLink to={'/checking'} onClose={onClose} >{checking.name}</CustomNavLink>
                        <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                            {checking.desc}
                        </Div>
                    </Div>
                    <Div mb={12}>
                        <CustomNavLink to={'/exchange/swap'}
                                       isActive={() =>{
                                           return match ? true : false
                                       }}
                                       onClose={onClose} >{exchange.name}</CustomNavLink>
                        <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                            {exchange.desc}
                        </Div>
                    </Div>
                    { (properties.isNewIdoExist) ? //new IDO 존재할때만 new출력.
                        <Div mb={12} relative custom={`
                            &::after {
                                content: "NEW";
                                position: absolute;
                                left: 30%;
                                top: 4px;
                                background: ${color.love};
                                color: ${color.white};
                                font-weight: 500;
                                font-size: 10px;
                                border-radius: 4px;
                                padding: 0 5px;
                                line-height: 16px;
                                height: 15px;                
                        `}>
                            <CustomNavLink to={'/iostarter'} onClose={onClose} >{ido.name}</CustomNavLink>
                            <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                                {ido.desc}
                            </Div>
                        </Div>
                        :
                        <Div>
                            <CustomNavLink to={'/iostarter'} onClose={onClose} >{ido.name}</CustomNavLink>
                            <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                                {ido.desc}
                            </Div>
                        </Div>
                    }
                    <Div mb={12}>
                        <CustomNavLink to={'/credit'} onClose={onClose} >{credit.name}</CustomNavLink>
                        <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                            {credit.desc}
                        </Div>
                    </Div>
                    <Div mb={12}>
                        <CustomNavLink to={'/payment'} onClose={onClose} >{payment.name}</CustomNavLink>
                        <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                            {payment.desc}
                        </Div>
                    </Div>
                    <Div>
                        <CustomNavLink to={'/portfolio'} onClose={onClose} >{portfolio.name}</CustomNavLink>
                        <Div fontSize={10} fg={'secondary'} lineHeight={15}>
                            {portfolio.desc}
                        </Div>
                    </Div>

                </Div>

            </Div>
        </Drawer>
    );
};

export default withTranslation()(MenuModal);
