import React, {useState} from 'react';
import {Div, Flex, Button, Fixed} from "~/styledComponents/shared";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {myDonModalState} from "~/hooks/atomState";
import {useRecoilState} from "recoil";
import {withTranslation} from "react-i18next";
import useIWallet from "~/hooks/useIWallet";
import {color} from "~/styledComponents/Properties";

const RoundedButton = styled(Flex)`
    transition: 0.2s;
    border: 1px solid white;
    &:hover {
        transform: scale(1.2);
        // border: 1px solid white;
        // width: 200px;
        // border-radius: 3px;
        // background-color: white;
        // color: black;
        
    }
`;

const MyDon = ({t}) => {

    const [isOpen, setIsOpen] = useRecoilState(myDonModalState)
    const {address} = useIWallet()

    const onClick = () => {

        if (!address) {
            window.$message.warning(t('PleaseConnect'))
            return
        }
        setIsOpen(true)
    }

    return (
        <Fixed m={20} right={0} zIndex={1}>
            <RoundedButton justifyContent={'center'} cursor rounded={'50%'}
                           bg={address ? 'donnie' : 'secondary'}
                           fg={'white'}
                           p={15}
                           fontSize={23}
                           width={60}
                           height={60}
                           onClick={onClick}
            >
                My
            </RoundedButton>
        </Fixed>
    );
};

export default withTranslation()(MyDon);
